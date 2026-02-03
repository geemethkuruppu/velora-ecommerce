from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.schemas.inventory import EventRequest
from app.services.inventory_service import reserve_stock, release_reservation
from app.core.event_bus import MockEventBus
from app.core.config import settings
import logging
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/events")
async def handle_event(event: EventRequest, db: Session = Depends(get_db)):
    """
    Unified Event Handler for Inventory Service.
    Processes incoming events asynchronously.
    """
    event_type = event.event_type
    payload = event.payload
    
    logger.info(f"📥 Received Event: {event_type}")

    if event_type == "ORDER.CREATED":
        await _handle_order_created(db, payload)
    
    elif event_type == "ORDER.CANCELLED":
        await _handle_order_cancelled(db, payload)
    
    elif event_type == "VARIANT.CREATED":
        from app.services.inventory_service import initialize_inventory
        from app.schemas.inventory import InventoryCreate
        initialize_inventory(db, InventoryCreate(
            variant_id=payload["variant_id"],
            variant_sku=payload["variant_sku"],
            initial_quantity=payload["initial_quantity"]
        ))
        logger.info(f"🆕 Initialized inventory for new variant: {payload['variant_sku']}")

    elif event_type == "PRODUCT.DELETED":
        # Handle bulk cleanup
        variant_ids = payload.get("variant_ids", [])
        from app.services.inventory_service import cleanup_inventory
        cleanup_inventory(db, variant_ids)
        logger.info(f"🧹 Cleaned up inventory for deleted product variants: {variant_ids}")

    return {"status": "event_received"}


async def _handle_order_created(db: Session, payload: dict):
    """
    Event: ORDER.CREATED
    Action: Reserve stock and notify Order Service.
    """
    order_id = uuid.UUID(payload["order_id"])
    items = payload["items"]
    
    try:
        for item in items:
            reserve_stock(
                db, 
                order_id=order_id, 
                variant_id=item["variant_id"], 
                quantity=item["quantity"]
            )
        
        # Success -> Notify Order Service
        await MockEventBus.publish(
            target_url=settings.order_service_url,
            event_type="INVENTORY.RESERVED",
            payload={"order_id": str(order_id)}
        )
        logger.info(f"✅ Order {order_id} stock reserved successfully")

    except Exception as e:
        logger.error(f"❌ Failed to reserve stock for Order {order_id}: {e}")
        # Failure -> Notify Order Service to Cancel
        await MockEventBus.publish(
            target_url=settings.order_service_url,
            event_type="INVENTORY.OUT_OF_STOCK",
            payload={"order_id": str(order_id), "reason": str(e)}
        )


async def _handle_order_cancelled(db: Session, payload: dict):
    """
    Event: ORDER.CANCELLED
    Action: Release stock and notify Order Service.
    """
    order_id = uuid.UUID(payload["order_id"])
    
    try:
        release_reservation(db, order_id=order_id)
        
        # Notify success
        await MockEventBus.publish(
            target_url=settings.order_service_url,
            event_type="INVENTORY.RELEASED",
            payload={"order_id": str(order_id)}
        )
        logger.info(f"🔄 Released stock for cancelled Order {order_id}")
        
    except Exception as e:
        logger.error(f"❌ Failed to release stock for Order {order_id}: {e}")
