import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

# --- MOCK MODELS ---

class MockInventory:
    variant_id = 1
    variant_sku = "SKU-1"
    total_quantity = 100
    reserved_quantity = 0
    available_quantity = 100
    
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockReservation:
    order_id = "uuid-1"
    variant_id = 1
    quantity = 1
    status = "ACTIVE"
    
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockPayload:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

# --- REPLICATED LOGIC (Isolated) ---

def initialize_inventory_logic(db, payload):
    # Idempotent init
    inventory = db.query(MockInventory).filter(MockInventory.variant_id == payload.variant_id).first()
    
    if inventory:
        inventory.total_quantity = payload.initial_quantity
        inventory.available_quantity = payload.initial_quantity - inventory.reserved_quantity
    else:
        inventory = MockInventory(
            variant_id=payload.variant_id,
            total_quantity=payload.initial_quantity,
            available_quantity=payload.initial_quantity,
            reserved_quantity=0
        )
        db.add(inventory)
        
    db.commit()
    return inventory

def reserve_stock_logic(db, order_id, variant_id, quantity):
    # 1. Check existing
    existing = db.query(MockReservation).filter(
        MockReservation.order_id == order_id,
        MockReservation.variant_id == variant_id
    ).first()
    
    if existing:
        return existing

    # 2. Get Inventory
    inventory = db.query(MockInventory).filter(MockInventory.variant_id == variant_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    # 3. Check availability
    if inventory.available_quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # 4. Update
    inventory.reserved_quantity += quantity
    inventory.available_quantity -= quantity
    
    # 5. Create reservation
    res = MockReservation(order_id=order_id, variant_id=variant_id, quantity=quantity)
    db.add(res)
    db.commit()
    return res

def add_stock_logic(db, variant_id, quantity):
    inventory = db.query(MockInventory).filter(MockInventory.variant_id == variant_id).first()
    if not inventory:
         raise HTTPException(status_code=404, detail="Inventory not found")
         
    inventory.total_quantity += quantity
    inventory.available_quantity += quantity
    db.commit()
    return inventory

# --- TESTS ---

class TestInventoryService:
    
    @pytest.fixture
    def mock_db(self):
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        return db

    def test_initialize_new_inventory(self, mock_db):
        # Arrange
        payload = MockPayload(variant_id=1, initial_quantity=10)
        mock_db.query.return_value.filter.return_value.first.return_value = None # New
        
        # Act
        inv = initialize_inventory_logic(mock_db, payload)
        
        # Assert
        assert inv.total_quantity == 10
        assert mock_db.add.called

    def test_reserve_stock_success(self, mock_db):
        # Arrange
        # 1. No existing reservation
        # 2. Inventory exists with 10 units
        inv = MockInventory(variant_id=1, available_quantity=10, reserved_quantity=0)
        
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            None, # Existing reservation check
            inv   # Inventory check
        ]
        
        # Act
        res = reserve_stock_logic(mock_db, "ord-1", 1, 5)
        
        # Assert
        assert res.quantity == 5
        assert inv.available_quantity == 5 # 10 - 5
        assert inv.reserved_quantity == 5

    def test_reserve_stock_insufficient(self, mock_db):
        # Arrange
        inv = MockInventory(available_quantity=2) # Only 2 available
        
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            None, 
            inv
        ]
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            reserve_stock_logic(mock_db, "ord-1", 1, 5) # Want 5
            
        assert exc.value.status_code == 400
        assert "Insufficient stock" in exc.value.detail

    def test_reserve_stock_idempotency(self, mock_db):
        # Arrange
        # Existing reservation found
        existing = MockReservation(quantity=5)
        mock_db.query.return_value.filter.return_value.first.return_value = existing
        
        # Act
        res = reserve_stock_logic(mock_db, "ord-1", 1, 5)
        
        # Assert
        assert res == existing
        assert not mock_db.add.called # Should not create new one

    def test_add_stock(self, mock_db):
        # Arrange
        inv = MockInventory(total_quantity=10, available_quantity=5)
        mock_db.query.return_value.filter.return_value.first.return_value = inv
        
        # Act
        updated = add_stock_logic(mock_db, 1, 20)
        
        # Assert
        assert updated.total_quantity == 30 # 10 + 20
        assert updated.available_quantity == 25 # 5 + 20
