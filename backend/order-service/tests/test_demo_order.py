import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from decimal import Decimal

# --- MOCK MODELS ---

class MockOrder:
    id = "uuid-123"
    order_number = "ORD-001"
    user_id = 1
    total_amount = Decimal("0.00")
    status = "PENDING"
    
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockOrderItem:
    def __init__(self, **kwargs):
        pass

# --- REPLICATED LOGIC (Synchronous for simplified testing) ---

def create_order_logic(db, user_id, payload, mock_product_client):
    # 1. Total & Validation
    total_amount = Decimal("0.00")
    validated_items = []
    
    for item in payload.items:
        # Check Product
        product = mock_product_client.validate_product(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Invalid product {item.product_id}")
        
        # Determine price (Simplified for test)
        price = Decimal(str(product['base_price']))
        
        item_total = price * item.quantity
        total_amount += item_total
        
        validated_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": price
        })
        
    # 2. Save Order
    db_order = MockOrder(
        user_id=user_id,
        total_amount=total_amount,
        status="PENDING_INVENTORY"
    )
    db.add(db_order)
    db.flush() 
    
    # 3. Save Items
    for item in validated_items:
         db.add(MockOrderItem(**item))
         
    db.commit()
    
    # 4. Trigger Inventory (Mocked)
    if not start_inventory_sync(db_order.id):
        db.rollback()
        raise HTTPException(status_code=500, detail="Stock reservation failed")
        
    return db_order

def start_inventory_sync(order_id):
    # Mock function to simulate Event Bus publish
    return True

def can_cancel_order_logic(order_status, order_age_days):
    if order_status == "CANCELLED":
        return False, "Already cancelled"
    
    if order_status in ["SHIPPED", "DELIVERED"]:
        return False, f"Cannot cancel {order_status}"
        
    if order_age_days > 3:
        return False, "Too old to cancel"
        
    return True, ""

# --- TESTS ---

class TestOrderService:
    
    @pytest.fixture
    def mock_db(self):
        return MagicMock()

    @pytest.fixture
    def valid_payload(self):
        item = MagicMock()
        item.product_id = 101
        item.quantity = 2
        
        payload = MagicMock()
        payload.items = [item]
        payload.shipping_address = "123 St"
        return payload

    def test_create_order_success(self, mock_db, valid_payload):
        # Arrange
        mock_product_client = MagicMock()
        mock_product_client.validate_product.return_value = {
            "id": 101, "name": "Test Prod", "base_price": 50.0
        }
        
        # Act
        order = create_order_logic(mock_db, 1, valid_payload, mock_product_client)
        
        # Assert
        assert order.total_amount == 100.0 # 50 * 2
        assert order.status == "PENDING_INVENTORY"
        assert mock_db.add.called

    def test_create_order_invalid_product(self, mock_db, valid_payload):
        # Arrange
        mock_product_client = MagicMock()
        mock_product_client.validate_product.return_value = None # Invalid
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            create_order_logic(mock_db, 1, valid_payload, mock_product_client)
            
        assert exc.value.status_code == 400
        assert "Invalid product" in exc.value.detail

    def test_can_cancel_valid(self):
        can, reason = can_cancel_order_logic("PENDING", 1)
        assert can is True
        assert reason == ""

    def test_can_cancel_shipped(self):
        can, reason = can_cancel_order_logic("SHIPPED", 1)
        assert can is False
        assert "Cannot cancel SHIPPED" in reason

    def test_can_cancel_too_old(self):
        can, reason = can_cancel_order_logic("PENDING", 5) # 5 days old
        assert can is False
        assert "Too old" in reason
