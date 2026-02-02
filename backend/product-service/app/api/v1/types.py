from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.deps import get_db
from app.schemas.product import TypeCreate, TypeResponse
from app.models.product import Type, Product

router = APIRouter()


@router.get("/types", response_model=List[TypeResponse])
def list_types(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List all types, optionally filter by category_id
    """
    query = db.query(Type)
    
    if category_id:
        query = query.filter(Type.category_id == category_id)
    
    types = query.all()
    return types


@router.post("/types", response_model=TypeResponse, status_code=201)
def create_type(
    type_data: TypeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new type
    """
    # Check if slug already exists
    existing = db.query(Type).filter(Type.slug == type_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Type with this slug already exists")
    
    new_type = Type(**type_data.model_dump())
    db.add(new_type)
    db.commit()
    db.refresh(new_type)
    return new_type


@router.delete("/types/{type_id}", status_code=204)
def delete_type(
    type_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a type (only if no products exist under it)
    """
    type_obj = db.query(Type).filter(Type.id == type_id).first()
    if not type_obj:
        raise HTTPException(status_code=404, detail="Type not found")
    
    # Check if any products exist under this type
    product_count = db.query(Product).filter(Product.type_id == type_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete type. {product_count} product(s) exist under this type."
        )
    
    db.delete(type_obj)
    db.commit()
    return None


@router.get("/types/{type_id}", response_model=TypeResponse)
def get_type(
    type_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single type by ID
    """
    type_obj = db.query(Type).filter(Type.id == type_id).first()
    if not type_obj:
        raise HTTPException(status_code=404, detail="Type not found")
    return type_obj
