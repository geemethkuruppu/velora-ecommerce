from app.db.session import SessionLocal, engine
from app.db.base import Base

def reset_database():
    """Drop all tables and recreate them"""
    try:
        print("🗑️  Dropping all tables in order-service...")
        Base.metadata.drop_all(bind=engine)
        
        print("🔨 Creating fresh tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✨ Order database reset complete!")
        
    except Exception as e:
        print(f"❌ Reset failed: {e}")

if __name__ == "__main__":
    confirm = input("⚠️  This will DELETE ALL DATA in order-service. Type 'RESET' to confirm: ")
    if confirm == "RESET":
        reset_database()
    else:
        print("❌ Reset cancelled")
