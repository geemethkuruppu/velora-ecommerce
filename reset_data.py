
from sqlalchemy import create_engine, text

# Database connection details
DB_URLS = {
    "product_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/product_db",
    "order_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/order_db",
    "inventory_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/inventory_db",
    "cart_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/cart_db"
}

def reset_databases():
    print("⚠️  WARNING: This will specific tables in Product, Order, Inventory, and Cart databases.")
    print("🔒 Auth Database will remain UNTOUCHED.")
    print("Starting reset...\n")

    for db_name, url in DB_URLS.items():
        print(f"Connecting to {db_name}...")
        try:
            engine = create_engine(url)
            with engine.connect() as conn:
                if db_name == "product_db":
                    # Order matters due to Foreign Keys!
                    conn.execute(text("TRUNCATE TABLE product_media, product_variants, product_specifications, products, types, categories CASCADE;"))
                    print("✅ Product DB cleared.")
                
                elif db_name == "order_db":
                    conn.execute(text("TRUNCATE TABLE order_items, orders CASCADE;"))
                    print("✅ Order DB cleared.")

                elif db_name == "inventory_db":
                    conn.execute(text("TRUNCATE TABLE inventory_reservations, inventory_events, inventory CASCADE;"))
                    print("✅ Inventory DB cleared.")
                
                elif db_name == "cart_db":
                    conn.execute(text("TRUNCATE TABLE cart_items, carts CASCADE;"))
                    print("✅ Cart DB cleared.")

                conn.commit()
        except Exception as e:
            print(f"❌ Error resetting {db_name}: {str(e)}")

    print("\n✨ All business data reset complete. Auth data preserved.")

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete all product/order data? (yes/no): ")
    if confirm.lower() == "yes":
        reset_databases()
    else:
        print("Operation cancelled.")
