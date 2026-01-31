from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import uuid

# Item Schemas
class OrderItemBase(BaseModel):
    product_id: int
    variant_id: int
    quantity: int = Field(gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    product_id: int
    product_name: str
    sku: str
    price: Decimal
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str = Field(..., min_length=5)

class OrderUpdateStatus(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    user_id: int
    status: str
    total_amount: Decimal
    currency: str
    shipping_address: str
    created_at: datetime
    updated_at: Optional[datetime]
    customer_name: Optional[str] = None
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
