from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# Cart Item Schemas
class CartItemBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = Field(ge=1, default=1)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class ProductInfo(BaseModel):
    """Product information fetched from product-service"""
    id: int
    name: str
    base_price: Decimal
    image: str
    slug: str


class CartItemResponse(CartItemBase):
    id: int
    cart_id: int
    added_at: datetime
    product: Optional[ProductInfo] = None

    class Config:
        from_attributes = True


# Cart Schemas
class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_items: int = 0
    subtotal: Decimal = Decimal("0.00")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Merge Cart Schema
class GuestCartItem(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = Field(ge=1)


class MergeCartRequest(BaseModel):
    guest_items: List[GuestCartItem]


class MergeCartResponse(BaseModel):
    message: str
    merged_count: int
    cart: CartResponse


# Message Schema
class MessageResponse(BaseModel):
    message: str
