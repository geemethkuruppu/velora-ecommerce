import httpx
import asyncio
import json

# Setup
ORDER_SERVICE_URL = "http://localhost:8003/orders"
PRODUCT_SERVICE_URL = "http://localhost:8001/products"
INVENTORY_SERVICE_URL = "http://localhost:8004/inventory"

# Mock User Token (Since we mock auth in deps for now or need real token)
# In our implementation `get_current_user` usually decodes token.
# To make this easy, I'll update `app/api/deps.py` to allow a test token or just mock headers if possible.
# But better: login via Auth Service first? 
# Or just rely on the fact that I might have disabled auth or need to provide a dummy one?
# Let's assume we need a token. I'll login first.

AUTH_SERVICE_URL = "http://localhost:8000/auth"
USER_EMAIL = "test@example.com"
USER_PASS = "password123" 
# Note: If user doesn't exist, this fails. I should use existing user or register one.

async def verify():
    async with httpx.AsyncClient() as client:
        print("\n--- 1. Authentication ---")
        token = None
        try:
            # Login (Using a known user or trying to register)
            # Try login first
            login_data = {"email": USER_EMAIL, "password": USER_PASS} # JSON Payload
            resp = await client.post(f"{AUTH_SERVICE_URL}/login", json=login_data)
            
            if resp.status_code == 200:
                token = resp.json()["access_token"]
                print("Logged in successfully.")
            else:
                print(f"Login failed: {resp.status_code}. Trying register...")
                reg_data = {"email": USER_EMAIL, "password": USER_PASS, "full_name": "Test User"}
                resp = await client.post(f"{AUTH_SERVICE_URL}/register", json=reg_data)
                if resp.status_code == 201:
                    print("Registered. Logging in...")
                    resp = await client.post(f"{AUTH_SERVICE_URL}/login", json=login_data)
                    token = resp.json()["access_token"]
                else:
                    print(f"Register failed: {resp.text}")
                    return

        except Exception as e:
            print(f"Auth error: {e}")
            return

        headers = {"Authorization": f"Bearer {token}"}

        print("\n--- 2. Create Order ---")
        # I need a valid product/variant
        # Fetch products from Product Service
        resp = await client.get(f"{PRODUCT_SERVICE_URL}")
        products = resp.json()
        if not products:
            print("No products found! Create one first.")
            return

        product = products[0]
        variant = product['variants'][0]
        
        print(f"Ordering Product: {product['name']}, Variant: {variant['sku']}")
        
        # Ensure Stock Exists (Inventory Service)
        # Check stock
        try:
            inv_resp = await client.get(f"{INVENTORY_SERVICE_URL}/variant/{variant['id']}")
            if inv_resp.status_code == 200:
                inv_data = inv_resp.json()
                print(f"Current Stock: {inv_data['available_quantity']}")
                if inv_data['available_quantity'] < 1:
                    print("Adding stock...")
                    add_payload = {
                        "variant_id": variant['id'],
                        "quantity": 10,
                        "variant_sku": variant['sku'],
                        "reason": "Test"
                    }
                    await client.post(f"{INVENTORY_SERVICE_URL}/add-stock", json=add_payload)
            else:
                 # Initialize if not found
                 print("Initializing inventory...")
                 init_payload = {
                    "variant_id": variant['id'],
                    "variant_sku": variant['sku'],
                    "initial_quantity": 10
                 }
                 await client.post(f"{INVENTORY_SERVICE_URL}/variant", json=init_payload)
        except Exception as e:
            print(f"Inventory check failed: {e}")

        payload = {
            "items": [
                {
                    "product_id": product['id'],
                    "variant_id": variant['id'], # Now correct
                    "quantity": 1
                }
            ],
            "shipping_address": "123 Test St, Colombo"
        }
        
        resp = await client.post(f"{ORDER_SERVICE_URL}", json=payload, headers=headers)
        if resp.status_code == 200:
            order = resp.json()
            print("✅ Order Created!")
            print(json.dumps(order, indent=2))
            order_id = order['id']
        else:
            print(f"❌ Order Creation Failed: {resp.status_code} {resp.text}")
            return

        print("\n--- 3. Get Order Details ---")
        resp = await client.get(f"{ORDER_SERVICE_URL}/{order_id}", headers=headers)
        if resp.status_code == 200:
            print("✅ Fetch Verified")
        else:
            print(f"❌ Fetch Failed: {resp.status_code}")

        print("\n--- 4. Release Stock (Cancel) ---")
        resp = await client.post(f"{ORDER_SERVICE_URL}/{order_id}/cancel", headers=headers)
        if resp.status_code == 200:
            print("✅ Cancellation Verified (Stock Released)")
        else:
            print(f"❌ Cancellation Failed: {resp.status_code}")

if __name__ == "__main__":
    asyncio.run(verify())
