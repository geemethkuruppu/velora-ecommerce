"""
Migration script to sync existing product variants to Inventory Service.
Run this script once after deploying the new Inventory Service.
"""
import asyncio
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.api.deps import get_db
# Adjust these imports based on your project structure
# You might need to set PYTHONPATH or run as a module
import sys
import os

# Add parent dir to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.product import ProductVariant

INVENTORY_SERVICE_URL = "http://localhost:8004/api/v1/inventory"

async def sync_variant(client, variant):
    try:
        response = await client.post(
            f"{INVENTORY_SERVICE_URL}/variant",
            json={
                "variant_id": variant.id,
                "variant_sku": variant.sku,
                "initial_quantity": variant.stock_quantity
            }
        )
        if response.status_code in [200, 201]:
            print(f"✅ Synced variant {variant.id} ({variant.sku}) - Stock: {variant.stock_quantity}")
        elif response.status_code == 400 and "already exists" in response.text:
             print(f"⚠️ Variant {variant.id} already exists in inventory")
        else:
            print(f"❌ Failed to sync variant {variant.id}: {response.status_code} {response.text}")
    except Exception as e:
        print(f"❌ Error syncing variant {variant.id}: {e}")

async def migrate():
    db = SessionLocal()
    variants = db.query(ProductVariant).all()
    print(f"Found {len(variants)} variants to migrate...")
    
    async with httpx.AsyncClient() as client:
        jobs = []
        for variant in variants:
            jobs.append(sync_variant(client, variant))
        
        await asyncio.gather(*jobs)
    
    print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
