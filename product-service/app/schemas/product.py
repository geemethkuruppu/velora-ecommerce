from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Media Schemas
class MediaBase(BaseModel):
    media_type: str
    media_url: str
    is_primary: bool = False

class MediaCreate(MediaBase):
    variant_id: Optional[int] = None

class MediaResponse(MediaBase):
    id: int
    product_id: int
    variant_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# Variant Schemas
class VariantBase(BaseModel):
    sku: str
    color: Optional[str] = None
    size: Optional[str] = None
    price_override: Optional[Decimal] = None
    stock_quantity: int = 0
    is_active: bool = True

class VariantCreate(VariantBase):
    pass

class VariantResponse(VariantBase):
    id: int
    product_id: int
    created_at: datetime
    media: List[MediaResponse] = []

    class Config:
        from_attributes = True


# Specification Schemas
class SpecificationBase(BaseModel):
    spec_key: str
    spec_value: str

class SpecificationCreate(SpecificationBase):
    pass

class SpecificationResponse(SpecificationBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    sku: str
    name: str
    slug: str
    brand: Optional[str] = None
    tags: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    base_price: Decimal
    currency: str = "USD"
    category_id: int
    is_active: bool = True

class ProductCreate(ProductBase):
    variants: Optional[List[VariantCreate]] = []
    specifications: Optional[List[SpecificationCreate]] = []
    media: Optional[List[MediaCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    variants: Optional[List[VariantCreate]] = None
    specifications: Optional[List[SpecificationCreate]] = None
    media: Optional[List[MediaCreate]] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    variants: List[VariantResponse] = []
    specifications: List[SpecificationResponse] = []
    media: List[MediaResponse] = []

    class Config:
        from_attributes = True


# Utility Schema for simple messages
class MessageResponse(BaseModel):
    message: str
