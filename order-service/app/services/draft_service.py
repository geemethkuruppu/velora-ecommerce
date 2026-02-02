from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
import uuid
from decimal import Decimal

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdateStatus
from app.clients.product_client import ProductClient
from app.clients.inventory_client import InventoryClient
import logging

logger = logging.getLogger(__name__)

class OrderService:
    @staticmethod
    async def create_order(db: Session, user_id: int, payload: OrderCreate) -> Order:
        # 1. Generate ID & Number
        order_id = uuid.uuid4()
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # 2. Validate Items & Calculate Total
        total_amount = Decimal("0.00")
        validated_items = []
        
        for item in payload.items:
            # Validate Product/Variant
            # We assume frontend sends the correct structure. 
            # Ideally frontend sends { "variant_id": 1, "quantity": 2 }
            # But we might need product_id too. 
            # Wait, our OrderItemCreate only has variant_id.
            # We need to find product_id from variant_id or assuming variant_id is unique enough.
            # ProductClient.validate_variant usually needs product_id.
            # BUT: InventoryService tracks by variant_id.
            # Let's adjust: ProductService typically exposes GET /variants/{id} or we search.
            # For now, let's assume we can fetch variant info directly or search.
            # actually ProductClient.validate_variant(product_id, variant_id) might be hard if we don't have product_id.
            # Let's assume for this MVP we fetch product by variant?
            # Or simpler: The input payload should probably have product_id too?
            # The user request input was: { "product_id": 101, "quantity": 2 } - actually this looks like product level.
            # But we shifted to variants.
            # Let's assume the input is correct and we can validation.
            # For THIS implementation, I'll fetch the product details using the VARIANT ID if possible?
            # No, Product Service API structure usually is /products/{id}.
            # I might need to ask Product Service logic.
            # Let's assume we fetch product details by finding which product has this variant (inefficient) or
            # Assuming payload HAS variant_id, and we can't easily validate without product_id
            # UNLESS ProductService has an endpoint to get variant by ID.
            # ...
            # Let's simplify:
            # We will use ProductClient to get details. 
            # I will assume we might need to modify OrderCreate to include product_id OR
            # Just implement a simplified validation: Call Inventory first? No, need price.
            # Let's assume we can get variant details.
            
            # Correction: User Requirement said "product_id" in input.
            # { "product_id": 101, "quantity": 2 }
            # Since we moved to Variants, this is ambiguous.
            # If product has no variants (simple product), product_id is enough.
            # If product has variants, we strictly need variant_id.
            # Given the previous task enforced Variants, I will enforce variant_id.
            
            # Let's assume we pass variant_id.
            # How to get Price?
            # We need to call Product Service.
            pass

        # REVISITING STRATEGY:
        # I'll implement a helper in ProductClient to "get_variant_details(variant_id)".
        # Use that to get price/name.
        
        # ... logic continues in actual file ...
        pass
