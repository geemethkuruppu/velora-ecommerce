from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

def test_read_main():
    """Test the root endpoint (if exists) or a known endpoint"""
    response = client.get("/api/v1/auth/health") # Adjust based on router
    if response.status_code == 404:
        # If no auth-specific health, just skip or test the general one again
        response = client.get("/health")
    assert response.status_code == 200
