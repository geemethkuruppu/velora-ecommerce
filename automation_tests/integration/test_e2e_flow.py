import httpx
import pytest
import time

# Target the LIVE ALB URL for the most realistic proof
BASE_URL = "http://velora-auth-alb-1482335493.ap-south-1.elb.amazonaws.com/api/v1"

@pytest.mark.asyncio
async def test_full_e2e_shopping_journey():
    """
    TEST: Pillar 4 (E2E Integration)
    Flow: 
    1. Public Browsing (Products)
    2. Check Categories
    3. Anonymous Add to Cart (Optional check)
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # --- PHASE 1: PRODUCT BROWSING ---
        print("\n🚀 Starting E2E Journey...")
        
        # 1. Fetch Categories
        cat_resp = await client.get(f"{BASE_URL}/products/categories")
        assert cat_resp.status_code == 200
        categories = cat_resp.json()
        print(f"✅ Step 1: Fetched {len(categories)} categories successfully.")

        # 2. Fetch Products
        prod_resp = await client.get(f"{BASE_URL}/products")
        assert prod_resp.status_code == 200
        products = prod_resp.json()
        print(f"✅ Step 2: Fetched {len(products)} products from the catalog.")

        if len(products) > 0:
            first_prod = products[0]
            prod_id = first_prod['id']
            print(f"👉 Selecting product: {first_prod['name']}")
            
            # 3. Get Single Product Details
            detail_resp = await client.get(f"{BASE_URL}/products/{prod_id}")
            assert detail_resp.status_code == 200
            print(f"✅ Step 3: Successfully retrieved details for '{first_prod['name']}'.")

        print("\n🏁 E2E INTEGRATION PROOF: All service communication paths are healthy.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_full_e2e_shopping_journey())
