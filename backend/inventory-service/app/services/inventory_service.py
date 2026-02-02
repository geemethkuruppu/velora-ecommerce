from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy import func
from app.models.inventory import Inventory, InventoryReservation, InventoryEvent
from app.schemas.inventory import InventoryCreate, AddStockRequest, RemoveStockRequest, UpdateStockRequest
import uuid
from typing import Optional
from app.services.notification_service import send_low_stock_alert
import asyncio


# ============ Inventory Management ============

def get_inventory(db: Session, variant_id: int) -> Inventory:
    """Get current inventory state for a product variant."""
    inventory = db.query(Inventory).filter(Inventory.variant_id == variant_id).first()
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory not found for variant {variant_id}"
        )
    return inventory


def initialize_inventory(db: Session, payload: InventoryCreate) -> Inventory:
    """Initialize inventory for a new product variant. Idempotent version."""
    # Check if inventory already exists
    inventory = db.query(Inventory).filter(Inventory.variant_id == payload.variant_id).first()
    
    if inventory:
        # Update if exists (handles resyncs/edits gracefully)
        inventory.variant_sku = payload.variant_sku
        inventory.total_quantity = payload.initial_quantity
        inventory.available_quantity = payload.initial_quantity - inventory.reserved_quantity
    else:
        # Create new inventory record
        inventory = Inventory(
            variant_id=payload.variant_id,
            variant_sku=payload.variant_sku,
            total_quantity=payload.initial_quantity,
            reserved_quantity=0,
            available_quantity=payload.initial_quantity
        )
        db.add(inventory)
    
    db.commit()
    db.refresh(inventory)
    
    # Log event (Auditing)
    log_event(db, "STOCK_ADDED", payload.variant_id, None, payload.initial_quantity)
    
    return inventory


def add_stock(db: Session, payload: AddStockRequest) -> Inventory:
    """Add stock to existing inventory."""
    inventory = get_inventory(db, payload.variant_id)
    
    inventory.total_quantity += payload.quantity
    inventory.available_quantity += payload.quantity
    
    db.commit()
    db.refresh(inventory)
    
    # Log event
    log_event(db, "STOCK_ADDED", payload.variant_id, None, payload.quantity)
    
    return inventory


def remove_stock(db: Session, payload: RemoveStockRequest) -> Inventory:
    """Remove stock from existing inventory manually (Admin)."""
    inventory = get_inventory(db, payload.variant_id)
    
    if inventory.available_quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot remove {payload.quantity} units. Only {inventory.available_quantity} available."
        )
    
    inventory.total_quantity -= payload.quantity
    inventory.available_quantity -= payload.quantity
    
    db.commit()
    db.refresh(inventory)
    
    # Log event
    log_event(db, "STOCK_REMOVED", payload.variant_id, None, payload.quantity)
    
    return inventory


def update_stock(db: Session, payload: UpdateStockRequest) -> Inventory:
    """Update stock to an absolute value manually (Admin)."""
    inventory = get_inventory(db, payload.variant_id)
    
    inventory.total_quantity = payload.quantity
    inventory.available_quantity = payload.quantity - inventory.reserved_quantity
    
    db.commit()
    db.refresh(inventory)
    
    # Log event
    log_event(db, "STOCK_UPDATED", payload.variant_id, None, payload.quantity)
    
    return inventory


def check_availability(db: Session, variant_id: int, quantity: int) -> bool:
    """Check if sufficient stock is available."""
    inventory = get_inventory(db, variant_id)
    return inventory.available_quantity >= quantity


def get_product_stock_sum(db: Session, variant_ids: list[int]) -> int:
    """Get total available stock for a list of variants (one product)."""
    stock_sum = db.query(Inventory).filter(
        Inventory.variant_id.in_(variant_ids)
    ).with_entities(func.sum(Inventory.available_quantity)).scalar()
    return int(stock_sum) if stock_sum else 0


def cleanup_inventory(db: Session, variant_ids: list[int]) -> dict:
    """
    Permanently delete inventory records and reservations for given variants.
    Used during product deletion.
    """
    # 1. Delete Reservations
    db.query(InventoryReservation).filter(
        InventoryReservation.variant_id.in_(variant_ids)
    ).delete(synchronize_session=False)

    # 2. Delete Inventory records
    deleted_count = db.query(Inventory).filter(
        Inventory.variant_id.in_(variant_ids)
    ).delete(synchronize_session=False)

    # 3. Delete Events (optional, but good for clean database)
    db.query(InventoryEvent).filter(
        InventoryEvent.variant_id.in_(variant_ids)
    ).delete(synchronize_session=False)

    db.commit()
    return {"message": f"Successfully cleaned up inventory for {deleted_count} variant(s)"}


# ============ Reservation Management (Saga Pattern) ============

def reserve_stock(db: Session, order_id: uuid.UUID, variant_id: int, quantity: int) -> InventoryReservation:
    """
    Reserve stock for an order (Saga pattern - Step 1).
    Creates ACTIVE reservation and increments reserved_quantity.
    """
    inventory = get_inventory(db, variant_id)
    
    # Check availability
    if inventory.available_quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {inventory.available_quantity}, Requested: {quantity}"
        )
    
    # Update inventory
    inventory.reserved_quantity += quantity
    inventory.available_quantity -= quantity
    
    # Create reservation
    reservation = InventoryReservation(
        order_id=order_id,
        variant_id=variant_id,
        quantity=quantity,
        status="ACTIVE"
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    
    # Log event
    log_event(db, "RESERVED", variant_id, order_id, quantity)
    
    return reservation


def release_reservation(db: Session, order_id: uuid.UUID) -> dict:
    """
    Release reservation (Saga pattern - Compensation).
    Marks reservation as RELEASED and restores available stock.
    Called when payment fails or order is cancelled.
    """
    reservations = db.query(InventoryReservation).filter(
        InventoryReservation.order_id == order_id,
        InventoryReservation.status == "ACTIVE"
    ).all()
    
    if not reservations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active reservations found for order {order_id}"
        )
    
    released_items = []
    
    for reservation in reservations:
        # Get inventory
        inventory = get_inventory(db, reservation.variant_id)
        
        # Restore stock
        inventory.reserved_quantity -= reservation.quantity
        inventory.available_quantity += reservation.quantity
        
        # Update reservation status
        reservation.status = "RELEASED"
        
        # Log event
        log_event(db, "RELEASED", reservation.variant_id, order_id, reservation.quantity)
        
        released_items.append({
            "variant_id": reservation.variant_id,
            "quantity": reservation.quantity
        })
    
    db.commit()
    
    return {
        "message": f"Released {len(released_items)} reservation(s) for order {order_id}",
        "released_items": released_items
    }


def confirm_reservation(db: Session, order_id: uuid.UUID) -> dict:
    """
    Confirm reservation (Saga pattern - Success).
    Marks reservation as CONFIRMED and deducts from total stock.
    Called when order is successfully completed.
    """
    reservations = db.query(InventoryReservation).filter(
        InventoryReservation.order_id == order_id,
        InventoryReservation.status == "ACTIVE"
    ).all()
    
    if not reservations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active reservations found for order {order_id}"
        )
    
    confirmed_items = []
    
    for reservation in reservations:
        # Get inventory
        inventory = get_inventory(db, reservation.variant_id)
        
        # Deduct from total and reserved
        inventory.total_quantity -= reservation.quantity
        inventory.reserved_quantity -= reservation.quantity
        
        # Update reservation status
        reservation.status = "CONFIRMED"
        
        # Log event
        log_event(db, "CONFIRMED", reservation.variant_id, order_id, reservation.quantity)
        
        confirmed_items.append({
            "variant_id": reservation.variant_id,
            "quantity": reservation.quantity
        })
    
    db.commit()
    
    # Check for low stock after confirmation (Async style/Lambda simulation)
    for variant_id in [res.variant_id for res in reservations]:
        _check_and_trigger_alert(db, variant_id)

    return {
        "message": f"Confirmed {len(confirmed_items)} reservation(s) for order {order_id}",
        "confirmed_items": confirmed_items
    }


def _check_and_trigger_alert(db: Session, variant_id: int):
    """Internal helper to trigger alerts if stock is low."""
    inventory = db.query(Inventory).filter(Inventory.variant_id == variant_id).first()
    if inventory and inventory.available_quantity < 5: # Threshold of 5
        # Simulate Lambda: Run in background to not block main thread
        asyncio.create_task(asyncio.to_thread(
            send_low_stock_alert, 
            inventory.variant_sku, 
            inventory.available_quantity
        ))


def get_reservations_by_order(db: Session, order_id: uuid.UUID) -> list[InventoryReservation]:
    """Get all reservations for a specific order."""
    reservations = db.query(InventoryReservation).filter(
        InventoryReservation.order_id == order_id
    ).all()
    
    if not reservations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No reservations found for order {order_id}"
        )
    
    return reservations


# ============ Event Logging ============

def log_event(db: Session, event_type: str, variant_id: int, order_id: Optional[uuid.UUID], quantity: int) -> InventoryEvent:
    """Record an inventory occurrence in the audit log."""
    event = InventoryEvent(
        event_type=event_type,
        variant_id=variant_id,
        order_id=order_id,
        quantity=quantity
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_all_inventory(db: Session, low_stock: bool = False) -> list[Inventory]:
    """Get all inventory items, optionally filtered by low stock."""
    query = db.query(Inventory)
    if low_stock:
        # Assuming low stock is < 10 for example, or based on some rule
        # For now let's say < 5 as per user request
        query = query.filter(Inventory.available_quantity < 5)
    return query.all()


def get_stats(db: Session) -> dict:
    """Get inventory statistics."""
    total_items = db.query(Inventory).count()
    low_stock_count = db.query(Inventory).filter(Inventory.available_quantity < 5).count()
    reserved_items = db.query(Inventory).filter(Inventory.reserved_quantity > 0).count()
    
    return {
        "total_items": total_items,
        "low_stock_count": low_stock_count,
        "reserved_items_count": reserved_items
    }


def get_all_reservations(db: Session) -> list[InventoryReservation]:
    """Get all inventory reservations."""
    return db.query(InventoryReservation).order_by(InventoryReservation.created_at.desc()).all()


def get_events(db: Session) -> list[InventoryEvent]:
    """Get all inventory events."""
    return db.query(InventoryEvent).order_by(InventoryEvent.timestamp.desc()).all()

