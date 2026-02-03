from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any
import uuid
from decimal import Decimal

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdateStatus
from app.clients.product_client import ProductClient
from app.clients.inventory_client import InventoryClient
from app.core.event_bus import MockEventBus
from app.core.config import settings
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
        
        try:
            # We need to validate all items first before reserving anything
            for item in payload.items:
                # If variant_id is None, validate product and use first variant
                if item.variant_id is None:
                    product = await ProductClient.validate_product(item.product_id)
                    if not product:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid product {item.product_id}"
                        )
                    
                    # Use first variant if available
                    variants = product.get('variants', [])
                    if not variants:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Product {item.product_id} has no variants"
                        )
                    
                    variant = variants[0]
                    # Update item.variant_id for inventory reservation
                    item.variant_id = variant['id']
                else:
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
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(f"Validation failed: {type(e).__name__}: {str(e)}")
            logger.error(f"Traceback: {error_trace}")
            
            if isinstance(e, HTTPException):
                logger.error(f"HTTPException detail: {e.detail}")
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e) or f"Validation failed: {type(e).__name__}"
            )

        # 3. Create Order in DB (Status: PENDING_INVENTORY)
        try:
            db_order = Order(
                id=order_id,
                order_number=order_number,
                user_id=user_id,
                status="PENDING_INVENTORY",
                total_amount=total_amount,
                currency="USD",
                shipping_address=payload.shipping_address
            )
            db.add(db_order)
            db.flush()
            
            for item in validated_items:
                db_item = OrderItem(
                    order_id=order_id,
                    product_id=item['product_id'],
                    variant_id=item['variant_id'],
                    product_name=item['product_name'],
                    sku=item['sku'],
                    price=item['price'],
                    quantity=item['quantity']
                )
                db.add(db_item)
            
            db.commit()
            db.refresh(db_order)

            # 4. Trigger Asynchronous Stock Reservation (Event-Driven)
            await MockEventBus.publish(
                target_url=settings.inventory_service_url,
                event_type="ORDER.CREATED",
                payload={
                    "order_id": str(order_id),
                    "items": [
                        {"variant_id": item['variant_id'], "quantity": item['quantity']}
                        for item in validated_items
                    ]
                }
            )
            
            return db_order
            
        except Exception as e:
            db.rollback()
            error_msg = f"Database save failed: {str(e)}"
            logger.error(error_msg)
            # Compensation: Release stock (if it were actually reserved, but we use MockEventBus AFTER)
            # await InventoryClient.release_stock(order_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_msg
            )

    @staticmethod
    def get_order(db: Session, order_id: uuid.UUID) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    @staticmethod
    async def get_user_orders(db: Session, user_id: int) -> List[Order]:
        orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
        
        # Collect all unique product IDs across all orders
        product_ids = set()
        for order in orders:
            for item in order.items:
                product_ids.add(item.product_id)
        
        # Fetch all product details in parallel
        async def fetch_product(pid):
            try:
                # Use validate_product as it already has retries and circuit breaker
                return pid, await ProductClient.validate_product(pid)
            except Exception as e:
                logger.error(f"Error fetching product {pid} for order enrichment: {str(e)}")
                return pid, None

        tasks = [fetch_product(pid) for pid in product_ids]
        if tasks:
            product_results = await asyncio.gather(*tasks, return_exceptions=True)
            # Filter out exceptions from results (they should have been caught but just in case)
            product_map = {}
            for res in product_results:
                if isinstance(res, tuple) and len(res) == 2:
                    pid, data = res
                    product_map[pid] = data
        else:
            product_map = {}

        # Enrich order items from the map
        for order in orders:
            for item in order.items:
                product = product_map.get(item.product_id)
                if product and product.get('media'):
                    # Get primary or first image
                    media_list = product['media']
                    primary = next((m for m in media_list if m.get('is_primary')), media_list[0] if media_list else None)
                    item.image_url = primary.get('media_url') if primary else None
                else:
                    item.image_url = None
        
        # Add cancellation status to each order
        for order in orders:
            can_cancel, reason = OrderService.can_cancel_order(order)
            order.can_cancel = can_cancel
            order.cancel_reason = reason if not can_cancel else None
        
        return orders

    @staticmethod
    def get_all_orders(db: Session) -> List[Order]:
        return db.query(Order).order_by(Order.created_at.desc()).all()

    @staticmethod
    def can_cancel_order(order: Order) -> tuple[bool, str]:
        """
        Check if an order can be cancelled.
        Returns (can_cancel: bool, reason: str)
        """
        from datetime import datetime, timedelta, timezone
        
        # Check if already cancelled
        if order.status == "CANCELLED":
            return False, "This order has already been cancelled."
        
        # Check if order is in a non-cancellable status
        if order.status in ["SHIPPED", "DELIVERED"]:
            return False, f"This order cannot be cancelled as it has already been {order.status.lower()}."
        
        # Check 3-day window
        now = datetime.now(timezone.utc)
        order_age = now - order.created_at
        if order_age > timedelta(days=3):
            return False, "This order cannot be cancelled. Orders can only be cancelled within 3 days of placement."
        
        return True, ""

    @staticmethod
    async def cancel_order(db: Session, order_id: uuid.UUID, user_id: int) -> Order:
        order = OrderService.get_order(db, order_id)
        
        # Authorization check - ensure user owns the order
        if order.user_id != user_id:
            raise HTTPException(status_code=403, detail="You are not authorized to cancel this order.")
        
        # Check if order can be cancelled
        can_cancel, reason = OrderService.can_cancel_order(order)
        if not can_cancel:
            raise HTTPException(status_code=400, detail=reason)
            
        # Phase 1: Move to CANCEL_PENDING
        # This ensures that even if we crash mid-process, we know this order is in limbo.
        order.status = "CANCEL_PENDING"
        db.commit()
        db.refresh(order)
        logger.info(f"Order {order_id} marked as CANCEL_PENDING. Starting inventory release.")
            
        # Phase 2: Release Stock
        try:
            # InventoryClient.release_stock already has 3 retries with exponential backoff
            success = await InventoryClient.release_stock(order_id)
            if not success:
                logger.error(f"❌ Critical: Stock release failed for order {order_id} after all retries. Order remains in CANCEL_PENDING.")
                raise HTTPException(
                    status_code=503, 
                    detail="Failed to release inventory stock. Please try again later. Your order is marked for cancellation."
                )
        except Exception as e:
            logger.error(f"❌ Error during stock release for order {order_id}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred during stock release: {str(e)}"
            )
            
        # Phase 3: Finalize Cancellation
        order.status = "CANCELLED"
        db.commit()
        db.refresh(order)
        
        logger.info(f"Order {order_id} cancelled successfully by user {user_id}")
        return order

    @staticmethod
    async def update_status(db: Session, order_id: uuid.UUID, new_status: str) -> Order:
        order = OrderService.get_order(db, order_id)
        
        # Validate status transition (simple check)
        valid_statuses = ["PENDING", "PENDING_INVENTORY", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "CANCEL_PENDING"]
        if new_status not in valid_statuses:
             raise HTTPException(status_code=400, detail="Invalid status")
             
        # If cancelling via status update, release stock
        if new_status == "CANCELLED" and order.status != "CANCELLED":
            await InventoryClient.release_stock(order_id)
            
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order
    @staticmethod
    def get_stats(db: Session) -> Dict[str, Any]:
        """
        Calculate order statistics for dashboard.
        """
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # 1. Total Revenue & Orders (only for non-cancelled orders)
        stats = db.query(
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("count")
        ).filter(Order.status != "CANCELLED").first()

        total_revenue = stats.revenue or Decimal("0.00")
        total_orders = stats.count or 0

        # 2. Monthly Revenue History (Last 6 months)
        history = []
        for i in range(5, -1, -1):
            date = datetime.now() - timedelta(days=i*30)
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i > 0:
                month_end = (month_start + timedelta(days=32)).replace(day=1)
            else:
                month_end = datetime.now() + timedelta(days=1)

            month_stats = db.query(
                func.sum(Order.total_amount).label("revenue"),
                func.count(Order.id).label("count")
            ).filter(
                Order.created_at >= month_start,
                Order.created_at < month_end,
                Order.status != "CANCELLED"
            ).first()

            history.append({
                "month": month_start.strftime("%B"),
                "revenue": month_stats.revenue or Decimal("0.00"),
                "orders": month_stats.count or 0
            })

        # 3. Monthly Growth (Simplified comparison)
        current_month = history[-1]['revenue']
        prev_month = history[-2]['revenue'] if len(history) > 1 else Decimal("0.01")
        if prev_month == 0: prev_month = Decimal("0.01")
        growth = float((current_month - prev_month) / prev_month * 100)

        return {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "monthly_growth": round(growth, 2),
            "revenue_history": history
        }
