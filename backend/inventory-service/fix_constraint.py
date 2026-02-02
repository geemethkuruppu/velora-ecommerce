import os
import psycopg2
from dotenv import load_dotenv

def fix_constraint():
    # Load .env from the current directory
    load_dotenv()
    
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", 5432)
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    
    print(f"Connecting to {db_host}/{db_name}...")
    
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            sslmode="require"
        )
        cur = conn.cursor()
        
        print("Dropping old constraint...")
        cur.execute("ALTER TABLE inventory_events DROP CONSTRAINT IF EXISTS check_event_type;")
        
        print("Adding new constraint with STOCK_UPDATED and STOCK_REMOVED...")
        cur.execute("""
            ALTER TABLE inventory_events ADD CONSTRAINT check_event_type 
            CHECK (event_type IN ('RESERVED', 'RELEASED', 'CONFIRMED', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_UPDATED'));
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("\nSUCCESS: Database constraint updated successfully!")
        print("You can now use the 'Confirm Update' button in the dashboard.")
        
    except Exception as e:
        print(f"\nERROR: Could not update database: {e}")

if __name__ == "__main__":
    fix_constraint()
