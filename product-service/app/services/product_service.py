from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product, Category, ProductVariant, ProductMedia, ProductSpecification
from app.schemas.product import ProductCreate, ProductUpdate
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

    # 2. Check if category exists
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
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
    
    # 🔥 7. Sync variants to Inventory Service
    for var in payload.variants:
        variant_id = created_variants[var.sku]
        await sync_variant_inventory(
            variant_id=variant_id,
            variant_sku=var.sku,
            initial_quantity=var.stock_quantity  # Use stock from variant
        )
    
    return product


def list_products(db: Session, category_id: int | None = None):
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    return query.all()


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def update_product(db: Session, product: Product, payload: ProductUpdate):
    # Update basic product fields
    update_data = payload.dict(exclude_unset=True, exclude={'variants', 'specifications', 'media'})
    for field, value in update_data.items():
        setattr(product, field, value)

    # Handle variants update if provided
    if hasattr(payload, 'variants') and payload.variants is not None:
        # Delete existing variants
        db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
        # Add new variants
        for var in payload.variants:
            variant = ProductVariant(product_id=product.id, **var.dict())
            db.add(variant)

    # Handle specifications update if provided
    if hasattr(payload, 'specifications') and payload.specifications is not None:
        # Delete existing specifications
        db.query(ProductSpecification).filter(ProductSpecification.product_id == product.id).delete()
        # Add new specifications
        for spec in payload.specifications:
            db.add(ProductSpecification(product_id=product.id, **spec.dict()))

    # Handle media update if provided
    if hasattr(payload, 'media') and payload.media is not None:
        # Delete existing media
        db.query(ProductMedia).filter(ProductMedia.product_id == product.id).delete()
        # Add new media
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


# Category Services
def create_category(db: Session, name: str, slug: str) -> Category:
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    category = Category(name=name, slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def list_categories(db: Session):
    return db.query(Category).all()
