from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import require_admin
from app.schemas.inventory import (
    InventoryCreate,
    InventoryResponse,
    AddStockRequest,
    RemoveStockRequest,
    UpdateStockRequest,
    ReserveStockRequest,
    ReleaseReservationRequest,
    ConfirmReservationRequest,
    ReservationResponse,
    MessageResponse,
    CleanupRequest
)
from app.services.inventory_service import (
    get_inventory,
    initialize_inventory,
    add_stock,
    remove_stock,
    update_stock,
    reserve_stock,
    release_reservation,
    confirm_reservation,
    get_reservations_by_order,
    get_all_inventory,
    get_stats,
    get_all_reservations,
    get_events,
    cleanup_inventory,
    get_product_stock_sum
)
import uuid


router = APIRouter(prefix="/inventory", tags=["Inventory"])


# ============ Inventory Management Endpoints ============

@router.get("/variant/{variant_id}", response_model=InventoryResponse)
def get_inventory_status(variant_id: int, db: Session = Depends(get_db)):
    """
    Get current inventory status for a product variant.
    Returns total, reserved, and available quantities.
    """
    return get_inventory(db, variant_id)


@router.post("/variant", response_model=InventoryResponse)
def create_inventory(
    payload: InventoryCreate, 
    db: Session = Depends(get_db)
):
    """
    Initialize inventory for a new product variant.
    Called by Product Service when creating variants.
    Sets initial stock quantity.
    """
    return initialize_inventory(db, payload)


@router.post("/add-stock", response_model=InventoryResponse)
def add_stock_to_inventory(
    payload: AddStockRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """
    Add stock to existing inventory (Admin only).
    Increases total and available quantities.
    """
    return add_stock(db, payload)


@router.post("/remove-stock", response_model=InventoryResponse)
def remove_stock_from_inventory(
    payload: RemoveStockRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """
    Remove stock from existing inventory (Admin only).
    Decreases total and available quantities.
    """
    return remove_stock(db, payload)


@router.post("/update-stock", response_model=InventoryResponse)
def update_stock_inventory(
    payload: UpdateStockRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """
    Update stock to an absolute value (Admin only).
    Sets total and adjusts available quantities.
    """
    return update_stock(db, payload)


# ============ Reservation Endpoints (Saga Pattern) ============

@router.post("/reserve", response_model=ReservationResponse)
def reserve_inventory(
    payload: ReserveStockRequest,
    db: Session = Depends(get_db)
):
    """
    Reserve stock for an order (Saga Step 1).
    Creates ACTIVE reservation and decrements available stock.
    Called by Order Service when creating an order.
    """
    return reserve_stock(db, payload.order_id, payload.variant_id, payload.quantity)


@router.post("/release")
def release_inventory(
    payload: ReleaseReservationRequest,
    db: Session = Depends(get_db)
):
    """
    Release reservation (Saga Compensation).
    Marks reservation as RELEASED and restores available stock.
    Called when payment fails or order is cancelled.
    """
    return release_reservation(db, payload.order_id)


@router.post("/confirm")
def confirm_inventory(
    payload: ConfirmReservationRequest,
    db: Session = Depends(get_db)
):
    """
    Confirm reservation (Saga Success).
    Marks reservation as CONFIRMED and deducts from total stock.
    Called when order is successfully completed.
    """
    return confirm_reservation(db, payload.order_id)


# ============ Coordinated Cleanup Endpoints ============

@router.post("/bulk-stock-check")
def check_variants_stock(
    payload: CleanupRequest,
    db: Session = Depends(get_db)
):
    """
    Get total available stock for a list of variants.
    Used by Product Service to warn user before deletion.
    """
    stock = get_product_stock_sum(db, payload.variant_ids)
    return {"total_stock": stock}


@router.post("/cleanup")
def cleanup_variants_inventory(
    payload: CleanupRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """
    Wipe all inventory data for given variants.
    Called by Product Service (or Lambda) after product deletion.
    """
    return cleanup_inventory(db, payload.variant_ids)


@router.delete("/variant/{variant_id}", status_code=204)
def delete_variant_inventory(
    variant_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    """
    Delete individual variant inventory record.
    """
    db.query(Inventory).filter(Inventory.variant_id == variant_id).delete()
    db.commit()
    return None


    return get_reservations_by_order(db, order_id)


# ============ New Dashboard Endpoints ============

@router.get("", response_model=list[InventoryResponse])
def get_all_inventory_items(
    low_stock: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all inventory items.
    Optional 'low_stock' filter.
    """
    items = get_all_inventory(db, low_stock)
    
    # Enrichment
    from app.clients.product_client import ProductClient
    variant_map = ProductClient.get_all_products()
    
    for item in items:
        item.product_name = variant_map.get(item.variant_id, f"Variant #{item.variant_id}")
        # Note: 'item' is an ORM object. 
        # Pydantic response model will pick up the attribute if we set it.
        # But sqlalchemy objects might strict on attributes.
        # It's safer to not modify ORM object if it doesn't have the field.
        # BUT, since we defined product_name in response model, we can try.
        # If SQLAlchemy complains, we might need convert to dict or add dummy column.
        # Better approach: The response model handles conversion. We can attach attribute dynamically to ORM instance in Python.
        setattr(item, 'product_name', variant_map.get(item.variant_id, f"Variant #{item.variant_id}"))

    return items


@router.get("/stats")
def get_inventory_stats(db: Session = Depends(get_db)):
    """
    Get inventory dashboard stats.
    Returns: total_items, low_stock_count, reserved_items_count
    """
    return get_stats(db)


@router.get("/reservations", response_model=list[ReservationResponse])
def get_all_reservations_list(db: Session = Depends(get_db)):
    """
    Get all reservations (sorted by newest).
    """
    return get_all_reservations(db)


@router.get("/events")  # , response_model=list[EventResponse]) # Need Schema for this
def get_all_events_list(db: Session = Depends(get_db)):
    """
    Get all inventory events (sorted by newest).
    """
    return get_events(db)

