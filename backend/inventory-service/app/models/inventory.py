from sqlalchemy import Column, String, Integer, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Inventory(Base):
    """
    Represents current stock state per product variant.
    Maintains 1:1 relationship with product_variants from Product Service.
    """
    __tablename__ = "inventory"

    variant_id = Column(Integer, primary_key=True)  # References product_variants.id
    variant_sku = Column(String, nullable=False, index=True)  # For reference/debugging
    total_quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class InventoryReservation(Base):
    """
    Tracks which order reserved which stock.
    Enables compensation (release stock) and auditing.
    Maintains 1:many relationship with inventory.
    """
    __tablename__ = "inventory_reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    variant_id = Column(Integer, nullable=False, index=True)  # References product_variants.id
    quantity = Column(Integer, nullable=False)
    status = Column(
        String(20), 
        nullable=False, 
        default="ACTIVE"
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('ACTIVE', 'RELEASED', 'CONFIRMED')",
            name="check_reservation_status"
        ),
    )


class InventoryEvent(Base):
    """
    Event tracking / auditing table (bonus marks).
    Records all inventory state changes for debugging and compliance.
    """
    __tablename__ = "inventory_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(
        String(20), 
        nullable=False
    )
    variant_id = Column(Integer, nullable=False, index=True)  # References product_variants.id
    order_id = Column(UUID(as_uuid=True), nullable=True)
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('RESERVED', 'RELEASED', 'CONFIRMED', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_UPDATED')",
            name="check_event_type"
        ),
    )
