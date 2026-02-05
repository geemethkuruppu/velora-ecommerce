from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_login_incorrect_password():
    """
    TEST: Pillar 1 (Security Logic)
    Scenario: User exists but provides incorrect password.
    Expected: HTTP 401 Unauthorized.
    """
    login_data = {
        "username": "testuser@example.com",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    assert "detail" in response.json()
    print("\n✅ SECURITY PROOF: Incorrect password rejected as expected.")

def test_login_user_not_found():
    """
    TEST: Pillar 1 (Security Logic)
    Scenario: User does not exist in the database.
    Expected: HTTP 401 Unauthorized (should not reveal if user exists for security).
    """
    login_data = {
        "username": "ghost_user@example.com",
        "password": "SomePassword123!"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    print("✅ SECURITY PROOF: Non-existent user rejected as expected.")

def test_unauthorized_access_to_me():
    """
    TEST: Pillar 1 (Security Logic)
    Scenario: Accessing protected '/me' endpoint without a token.
    Expected: HTTP 401 Unauthorized.
    """
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    print("✅ SECURITY PROOF: Protected endpoint blocked without token.")
