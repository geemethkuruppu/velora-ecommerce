from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.models.product import Category, Product
from app.db.deps import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
    MessageResponse
)
from app.services.product_service import (
    create_product,
    list_products,
    get_product,
    update_product,
    deactivate_product,
    activate_product,
    create_category,
    list_categories
)
from app.api.deps import require_admin
import os
import shutil
import uuid

router = APIRouter(prefix="/products", tags=["Products"])

class MediaUploadResponse(MessageResponse):
    url: str

@router.post("/upload-media", response_model=MediaUploadResponse)
def upload_media(file: UploadFile = File(...), _=Depends(require_admin)):
    """Upload a product media file"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"uploads/products/{unique_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return full URL (assuming localhost:8001 for now, in prod use env const)
    base_url = "http://localhost:8001"
    url = f"{base_url}/{file_path}"
    
    return {"message": "File uploaded successfully", "url": url}


# Product General Endpoints
@router.post("", response_model=ProductResponse)
async def create(payload: ProductCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    """Add a new product with variants, media, and specifications"""
    return await create_product(db, payload)


@router.get("", response_model=list[ProductResponse])
def list_all(category_id: int | None = None, db: Session = Depends(get_db)):
    """List all active products, optionally filtered by category"""
    return list_products(db, category_id)


# Category Endpoints
@router.post("/categories", response_model=CategoryResponse)
def add_category(
    payload: CategoryCreate, 
    db: Session = Depends(get_db), 
    _=Depends(require_admin)
):
    """Create a new category (Admin only)"""
    return create_category(db, payload.name, payload.slug)


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    return list_categories(db)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """Delete a category (Admin only)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if any products use this category
    products_count = db.query(Product).filter(Product.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {products_count} product(s) are using this category."
        )
    
    db.delete(category)
    db.commit()
    return None


# Detail Endpoints (Keep at bottom to avoid shadowing)
@router.get("/{product_id}", response_model=ProductResponse)
def get_one(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product with all details"""
    return get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Update general product details"""
    product = get_product(db, product_id)
    return update_product(db, product, payload)


@router.patch("/{product_id}/deactivate", response_model=MessageResponse)
def deactivate(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Deactivate a product"""
    product = get_product(db, product_id)
    return deactivate_product(db, product)


@router.patch("/{product_id}/activate", response_model=MessageResponse)
def activate(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Activate a product"""
    product = get_product(db, product_id)
    return activate_product(db, product)


@router.delete("/{product_id}", status_code=204)
def delete(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Delete a product permanently"""
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()
    return None
