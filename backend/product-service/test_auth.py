from jose import jwt
from datetime import datetime, timedelta
import httpx
import asyncio

# Config
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
URL = "http://127.0.0.1:8001/api/v1/products/2"

def create_mock_token():
    payload = {
        "sub": "1",
        "role": "SUPER_ADMIN",
        "exp": datetime.utcnow() + timedelta(minutes=30),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def test_update():
    token = create_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Just a mock payload
    payload = {
        "name": "Test Product",
        "variants": []
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.put(URL, json=payload, headers=headers)
            print(f"Status: {resp.status_code}")
            print(f"Body: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_update())
