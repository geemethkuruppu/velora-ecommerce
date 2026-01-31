from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.inventory import Inventory, InventoryReservation, InventoryEvent
from app.schemas.inventory import InventoryCreate, AddStockRequest
import uuid
from typing import Optional


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
    """Initialize inventory for a new product variant."""
    # Check if inventory already exists
    existing = db.query(Inventory).filter(Inventory.variant_id == payload.variant_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inventory already exists for variant {payload.variant_id}"
        )
    
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
    
    # Log event
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


def check_availability(db: Session, variant_id: int, quantity: int) -> bool:
    """Check if sufficient stock is available."""
    inventory = get_inventory(db, variant_id)
    return inventory.available_quantity >= quantity


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
    
    return {
        "message": f"Confirmed {len(confirmed_items)} reservation(s) for order {order_id}",
        "confirmed_items": confirmed_items
    }


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

