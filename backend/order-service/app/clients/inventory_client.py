import httpx
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import uuid
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Configure logger
logger = logging.getLogger(__name__)

from app.core.config import settings

INVENTORY_SERVICE_URL = f"{settings.inventory_service_url}/inventory"
from app.core.logging_utils import correlation_id_ctx

def get_headers():
    return {"X-Correlation-ID": correlation_id_ctx.get() or ""}

class InventoryClient:
    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)),
        reraise=False
    )
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
                    headers=get_headers(),
                    timeout=5.0
                )
                
                # Check for transient server errors (502, 503, 504) to trigger retry
                if response.status_code in [502, 503, 504]:
                    response.raise_for_status()

                if response.status_code == 200:
                    return True
                
                # If 400, it means insufficient stock or other logic error - NO RETRY
                error_detail = response.text
                logger.warning(f"Stock reservation failed for order {order_id}: {error_detail}")
                return False
                
            except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                logger.error(f"Transient error connecting to Inventory Service: {str(e)}. Retrying...")
                raise # Re-raise to trigger tenacity retry
            except httpx.HTTPError as e:
                logger.error(f"Non-transient Inventory Service error: {str(e)}")
                return False

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)),
        reraise=False
    )
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
                    headers=get_headers(),
                    timeout=5.0
                )
                
                if response.status_code in [502, 503, 504]:
                    response.raise_for_status()

                return response.status_code == 200
            except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                logger.error(f"Transient error releasing stock for {order_id}: {e}. Retrying...")
                raise
            except Exception as e:
                logger.error(f"Failed to release stock for {order_id}: {e}")
                return False

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)),
        reraise=False
    )
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
                    headers=get_headers(),
                    timeout=5.0
                )

                if response.status_code in [502, 503, 504]:
                    response.raise_for_status()

                return response.status_code == 200
            except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                logger.error(f"Transient error confirming stock for {order_id}: {e}. Retrying...")
                raise
            except Exception as e:
                logger.error(f"Failed to confirm stock for {order_id}: {e}")
                return False
