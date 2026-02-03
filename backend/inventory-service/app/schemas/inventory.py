from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


# ============ Base Schemas ============

class MessageResponse(BaseModel):
    message: str


# ============ Inventory Schemas ============

class InventoryBase(BaseModel):
    variant_id: int
    variant_sku: str
    total_quantity: int = Field(ge=0)
    reserved_quantity: int = Field(ge=0, default=0)
    available_quantity: int = Field(ge=0, default=0)


class InventoryCreate(BaseModel):
    variant_id: int
    variant_sku: str
    initial_quantity: int = Field(ge=0, default=0)


class InventoryUpdate(BaseModel):
    total_quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)
    available_quantity: Optional[int] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    last_updated: datetime
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============ Stock Management Schemas ============

class AddStockRequest(BaseModel):
    variant_id: int
    quantity: int = Field(gt=0, description="Quantity to add (must be positive)")


class RemoveStockRequest(BaseModel):
    variant_id: int
    quantity: int = Field(gt=0, description="Quantity to remove (must be positive)")


class UpdateStockRequest(BaseModel):
    variant_id: int
    quantity: int = Field(ge=0, description="New absolute quantity (must be 0 or more)")


class ReserveStockRequest(BaseModel):
    order_id: uuid.UUID
    variant_id: int
    quantity: int = Field(gt=0, description="Quantity to reserve")


class ReleaseReservationRequest(BaseModel):
    order_id: uuid.UUID


class ConfirmReservationRequest(BaseModel):
    order_id: uuid.UUID


# ============ Reservation Schemas ============

class ReservationBase(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    variant_id: int
    quantity: int
    status: str
    created_at: datetime


class ReservationResponse(ReservationBase):
    class Config:
        from_attributes = True


# ============ Event Schemas ============

class EventBase(BaseModel):
    event_type: str
    variant_id: int
    order_id: Optional[uuid.UUID] = None
    quantity: int
    timestamp: datetime


class EventResponse(EventBase):
    id: uuid.UUID

    class Config:
        from_attributes = True


class CleanupRequest(BaseModel):
    variant_ids: list[int]


class EventRequest(BaseModel):
    event_type: str
    payload: dict
