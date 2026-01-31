import httpx
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import logging

# Configure logger
logger = logging.getLogger(__name__)

PRODUCT_SERVICE_URL = "http://localhost:8001/products"  # Direct mount at /products

class ProductClient:
    @staticmethod
    async def validate_product(product_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch product details to validate existence and get current price/name.
        """
        async with httpx.AsyncClient() as client:
            try:
                # Use the detail endpoint: GET /products/{id}
                response = await client.get(f"{PRODUCT_SERVICE_URL}/{product_id}", timeout=5.0)
                
                if response.status_code == 404:
                    return None
                    
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch product {product_id}: {str(e)}")
                # In a strict Saga, network failure might trigger retry or failure
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
