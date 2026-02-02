from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product, Category, Type, ProductVariant, ProductMedia, ProductSpecification
from app.schemas.product import ProductCreate, ProductUpdate
from app.clients import inventory_client
from app.clients.inventory_client import sync_variant_inventory
import asyncio


async def create_product(db: Session, payload: ProductCreate) -> Product:
    # 1. Check if SKU exists in Products or Variants
    existing_product = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Parent Product SKU '{payload.sku}' already exists"
        )
    
    # Check variant SKUs
    for v in payload.variants:
        existing_variant = db.query(ProductVariant).filter(ProductVariant.sku == v.sku).first()
        if existing_variant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Variant SKU '{v.sku}' already exists"
            )

    # 2. Check if type exists
    ptype = db.query(Type).filter(Type.id == payload.type_id).first()
    if not ptype:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product Type not found"
        )

    # 3. Create Product
    product_data = payload.dict(exclude={'variants', 'specifications', 'media'})
    product = Product(**product_data)
    db.add(product)
    db.flush()  # To get product.id

    # 4. Create Specifications
    for spec in payload.specifications:
        db.add(ProductSpecification(product_id=product.id, **spec.dict()))

    # 5. Create Variants
    created_variants = {}
    for var in payload.variants:
        variant = ProductVariant(product_id=product.id, **var.dict())
        db.add(variant)
        db.flush()
        created_variants[var.sku] = variant.id

    # 6. Create Media
    for med in payload.media:
        # If media is for a variant, it should have a variant_id in the payload
        # or we might need a mapping. Usually, media without variant_id is for the product.
        db.add(ProductMedia(product_id=product.id, **med.dict()))

    db.commit()
    db.refresh(product)
    
    # 🔥 7. Sync variants to Inventory Service (Event-Driven)
    for var in payload.variants:
        variant_id = created_variants[var.sku]
        await MockEventBus.publish(
            target_url=settings.inventory_service_url,
            event_type="VARIANT.CREATED",
            payload={
                "variant_id": variant_id,
                "variant_sku": var.sku,
                "initial_quantity": var.stock_quantity
            }
        )
    
    return product


def list_products(db: Session, category_id: int | None = None, department: str | None = None):
    query = db.query(Product)
    if category_id:
        query = query.join(Type).filter(Type.category_id == category_id)
    if department:
        # Join Product -> Type -> Category to filter by department
        if not category_id: # Avoid multiple joins if already joined
            query = query.join(Type)
        query = query.join(Category).filter(Category.department == department)
        
    return query.all()


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


async def update_product(db: Session, product: Product, payload: ProductUpdate):
    # Update basic product fields
    update_data = payload.dict(exclude_unset=True, exclude={'variants', 'specifications', 'media'})
    for field, value in update_data.items():
        setattr(product, field, value)

    # Handle variants update if provided
    if hasattr(payload, 'variants') and payload.variants is not None:
        existing_variants = {v.sku: v for v in product.variants}
        incoming_skus = {var.sku for var in payload.variants}
        
        # 1. Delete variants not in payload
        for sku, variant in list(existing_variants.items()):
            if sku not in incoming_skus:
                # Trigger inventory cleanup for this specific variant
                await MockEventBus.publish(
                    target_url=settings.inventory_service_url,
                    event_type="PRODUCT.DELETED",
                    payload={"variant_ids": [variant.id]}
                )
                db.delete(variant)
                del existing_variants[sku]

        # 2. Update existing or create new
        for var in payload.variants:
            if var.sku in existing_variants:
                # Update existing
                variant = existing_variants[var.sku]
                for field, value in var.dict(exclude_unset=True).items():
                    setattr(variant, field, value)
            else:
                # Create new
                variant = ProductVariant(product_id=product.id, **var.dict())
                db.add(variant)
                db.flush() # Get ID
                
                # Sync new variant
                await MockEventBus.publish(
                    target_url=settings.inventory_service_url,
                    event_type="VARIANT.CREATED",
                    payload={
                        "variant_id": variant.id,
                        "variant_sku": variant.sku,
                        "initial_quantity": variant.stock_quantity
                    }
                )

    # Handle specifications update if provided
    if hasattr(payload, 'specifications') and payload.specifications is not None:
        # For simplicity, we keep delete-and-recreate for specs as they don't have IDs used elsewhere
        db.query(ProductSpecification).filter(ProductSpecification.product_id == product.id).delete()
        for spec in payload.specifications:
            db.add(ProductSpecification(product_id=product.id, **spec.dict()))

    # Handle media update if provided
    if hasattr(payload, 'media') and payload.media is not None:
        # Same for media
        db.query(ProductMedia).filter(ProductMedia.product_id == product.id).delete()
        for med in payload.media:
            db.add(ProductMedia(product_id=product.id, **med.dict()))

    db.commit()
    db.refresh(product)
    return product



def deactivate_product(db: Session, product: Product):
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}


def activate_product(db: Session, product: Product):
    product.is_active = True
    db.commit()
    return {"message": "Product activated"}


from app.core.event_bus import MockEventBus
from app.core.config import settings

async def delete_product(db: Session, product: Product):
    """
    Delete product and its variants from local DB.
    Triggers asynchronous cleanup in Inventory Service via Event Bus.
    """
    variant_ids = [v.id for v in product.variants]
    
    # 1. Trigger Async Cleanup
    if variant_ids:
        await MockEventBus.publish(
            target_url=settings.inventory_service_url,
            event_type="PRODUCT.DELETED",
            payload={"variant_ids": variant_ids}
        )
    
    # 2. Local Cleanup (SQLAlchemy cascades should handle variants, media, specs)
    db.delete(product)
    db.commit()
    return {"message": "Product and associated inventory deleted successfully"}


def get_product_stats(db: Session):
    """
    Get product statistics for dashboard.
    """
    from sqlalchemy import func
    from app.models.product import Category, Product, Type
    
    total_products = db.query(Product).count()
    
    # Get distribution by category
    # Join Product -> Type -> Category
    dist = db.query(
        Category.name,
        func.count(Product.id)
    ).join(Type, Type.category_id == Category.id)\
     .join(Product, Product.type_id == Type.id)\
     .group_by(Category.name).all()
     
    category_distribution = [
        {"category_name": name, "product_count": count}
        for name, count in dist
    ]
    
    return {
        "total_products": total_products,
        "category_distribution": category_distribution
    }


# Category Services
def create_category(db: Session, name: str, slug: str, department: str = "Others") -> Category:
    # DEBUG LOG
    with open("category_debug.log", "a") as f:
        f.write(f"Creating category: name={name}, slug={slug}, department={department}\n")
    
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        with open("category_debug.log", "a") as f:
            f.write(f"Error: Slug '{slug}' already exists\n")
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    try:
        category = Category(name=name, slug=slug, department=department)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    except Exception as e:
        with open("category_debug.log", "a") as f:
            f.write(f"Database Error: {str(e)}\n")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def list_categories(db: Session, department: str | None = None):
    query = db.query(Category)
    if department:
        query = query.filter(Category.department == department)
    return query.all()
