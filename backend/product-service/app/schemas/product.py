from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Literal
from app.core.utils import sanitize_string
from decimal import Decimal
from datetime import datetime


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    department: Literal["Womenswear", "Menswear", "Kidswear", "Others"] = "Others"
    image_url: Optional[str] = None
    is_active: bool = True

    @field_validator("name", "slug")
    @classmethod
    def sanitize_cat(cls, v: str) -> str:
        return sanitize_string(v)

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    department: str
    created_at: datetime

    class Config:
        from_attributes = True


# Type Schemas
class TypeBase(BaseModel):
    name: str
    slug: str
    category_id: int
    is_active: bool = True

    @field_validator("name", "slug")
    @classmethod
    def sanitize_type(cls, v: str) -> str:
        return sanitize_string(v)

class TypeCreate(TypeBase):
    pass

class TypeResponse(TypeBase):
    id: int
    created_at: datetime
    category: CategoryResponse

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

    @field_validator("spec_key", "spec_value")
    @classmethod
    def sanitize(cls, v: str) -> str:
        return sanitize_string(v)

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
    type_id: int
    is_active: bool = True

    @field_validator("name", "slug", "brand", "tags", "short_description", "description")
    @classmethod
    def sanitize(cls, v: str) -> str:
        return sanitize_string(v)

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
    type_id: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("name", "slug", "short_description", "description")
    @classmethod
    def sanitize(cls, v: str) -> str:
        return sanitize_string(v)
    variants: Optional[List[VariantCreate]] = None
    specifications: Optional[List[SpecificationCreate]] = None
    media: Optional[List[MediaCreate]] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    type: Optional[TypeResponse] = None
    variants: List[VariantResponse] = []
    specifications: List[SpecificationResponse] = []
    media: List[MediaResponse] = []

    class Config:
        from_attributes = True


# Utility Schema for simple messages
class MessageResponse(BaseModel):
    message: str


class CategoryDistribution(BaseModel):
    category_name: str
    product_count: int


class ProductStatsResponse(BaseModel):
    total_products: int
    category_distribution: List[CategoryDistribution]
