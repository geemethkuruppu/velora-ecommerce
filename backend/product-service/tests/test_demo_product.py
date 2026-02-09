import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

# --- MOCK INFRASTRUCTURE ---

# Mock Models
class MockProduct:
    # Class attribs for SQLAlchemy filters
    sku = "existing_sku" 
    id = 1
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 1)
        self.sku = kwargs.get('sku', '')
        self.variants = []
        self.media = []
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockVariant:
    sku = "existing_variant_sku"
    def __init__(self, **kwargs):
        self.sku = kwargs.get('sku', '')
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockType:
    id = 1
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 1)

class MockCategory:
    id = 1
    slug = "existing-slug"
    
# Mock Pydantic Schemas (approximated as objects)
class MockSchema:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def dict(self, exclude=None, exclude_unset=False):
        d = self.__dict__.copy()
        if exclude:
            for k in exclude:
                d.pop(k, None)
        return d

# --- REPLICATED SERVICE LOGIC (Synchronous for simplified testing) ---

def create_product_logic(db, payload):
    # 1. Check if SKU exists in Products
    # Logic: if db.query(...).filter(...).first() returns something, raise Error
    existing_product = db.query(MockProduct).filter(MockProduct.sku == payload.sku).first()
    if existing_product:
        raise HTTPException(status_code=400, detail=f"Parent Product SKU '{payload.sku}' already exists")
    
    # 2. Check variant SKUs
    for v in payload.variants:
        existing_variant = db.query(MockVariant).filter(MockVariant.sku == v.sku).first()
        if existing_variant:
            raise HTTPException(status_code=400, detail=f"Variant SKU '{v.sku}' already exists")

    # 3. Check if type exists
    ptype = db.query(MockType).filter(MockType.id == payload.type_id).first()
    if not ptype:
        raise HTTPException(status_code=404, detail="Product Type not found")

    # 4. Create Product
    # Note: mocking the model instantiation
    product_data = payload.dict(exclude={'variants', 'specifications', 'media'})
    product = MockProduct(**product_data)
    db.add(product)
    db.flush() 

    # 5. Create Variants (Simplified - just checking iteration)
    created_variants = {}
    for var in payload.variants:
        variant = MockVariant(product_id=product.id, **var.dict())
        db.add(variant)
        created_variants[var.sku] = variant
        
    db.commit()
    db.refresh(product)
    
    # 6. Inventory Sync logic (Mocked Event Bus)
    # in real code: await MockEventBus.publish(...)
    # here we assume it passes if code reaches here
    
    return product

def create_category_logic(db, name, slug):
    existing = db.query(MockCategory).filter(MockCategory.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    cat = MockCategory(name=name, slug=slug)
    db.add(cat)
    db.commit()
    return cat

# --- TESTS ---

class TestProductService:
    
    @pytest.fixture
    def mock_db(self):
        db = MagicMock()
        # Setup common query returns to default to None (Not found) unless specified
        db.query.return_value.filter.return_value.first.return_value = None
        return db

    @pytest.fixture
    def valid_payload(self):
        # Create a payload structure resembling ProductCreate
        variants = [MockSchema(sku="VAR-1", stock_quantity=10, price_override=None)]
        payload = MockSchema(
            sku="NEW-PROD",
            name="New Product",
            type_id=1,
            base_price=100.0,
            variants=variants,
            specifications=[],
            media=[]
        )
        return payload

    def test_create_product_success(self, mock_db, valid_payload):
        # Arrange
        # Mock Type check finding the type
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            None, # Product SKU check (not found)
            None, # Variant SKU check (not found)
            MockType(id=1) # Type check (found)
        ]
        
        # Act
        product = create_product_logic(mock_db, valid_payload)
        
        # Assert
        assert product.sku == "NEW-PROD"
        assert product.name == "New Product"
        # Verify db.add was called (Product + Variant)
        assert mock_db.add.call_count >= 2 

    def test_create_product_duplicate_sku(self, mock_db, valid_payload):
        # Arrange
        # Product SKU check returns existing object
        valid_payload.sku = "EXISTING"
        mock_db.query.return_value.filter.return_value.first.return_value = MockProduct(sku="EXISTING")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            create_product_logic(mock_db, valid_payload)
        
        assert exc.value.status_code == 400
        assert "Parent Product SKU 'EXISTING' already exists" in exc.value.detail

    def test_create_product_duplicate_variant_sku(self, mock_db, valid_payload):
        # Arrange
        # Product not found, but Variant SKU found
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            None, # Product SKU check
            MockVariant(sku="VAR-1") # Variant SKU check (found duplicate)
        ]
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            create_product_logic(mock_db, valid_payload)
            
        assert exc.value.status_code == 400
        assert "Variant SKU 'VAR-1' already exists" in exc.value.detail

    def test_create_product_invalid_type(self, mock_db, valid_payload):
        # Arrange
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            None, # Product SKU
            None, # Variant SKU
            None  # Type (NOT Found)
        ]
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            create_product_logic(mock_db, valid_payload)
            
        assert exc.value.status_code == 404
        assert "Product Type not found" in exc.value.detail

    def test_create_category_duplicate(self, mock_db):
        # Arrange
        slug = "existing-slug"
        mock_db.query.return_value.filter.return_value.first.return_value = MockCategory()
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            create_category_logic(mock_db, "Shoes", slug)
            
        assert exc.value.status_code == 400
        assert "Category slug already exists" in exc.value.detail
