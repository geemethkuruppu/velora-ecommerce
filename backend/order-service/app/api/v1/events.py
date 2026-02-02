from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.schemas.order import EventRequest
from app.models.order import Order
import logging
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/events")
async def handle_event(event: EventRequest, db: Session = Depends(get_db)):
    """
    Unified Event Handler for Order Service.
    Processes results from Inventory Service.
    """
    event_type = event.event_type
    payload = event.payload
    
    logger.info(f"📥 Received Event: {event_type}")

    if event_type == "INVENTORY.RESERVED":
        await _update_order_status(db, payload["order_id"], "CONFIRMED")
    
    elif event_type == "INVENTORY.OUT_OF_STOCK":
        await _update_order_status(db, payload["order_id"], "CANCELLED", f"Inventory Issue: {payload.get('reason')}")

    elif event_type == "INVENTORY.RELEASED":
        await _update_order_status(db, payload["order_id"], "CANCELLED")

    return {"status": "event_received"}


async def _update_order_status(db: Session, order_id_str: str, status: str, log_msg: str = None):
    """Internal helper to update order status based on event."""
    try:
        order_id = uuid.UUID(order_id_str)
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            db.commit()
            logger.info(f"📈 Order {order_id} status updated to {status}")
            if log_msg:
                logger.warning(f"📝 Reason: {log_msg}")
        else:
            logger.error(f"❌ Order {order_id_str} not found in database")
    except Exception as e:
        logger.error(f"❌ Failed to update order status for {order_id_str}: {e}")
