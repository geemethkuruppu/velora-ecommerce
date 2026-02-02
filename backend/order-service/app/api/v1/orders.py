from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.deps import get_db
# We reuse deps from other services or create new ones. 
# Creating minimal deps here for auth placeholder
from app.api.deps import get_current_user
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus, OrderStatsResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new order.
    Orchestrates validation and stock reservation.
    """
    user_id = int(current_user["id"])
    return await OrderService.create_order(db, user_id, payload)

@router.get("", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user) # In real app, ensure admin
):
    """
    Get all orders (Admin).
    """
    orders = OrderService.get_all_orders(db)
    
    # Enrichment: Fetch user names
    from app.clients.user_client import UserClient
    user_map = UserClient.get_all_users()
    
    for order in orders:
        order.customer_name = user_map.get(order.user_id, f"User #{order.user_id}")
        
    return orders

@router.get("/stats", response_model=OrderStatsResponse)
def get_order_stats(
    db: Session = Depends(get_db)
):
    """
    Get order dashboard stats (Admin).
    """
    return OrderService.get_stats(db)

@router.get("/my", response_model=List[OrderResponse])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user's order history.
    """
    user_id = int(current_user["id"])
    return await OrderService.get_user_orders(db, user_id)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get order details by ID.
    Enforces ownership check.
    """
    order = OrderService.get_order(db, order_id)
    # Check ownership
    user_id = int(current_user["id"])
    # If not owner and not admin... (Admin check skipped for brevity)
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel an order.
    Releases reserved stock.
    """
    user_id = int(current_user["id"])
    return await OrderService.cancel_order(db, order_id, user_id)

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(
    order_id: uuid.UUID,
    payload: OrderUpdateStatus,
    db: Session = Depends(get_db),
    # _=Depends(require_admin) # Uncomment when admin auth ready
):
    """
    Update order status (Admin only).
    """
    return await OrderService.update_status(db, order_id, payload.status)
