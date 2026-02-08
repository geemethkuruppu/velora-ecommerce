from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.product import Category, Product, Type
from app.db.deps import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    CategoryCreate,
    CategoryResponse,
    MessageResponse,
    ProductStatsResponse
)
from app.services.product_service import (
    create_product,
    list_products,
    get_product,
    update_product,
    deactivate_product,
    activate_product,
    create_category,
    list_categories,
    delete_product,
    get_product_stats
)
from app.clients import inventory_client
from app.api.deps import require_admin
from app.core.config import settings
import logging
import uuid
import os
from app.core.limiter import limiter
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])

class MediaUploadResponse(MessageResponse):
    url: str
@router.post("/upload-media", response_model=MediaUploadResponse)
async def upload_media(file: UploadFile = File(...), _=Depends(require_admin)):
    """Upload a product media file to S3"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"products/{uuid.uuid4()}{file_extension}"
    
    # Initialize S3 client
    s3_client = boto3.client('s3', region_name=settings.aws_region)
    
    try:
        # Ensure file pointer is at the start
        # Binary Integrity Check: Verify file signature
        header = await file.read(4)
        await file.seek(0)
        
        if not (header.startswith(b'\xff\xd8\xff') or # JPEG
                header.startswith(b'\x89PNG') or     # PNG
                header.startswith(b'GIF8') or        # GIF
                header.startswith(b'RIFF')):        # WebP (RIFF container)
            logger.error(f"Binary Integrity Check FAILED. Header: {header.hex()}")
            raise HTTPException(
                status_code=400,
                detail="Invalid image file. Binary data appears corrupted or of an unsupported format."
            )
        logger.info(f"Binary Integrity Check PASSED. Header: {header.hex()}")

        file.file.seek(0)
        
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            settings.s3_bucket_name,
            unique_filename,
            ExtraArgs={
                'ContentType': file.content_type
            }
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 Upload failed: {str(e)}")

    # Construct the public S3 URL
    url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{unique_filename}"
    
    return {"message": "File uploaded successfully", "url": url}


# Product General Endpoints
@router.post("", response_model=ProductResponse)
async def create(payload: ProductCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    """Add a new product with variants, media, and specifications"""
    return await create_product(db, payload)


@router.get("", response_model=list[ProductResponse])
@limiter.limit("120/minute")
def list_all(request: Request, category_id: int | None = None, department: str | None = None, db: Session = Depends(get_db)):
    """List all active products, optionally filtered by category or department"""
    return list_products(db, category_id, department)


# Category Endpoints
@router.post("/categories", response_model=CategoryResponse)
def add_category(
    payload: CategoryCreate, 
    db: Session = Depends(get_db), 
    _=Depends(require_admin)
):
    """Create a new category (Admin only)"""
    return create_category(db, payload.name, payload.slug, payload.department, payload.image_url)


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(department: str | None = Query(None), db: Session = Depends(get_db)):
    """Get all categories, optionally filtered by department"""
    return list_categories(db, department)


@router.get("/stats", response_model=ProductStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get product distribution stats for dashboard"""
    return get_product_stats(db)


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
    
    # Check if any types use this category
    types_count = db.query(Type).filter(Type.category_id == category_id).count()
    if types_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {types_count} type(s) are using this category."
        )
    
    # Cleanup S3 media if it exists
    if category.image_url:
        from app.core.s3_utils import delete_s3_object
        delete_s3_object(category.image_url)
        
    db.delete(category)
    db.commit()
    return None


# Detail Endpoints (Keep at bottom to avoid shadowing)
@router.get("/{product_id}", response_model=ProductResponse)
@limiter.limit("2000/minute")
def get_one(request: Request, product_id: int, db: Session = Depends(get_db)):
    """Get a specific product with all details"""
    return get_product(db, product_id)


@router.get("/{product_id}/stock")
async def get_total_stock(product_id: int, db: Session = Depends(get_db)):
    """Get total stock for all variants of this product"""
    product = get_product(db, product_id)
    variant_ids = [v.id for v in product.variants]
    if not variant_ids:
        return {"total_stock": 0}
    
    total_stock = await inventory_client.check_product_stock(variant_ids)
    return {"total_stock": total_stock}


@router.put("/{product_id}", response_model=ProductResponse)
async def update(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Update general product details"""
    product = get_product(db, product_id)
    return await update_product(db, product, payload)


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
async def delete(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Delete a product permanently with inventory cleanup"""
    product = get_product(db, product_id)
    return await delete_product(db, product)
