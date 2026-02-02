from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def create_super_admin():
    db = SessionLocal()
    try:
        # Check if super admin already exists
        existing = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if existing:
            print("⚠️  Super admin already exists!")
            return
        
        # Create super admin
        super_admin = User(
            email="geemeth@gmail.com",
            full_name="Geemeth",
            hashed_password=hash_password("Geemeth@32#"),
            is_active=True,
            is_verified=True,
            role="admin"
        )
        
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        
        print("✨ Super admin created successfully!")
        print(f"   Email: {super_admin.email}")
        print(f"   Name: {super_admin.full_name}")
        print(f"   Role: {super_admin.role}")
        print(f"   Active: {super_admin.is_active}")
        print(f"   Verified: {super_admin.is_verified}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to create super admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
