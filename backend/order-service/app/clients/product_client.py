import httpx
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Configure logger
logger = logging.getLogger(__name__)

from app.core.config import settings

PRODUCT_SERVICE_URL = f"{settings.product_service_url}/products"
from app.core.logging_utils import correlation_id_ctx

def get_headers():
    return {"X-Correlation-ID": correlation_id_ctx.get() or ""}

import time

class ProductClient:
    # Circuit Breaker State
    _failure_count = 0
    _last_failure_time = 0
    _state = "CLOSED" # CLOSED, OPEN, HALF-OPEN
    _threshold = 10
    _reset_timeout = 10 # Seconds

    @staticmethod
    def _check_circuit():
        if ProductClient._state == "OPEN":
            if time.time() - ProductClient._last_failure_time > ProductClient._reset_timeout:
                ProductClient._state = "HALF-OPEN"
                logger.info("Circuit Breaker: Transitioning to HALF-OPEN")
            else:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Product Service is currently unavailable (Circuit Breaker OPEN)"
                )

    @staticmethod
    def _on_success():
        ProductClient._failure_count = 0
        ProductClient._state = "CLOSED"

    @staticmethod
    def _on_failure():
        ProductClient._failure_count += 1
        ProductClient._last_failure_time = time.time()
        if ProductClient._failure_count >= ProductClient._threshold:
            ProductClient._state = "OPEN"
            logger.error(f"Circuit Breaker: Transitioning to OPEN after {ProductClient._failure_count} failures")

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError)),
        reraise=True 
    )
    async def validate_product(product_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch product details with Circuit Breaker and Retries.
        """
        ProductClient._check_circuit()

        # Robust URL construction: handle cases where base URL might already include '/products'
        base_url = settings.product_service_url.rstrip('/')
        if not base_url.endswith('/products'):
            url = f"{base_url}/products/{product_id}"
        else:
            url = f"{base_url}/{product_id}"

        async with httpx.AsyncClient(trust_env=False, follow_redirects=True) as client:
            try:
                logger.info(f"Attempting GET request to: {url}")
                response = await client.get(
                    url,
                    headers=get_headers(),
                    timeout=10.0
                )
                logger.info(f"Response from Product Service: {response.status_code}")
                
                if response.status_code == 404:
                    ProductClient._on_success()
                    return None
                    
                response.raise_for_status()
                ProductClient._on_success()
                return response.json()
            except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                ProductClient._on_failure()
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code not in [502, 503, 504]:
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Product Service error: {str(e)}"
                    )
                raise 
            except Exception as e:
                ProductClient._on_failure()
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Product Service unavailable: {str(e)}"
                )

    @staticmethod
    async def validate_variant(product_id: int, variant_id: int) -> Optional[Dict[str, Any]]:
        """
        Validate that a variant belongs to a product and exists.
        Product Service response includes variants list.
        """
        product = await ProductClient.validate_product(product_id)
        if not product:
            return None
            
        # Find variant in product['variants']
        variants = product.get('variants', [])
        variant = next((v for v in variants if v['id'] == variant_id), None)
        
        if not variant:
            return None
            
        return {
            "product": product,
            "variant": variant
        }
