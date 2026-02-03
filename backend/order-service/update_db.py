from sqlalchemy import text
from app.db.session import SessionLocal

def update_constraint():
    db = SessionLocal()
    try:
        # 1. Drop the old constraint
        db.execute(text("ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_order_status"))
        
        # 2. Add the new constraint with CANCEL_PENDING
        db.execute(text("""
            ALTER TABLE orders 
            ADD CONSTRAINT check_order_status 
            CHECK (status IN ('PENDING', 'PENDING_INVENTORY', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCEL_PENDING'))
        """))
        
        db.commit()
        print("Successfully updated check_order_status constraint.")
    except Exception as e:
        db.rollback()
        print(f"Failed to update constraint: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_constraint()
