import requests
import json
from jose import jwt
from datetime import datetime, timedelta

# Config matching .env
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
API_URL = "http://127.0.0.1:8005/api/v1/cart"

def create_test_token(user_id=3):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def test_add_to_cart():
    token = create_test_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "product_id": 102,
        "quantity": 1,
        "variant_id": None
    }
    
    print(f"Sending POST to {API_URL}/items")
    print(f"Payload: {json.dumps(payload)}")
    
    try:
        response = requests.post(f"{API_URL}/items", json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("Successfully added item via API!")
        else:
            print("Failed to add item.")
            
    except Exception as e:
        print(f"Error: {e}")

def test_get_cart():
    print("\n--- Testing Get Cart ---")
    token = create_test_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(API_URL, headers=headers, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # test_add_to_cart()
    test_get_cart()
