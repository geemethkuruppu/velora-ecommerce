from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any
import uuid
from decimal import Decimal

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdateStatus
from app.clients.product_client import ProductClient
from app.clients.inventory_client import InventoryClient
import logging
import asyncio

logger = logging.getLogger(__name__)

class OrderService:
    @staticmethod
    async def create_order(db: Session, user_id: int, payload: OrderCreate) -> Order:
        # 1. Generate ID & Number
        order_id = uuid.uuid4()
        # Simple random order number for now
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # 2. Validate Items & Calculate Total
        total_amount = Decimal("0.00")
        validated_items: List[Dict[str, Any]] = []
        
        # We need to validate all items first before reserving anything
        for item in payload.items:
            # Validate Product & Variant exists
            validation = await ProductClient.validate_variant(item.product_id, item.variant_id)
            if not validation:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid product {item.product_id} or variant {item.variant_id}"
                )
            
            variant = validation['variant']
            product = validation['product']
            
            # Determine price (use override if exists, else base price)
            price = Decimal(str(variant.get('price_override') or product['base_price']))
            
            item_total = price * item.quantity
            total_amount += item_total
            
            validated_items.append({
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "price": price,
                "product_name": product['name'],
                "sku": variant['sku']
            })

        # 3. Reserve Stock (Saga Step)
        reserved_items = []
        
        try:
            for item in validated_items:
                success = await InventoryClient.reserve_stock(
                    order_id=order_id,
                    variant_id=item['variant_id'],
                    quantity=item['quantity']
                )
                
                if not success:
                    raise Exception(f"Failed to reserve stock for variant {item['variant_id']}")
                
                reserved_items.append(item)
                
        except Exception as e:
            logger.error(f"Reservation failed: {e}. Rolling back...")
            # ROLLBACK: Release stock for already reserved items
            # In a real system, we might push this to a queue to ensure it happens
            await InventoryClient.release_stock(order_id)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more items are out of stock. Order cancelled."
            )

        # 4. Create Order in DB
        try:
            db_order = Order(
                id=order_id,
                order_number=order_number,
                user_id=user_id,
                status="CONFIRMED", # Since stock is reserved
                total_amount=total_amount,
                currency="USD",
                shipping_address=payload.shipping_address
            )
            db.add(db_order)
            db.flush()
            
            for item in validated_items:
                db_item = OrderItem(
                    order_id=order_id,
                    product_id=item['product_id'], # Save product_id
                    variant_id=item['variant_id'],
                    product_name=item['product_name'],
                    sku=item['sku'],
                    price=item['price'],
                    quantity=item['quantity']
                )
                db.add(db_item)
            
            db.commit()
            db.refresh(db_order)
            
            return db_order
            
        except Exception as e:
            db.rollback()
            logger.error(f"Database save failed: {e}. Rolling back stock...")
            # Compensation: Release stock
            await InventoryClient.release_stock(order_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order record."
            )

    @staticmethod
    def get_order(db: Session, order_id: uuid.UUID) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    @staticmethod
    def get_user_orders(db: Session, user_id: int) -> List[Order]:
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

    @staticmethod
    def get_all_orders(db: Session) -> List[Order]:
        return db.query(Order).order_by(Order.created_at.desc()).all()

    @staticmethod
    async def cancel_order(db: Session, order_id: uuid.UUID, user_id: int) -> Order:
        order = OrderService.get_order(db, order_id)
        
        # Authorization check
        # Assuming admin check is done in route, or we check if user owns order
        # Here we assume user_id is passed. If 0/Admin, we skip check? 
        # For now strict ownership
        if order.user_id != user_id: # Simple check
             raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

        if order.status not in ["PENDING", "CONFIRMED"]:
            raise HTTPException(status_code=400, detail="Cannot cancel order in current status")
            
        # Release Stock
        success = await InventoryClient.release_stock(order_id)
        if not success:
            logger.warning(f"Stock release warning for order {order_id}")
            # We proceed to cancel anyway, manual intervention might be needed
            
        order.status = "CANCELLED"
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    async def update_status(db: Session, order_id: uuid.UUID, new_status: str) -> Order:
        order = OrderService.get_order(db, order_id)
        
        # Validate status transition (simple check)
        valid_statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]
        if new_status not in valid_statuses:
             raise HTTPException(status_code=400, detail="Invalid status")
             
        # If cancelling via status update, release stock
        if new_status == "CANCELLED" and order.status != "CANCELLED":
            await InventoryClient.release_stock(order_id)
            
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order
