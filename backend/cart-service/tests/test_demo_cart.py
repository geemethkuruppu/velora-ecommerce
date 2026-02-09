import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from decimal import Decimal

# --- MOCK MODELS ---

class MockCart:
    id = 1
    user_id = 1
    created_at = "2023-01-01"
    updated_at = "2023-01-01"
    
    def __init__(self, user_id=1, id=1):
        self.user_id = user_id
        self.id = id

class MockCartItem:
    id = 100
    cart_id = 1
    product_id = 10
    variant_id = 5
    quantity = 1
    added_at = "2023-01-01"
    
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockProductInfo:
    def __init__(self, id, name, base_price):
        self.id = id
        self.name = name
        self.base_price = base_price

class MockCartItemResponse:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

# --- REPLICATED LOGIC (Isolated) ---

def get_or_create_cart_logic(db, user_id):
    cart = db.query(MockCart).filter(MockCart.user_id == user_id).first()
    if not cart:
        cart = MockCart(user_id=user_id)
        db.add(cart)
        db.flush() # Mock flush to assign ID
        db.refresh(cart)
    return cart

def add_to_cart_logic(db, user_id, item_data, mock_fetch_product_info):
    # 1. Get Cart
    cart = get_or_create_cart_logic(db, user_id)
    
    # 2. Check existing item
    existing_item = db.query(MockCartItem).filter(
        MockCartItem.cart_id == cart.id,
        MockCartItem.product_id == item_data.product_id,
        MockCartItem.variant_id == item_data.variant_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item_data.quantity
        cart_item = existing_item
    else:
        cart_item = MockCartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            variant_id=item_data.variant_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
    
    db.commit()
    
    # 3. Fetch Info (Mocked)
    product_info = mock_fetch_product_info(cart_item.product_id)
    
    return MockCartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        product=product_info
    )

def remove_from_cart_logic(db, user_id, item_id):
    cart = get_or_create_cart_logic(db, user_id)
    
    cart_item = db.query(MockCartItem).filter(
        MockCartItem.id == item_id,
        MockCartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()

# --- TESTS ---

class TestCartService:
    
    @pytest.fixture
    def mock_db(self):
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        return db

    @pytest.fixture
    def item_data(self):
        data = MagicMock()
        data.product_id = 10
        data.variant_id = 5
        data.quantity = 2
        return data

    def test_get_or_create_cart_new(self, mock_db):
        # Arrange: No cart exists
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        # Act
        cart = get_or_create_cart_logic(mock_db, user_id=1)
        
        # Assert
        assert cart.user_id == 1
        assert mock_db.add.called

    def test_get_or_create_cart_existing(self, mock_db):
        # Arrange: Cart exists
        existing_cart = MockCart(user_id=1, id=99)
        mock_db.query.return_value.filter.return_value.first.return_value = existing_cart
        
        # Act
        cart = get_or_create_cart_logic(mock_db, user_id=1)
        
        # Assert
        assert cart.id == 99
        assert not mock_db.add.called

    def test_add_to_cart_new_item(self, mock_db, item_data):
        # Arrange
        # 1. Cart exists
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            MockCart(id=1),  # get_or_create_cart
            None             # existing_item check (Not found)
        ]
        
        mock_fetch = MagicMock(return_value=MockProductInfo(10, "Test Product", 100))

        # Act
        response = add_to_cart_logic(mock_db, 1, item_data, mock_fetch)
        
        # Assert
        assert response.quantity == 2
        assert response.product.name == "Test Product"
        assert mock_db.add.called # Added new item

    def test_add_to_cart_existing_item(self, mock_db, item_data):
        # Arrange
        # 1. Cart exists
        # 2. Item exists with qty=1
        existing_item = MockCartItem(quantity=1)
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            MockCart(id=1),
            existing_item
        ]
        
        mock_fetch = MagicMock()

        # Act
        response = add_to_cart_logic(mock_db, 1, item_data, mock_fetch)
        
        # Assert
        # 1 (existing) + 2 (new) = 3
        assert response.quantity == 3 
        # ensure NOT added again
        assert not mock_db.add.called 

    def test_remove_from_cart_success(self, mock_db):
        # Arrange
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            MockCart(id=1),
            MockCartItem(id=100)
        ]
        
        # Act
        remove_from_cart_logic(mock_db, 1, 100)
        
        # Assert
        assert mock_db.delete.called

    def test_remove_from_cart_not_found(self, mock_db):
        # Arrange
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            MockCart(id=1),
            None # Item not found
        ]
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            remove_from_cart_logic(mock_db, 1, 999)
        
        assert exc.value.status_code == 404
