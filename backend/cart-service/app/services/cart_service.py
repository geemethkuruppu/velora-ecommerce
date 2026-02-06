from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List, Optional
from decimal import Decimal
import httpx

from app.models.cart import Cart, CartItem
from app.schemas.cart import (
    CartItemCreate, CartItemUpdate, CartResponse, 
    CartItemResponse, ProductInfo, GuestCartItem
)
from app.core.config import settings
from app.core.logging_utils import correlation_id_ctx

async def fetch_product_info(product_id: int) -> Optional[ProductInfo]:
    """Fetch product information from product-service"""
    url = f"{settings.product_service_url}/products/{product_id}"
    print(f"DEBUG: Attempting to fetch product {product_id} from {url}")
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                url,
                headers={"X-Correlation-ID": correlation_id_ctx.get() or ""},
                timeout=10.0
            )
            print(f"DEBUG: Product Service Response Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                # Transform to match ProductInfo schema
                return ProductInfo(
                    id=data['id'],
                    name=data['name'],
                    base_price=Decimal(str(data['base_price'])),
                    image=data.get('media', [{}])[0].get('media_url', '') if data.get('media') else '',
                    slug=data['slug']
                )
            else:
                print(f"ERROR: Product Service returned {response.status_code} for product {product_id} at {url}")
                if response.status_code == 429:
                    print(f"CRITICAL: Rate limited by Product Service! Internal calls are being blocked.")
                print(f"Response Detail: {response.text}")
    except httpx.ConnectError:
        print(f"CRITICAL ERROR: Could not connect to Product Service at {url}")
    except httpx.TimeoutException:
        print(f"ERROR: Timeout while fetching product {product_id} from {url}")
    except Exception as e:
        print(f"Error fetching product {product_id}: {type(e).__name__}: {e}")
    return None


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    """Get existing cart or create new one for user"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


async def get_cart(db: Session, user_id: int) -> CartResponse:
    """Get user's cart with product information"""
    cart = get_or_create_cart(db, user_id)
    
    # Explicitly query items to avoid lazy load issues in async context
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    # Fetch product info for each cart item
    items_with_products = []
    subtotal = Decimal("0.00")
    total_items = 0
    
    for item in cart_items:
        product_info = await fetch_product_info(item.product_id)
        item_response = CartItemResponse(
            id=item.id,
            cart_id=item.cart_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            added_at=item.added_at,
            product=product_info
        )
        items_with_products.append(item_response)
        
        if product_info:
            subtotal += product_info.base_price * item.quantity
        total_items += item.quantity
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=items_with_products,
        total_items=total_items,
        subtotal=subtotal,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )



async def add_to_cart(
    db: Session, 
    user_id: int, 
    item_data: CartItemCreate
) -> CartItemResponse:
    """Add item to cart or update quantity if exists"""
    print(f"DEBUG: add_to_cart called for user_id={user_id}, product_id={item_data.product_id}")
    cart = get_or_create_cart(db, user_id)
    print(f"DEBUG: Cart ID: {cart.id}")
    
    # Check if item already exists
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id,
        CartItem.variant_id == item_data.variant_id
    ).first()
    
    if existing_item:
        print("DEBUG: Item exists, updating quantity")
        # Update quantity
        existing_item.quantity += item_data.quantity
        db.commit()
        db.refresh(existing_item)
        cart_item = existing_item
    else:
        print("DEBUG: New item, creating")
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            variant_id=item_data.variant_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        try:
            db.commit()
            print("DEBUG: Commit successful")
            db.refresh(cart_item)
        except IntegrityError as e:
            print(f"DEBUG: IntegrityError: {e}")
            db.rollback()
            raise HTTPException(status_code=400, detail="Failed to add item to cart")
    
    # Fetch product info
    product_info = await fetch_product_info(cart_item.product_id)
    print(f"DEBUG: Fetched product info: {product_info}")
    
    return CartItemResponse(
        id=cart_item.id,
        cart_id=cart_item.cart_id,
        product_id=cart_item.product_id,
        variant_id=cart_item.variant_id,
        quantity=cart_item.quantity,
        added_at=cart_item.added_at,
        product=product_info
    )


def update_cart_item(
    db: Session,
    user_id: int,
    item_id: int,
    update_data: CartItemUpdate
) -> CartItem:
    """Update cart item quantity"""
    cart = get_or_create_cart(db, user_id)
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item.quantity = update_data.quantity
    db.commit()
    db.refresh(cart_item)
    
    return cart_item


def remove_from_cart(db: Session, user_id: int, item_id: int) -> None:
    """Remove item from cart"""
    cart = get_or_create_cart(db, user_id)
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()


def clear_cart(db: Session, user_id: int) -> None:
    """Clear all items from cart"""
    cart = get_or_create_cart(db, user_id)
    
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()


async def merge_guest_cart(
    db: Session,
    user_id: int,
    guest_items: List[GuestCartItem]
) -> CartResponse:
    """Merge guest cart items with user's cart"""
    cart = get_or_create_cart(db, user_id)
    merged_count = 0
    
    for guest_item in guest_items:
        # Check if item already exists in user's cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == guest_item.product_id,
            CartItem.variant_id == guest_item.variant_id
        ).first()
        
        if existing_item:
            # Sum quantities
            existing_item.quantity += guest_item.quantity
            merged_count += 1
        else:
            # Add new item
            new_item = CartItem(
                cart_id=cart.id,
                product_id=guest_item.product_id,
                variant_id=guest_item.variant_id,
                quantity=guest_item.quantity
            )
            db.add(new_item)
            merged_count += 1
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to merge cart")
    
    # Return updated cart
    return await get_cart(db, user_id)
