import sys
import os
from sqlalchemy import create_engine, text

def apply_fix(db_name, sql_commands):
    # Standard RDS credentials from the project
    DB_USER = "postgres"
    DB_PASSWORD = "VeloraDB2026!"
    DB_HOST = "velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com"
    DB_PORT = "5432"
    
    db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}?sslmode=require"
    engine = create_engine(db_url)
    
    print(f"Connecting to {db_name}...")
    with engine.connect() as conn:
        for cmd in sql_commands:
            if cmd.strip():
                print(f"Executing: {cmd[:50]}...")
                conn.execute(text(cmd))
        conn.commit()
    print(f"Successfully applied fixes to {db_name}\n")

if __name__ == "__main__":
    # Order Service Fixes
    order_sql = [
        "ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_order_status",
        "ALTER TABLE orders ADD CONSTRAINT check_order_status CHECK (status IN ('PENDING', 'PENDING_INVENTORY', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'))"
    ]
    apply_fix("order_db", order_sql)
    
    # Inventory Service Fixes
    inventory_sql = [
        "ALTER TABLE inventory_events DROP CONSTRAINT IF EXISTS check_event_type",
        "ALTER TABLE inventory_events ADD CONSTRAINT check_event_type CHECK (event_type IN ('RESERVED', 'RELEASED', 'CONFIRMED', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_UPDATED'))",
        "ALTER TABLE inventory_reservations DROP CONSTRAINT IF EXISTS check_reservation_status",
        "ALTER TABLE inventory_reservations ADD CONSTRAINT check_reservation_status CHECK (status IN ('ACTIVE', 'RELEASED', 'CONFIRMED'))"
    ]
    apply_fix("inventory_db", inventory_sql)
