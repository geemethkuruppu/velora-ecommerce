"""
Client for communicating with the Inventory Service.
Handles stock synchronization between Product and Inventory services.
"""

import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)
from app.core.config import settings

INVENTORY_SERVICE_URL = settings.inventory_service_url


async def sync_variant_inventory(variant_id: int, variant_sku: str, initial_quantity: int = 0) -> Optional[dict]:
    """
    Initialize inventory for a new variant in Inventory Service.
    Called when creating a new product variant.
    
    Args:
        variant_id: Product variant ID
        variant_sku: Variant SKU for reference
        initial_quantity: Initial stock quantity
        
    Returns:
        Inventory data or None if failed
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/inventory/variant",
                json={
                    "variant_id": variant_id,
                    "variant_sku": variant_sku,
                    "initial_quantity": initial_quantity
                },
                timeout=5.0
            )
            response.raise_for_status()
            logger.info(f"✅ Synced inventory for variant {variant_id} (SKU: {variant_sku})")
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to sync inventory for variant {variant_id}: {e}")
            return None


async def get_variant_stock(variant_id: int) -> Optional[int]:
    """
    Get current available stock from Inventory Service.
    
    Args:
        variant_id: Product variant ID
        
    Returns:
        Available quantity or None if failed
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/inventory/variant/{variant_id}",
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            return data.get("available_quantity", 0)
        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to get inventory for variant {variant_id}: {e}")
            return None


async def add_variant_stock(variant_id: int, quantity: int) -> Optional[dict]:
    """
    Add stock to existing variant inventory.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/inventory/add-stock",
                json={
                    "variant_id": variant_id,
                    "quantity": quantity
                },
                timeout=5.0
            )
            response.raise_for_status()
            logger.info(f"✅ Added {quantity} stock to variant {variant_id}")
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to add stock for variant {variant_id}: {e}")
            return None


async def check_product_stock(variant_ids: list[int]) -> int:
    """
    Get total stock for a list of variants.
    Used for warning before product deletion.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/inventory/bulk-stock-check",
                json={"variant_ids": variant_ids},
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            return data.get("total_stock", 0)
        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to bulk check stock: {e}")
            return 0


async def cleanup_product_inventory(variant_ids: list[int]) -> bool:
    """
    Call inventory service to wipe variants.
    In production, this would be a background task or Lambda trigger.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/inventory/cleanup",
                json={"variant_ids": variant_ids},
                timeout=10.0
            )
            response.raise_for_status()
            logger.info(f"✅ Cleaned up inventory for {len(variant_ids)} variants")
            return True
        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to cleanup inventory: {e}")
            return False
