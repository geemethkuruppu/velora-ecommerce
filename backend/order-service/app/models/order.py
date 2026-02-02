from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import uuid

class Order(Base):
    """
    Represents a customer order.
    Status flow: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED (or CANCELLED)
    """
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # From Auth Service
    
    status = Column(
        String(20), 
        nullable=False, 
        default="PENDING"
    )
    
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    shipping_address = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'PENDING_INVENTORY', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')",
            name="check_order_status"
        ),
    )


class OrderItem(Base):
    """
    Individual items in an order.
    Stores SNAPSHOT of product details at time of purchase.
    """
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    
    product_id = Column(Integer, nullable=False) # Added product_id
    variant_id = Column(Integer, nullable=False)  # Product Variant ID
    
    # Snapshot data (Historical accuracy)
    product_name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    
    quantity = Column(Integer, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
