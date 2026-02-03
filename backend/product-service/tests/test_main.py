from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    assert response.json()["service"] == "product-service"

def test_list_products():
    """Test listing products (even if empty)"""
    response = client.get("/api/v1/products")
    # Should be 200 even if empty list
    assert response.status_code == 200
    assert isinstance(response.json(), list)
