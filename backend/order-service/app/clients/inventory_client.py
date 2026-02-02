import httpx
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import uuid
import logging

# Configure logger
logger = logging.getLogger(__name__)

from app.core.config import settings

INVENTORY_SERVICE_URL = f"{settings.inventory_service_url}/inventory"

class InventoryClient:
    @staticmethod
    async def reserve_stock(order_id: uuid.UUID, variant_id: int, quantity: int) -> bool:
        """
        Reserve stock for an order (Saga Step 1).
        """
        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "order_id": str(order_id),
                    "variant_id": variant_id,
                    "quantity": quantity
                }
                
                response = await client.post(
                    f"{INVENTORY_SERVICE_URL}/reserve", 
                    json=payload,
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return True
                
                # If 400, it means insufficient stock or other logic error
                error_detail = response.text
                logger.warning(f"Stock reservation failed for order {order_id}: {error_detail}")
                return False
                
            except httpx.HTTPError as e:
                logger.error(f"Inventory Service communication failed: {str(e)}")
                # If we cannot reach Inventory, we assumes reservation failed
                return False

    @staticmethod
    async def release_stock(order_id: uuid.UUID) -> bool:
        """
        Release stock (Saga Compensation).
        Called when order creation fails or is cancelled.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{INVENTORY_SERVICE_URL}/release",
                    json={"order_id": str(order_id)},
                    timeout=5.0
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Failed to release stock for {order_id}: {e}")
                # We might want to enqueue this for retry in a real system
                return False

    @staticmethod
    async def confirm_stock(order_id: uuid.UUID) -> bool:
        """
        Confirm stock (Saga Completion).
        Called when order is successfully placed/paid.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{INVENTORY_SERVICE_URL}/confirm",
                    json={"order_id": str(order_id)},
                    timeout=5.0
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Failed to confirm stock for {order_id}: {e}")
                return False
