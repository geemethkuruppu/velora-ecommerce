import httpx
import asyncio
import json

PRODUCT_SERVICE_URL = "http://127.0.0.1:8001/api/v1/products"
INVENTORY_SERVICE_URL = "http://127.0.0.1:8004/api/v1/inventory"

async def verify():
    async with httpx.AsyncClient() as client:
        # 1. Check Categories
        print("1. Checking Categories...")
        try:
            resp = await client.get(f"{PRODUCT_SERVICE_URL}/categories")
            if resp.status_code != 200:
                print(f"Failed to get categories: {resp.status_code} {resp.text}")
                return
            
            categories = resp.json()
            print(f"Found {len(categories)} categories")
            
            category_id = None
            if not categories:
                print("Creating test category...")
                cat_payload = {"name": "Test Category", "slug": "test-category"}
                resp = await client.post(f"{PRODUCT_SERVICE_URL}/categories", json=cat_payload)
                if resp.status_code == 200:
                    category_id = resp.json()['id']
                    print(f"Created category {category_id}")
                else:
                    print(f"Failed to create category: {resp.text}")
                    return
            else:
                category_id = categories[0]['id']
                print(f"Using category {category_id}")

        except Exception as e:
            print(f"Error checking categories: {e}")
            return

        # 2. Create Product
        print("\n2. Creating Product...")
        product_sku = "INTEGRATION-TEST-001"
        variant_sku = "INTEGRATION-VARIANT-001"
        
        payload = {
            "name": "Integration Test Product",
            "sku": product_sku,
            "slug": "integration-test-product",
            "short_description": "Test product for inventory sync",
            "description": "Full description",
            "base_price": 99.99,
            "currency": "USD",
            "category_id": category_id,
            "variants": [
                {
                    "sku": variant_sku,
                    "stock_quantity": 50,
                    "color": "Red",
                    "size": "L"
                }
            ],
            "specifications": [],
            "media": []
        }
        
        try:
            # We might need admin token/auth. 
            # If auth fails, we'll see 401/403.
            resp = await client.post(f"{PRODUCT_SERVICE_URL}", json=payload)
            if resp.status_code == 200:
                product = resp.json()
                print(f"✅ Product created successfully: ID {product['id']}")
                variant_id = product['variants'][0]['id']
                print(f"Variant ID: {variant_id}")
            elif resp.status_code == 400 and "already exists" in resp.text:
                print("Product already exists, skipping creation...")
                # Fetch it to get variant id
                # ... implementation logic skipped for brevity on retry
                return
            else:
                print(f"❌ Failed to create product: {resp.status_code} {resp.text}")
                return
        except Exception as e:
            print(f"Error creating product: {e}")
            return

        # 3. Verify Inventory
        print("\n3. Verifying Inventory Service...")
        try:
            resp = await client.get(f"{INVENTORY_SERVICE_URL}/variant/{variant_id}")
            if resp.status_code == 200:
                inventory = resp.json()
                print(f"✅ Inventory found for variant {variant_id}")
                print(f"Total: {inventory['total_quantity']}")
                print(f"Available: {inventory['available_quantity']}")
                
                if inventory['total_quantity'] == 50:
                    print("🎉 SUCCESS: Stock synced correctly!")
                else:
                    print("⚠️ WARNING: Stock mismatch!")
            else:
                print(f"❌ Failed to get inventory: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"Error checking inventory: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
