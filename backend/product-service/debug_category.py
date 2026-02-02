import requests
import json

# We need a token. Let's try to login as the super admin.
AUTH_URL = "http://127.0.0.1:8000/api/v1/auth/login"
PRODUCT_URL = "http://127.0.0.1:8001/api/v1/products/categories"

login_payload = {
    "username": "geemeth@gmail.com",
    "password": "VeloraDB2026!"
}

try:
    auth_resp = requests.post(AUTH_URL, data=login_payload) # OAuth2 uses form data
    token = auth_resp.json().get("access_token")
    print(f"Auth Success: {token is not None}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Try to create a category that might fail
    # Example: "Shoes" under Menswear with slug "men-shoes" (already exists)
    payload = {
        "name": "Luxury Shoes",
        "slug": "men-shoes", 
        "department": "Menswear"
    }

    resp = requests.post(PRODUCT_URL, json=payload, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

    # Try another one with unique slug but maybe wrong department case
    payload2 = {
        "name": "Test Cat",
        "slug": "unique-test-slug", 
        "department": "menswear" # should fail validation (lowercase)
    }
    resp2 = requests.post(PRODUCT_URL, json=payload2, headers=headers)
    print(f"Status 2: {resp2.status_code}")
    print(f"Response 2: {resp2.text}")

except Exception as e:
    print(f"Error: {e}")
