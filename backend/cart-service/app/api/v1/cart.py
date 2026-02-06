from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.schemas.cart import (
    CartResponse, CartItemCreate, CartItemResponse,
    CartItemUpdate, MessageResponse, MergeCartRequest, MergeCartResponse
)
from app.services import cart_service
from app.core.limiter import limiter

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user's cart with all items"""
    return await cart_service.get_cart(db, user_id)


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def add_to_cart(
    request: Request,
    item: CartItemCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add item to cart or update quantity if exists"""
    print(f"DEBUG: API received add_to_cart request: user_id={user_id}, item={item}")
    return await cart_service.add_to_cart(db, user_id, item)


@router.put("/items/{item_id}", response_model=MessageResponse)
def update_cart_item(
    item_id: int,
    update_data: CartItemUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_service.update_cart_item(db, user_id, item_id, update_data)
    return MessageResponse(message="Cart item updated successfully")


@router.delete("/items/{item_id}", response_model=MessageResponse)
def remove_from_cart(
    item_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_service.remove_from_cart(db, user_id, item_id)
    return MessageResponse(message="Item removed from cart")


@router.delete("/clear", response_model=MessageResponse)
def clear_cart(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Clear all items from cart"""
    cart_service.clear_cart(db, user_id)
    return MessageResponse(message="Cart cleared successfully")


@router.post("/merge", response_model=MergeCartResponse)
@limiter.limit("10/minute")
async def merge_guest_cart(
    request: Request,
    merge_data: MergeCartRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Merge guest cart with user's cart on login"""
    merged_cart = await cart_service.merge_guest_cart(
        db, user_id, merge_data.guest_items
    )
    return MergeCartResponse(
        message="Cart merged successfully",
        merged_count=len(merge_data.guest_items),
        cart=merged_cart
    )
