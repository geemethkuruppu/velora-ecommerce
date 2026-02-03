from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.auth_service import create_admin
from app.schemas.user import UserCreate
import sys

def create_initial_superuser():
    db = SessionLocal()
    try:
        user_in = UserCreate(
            email="admin@velora.com",
            password="AdminPassword123!",
            full_name="Super Admin"
        )
        try:
            create_admin(db, user_in)
            print("Super Admin created successfully.")
        except Exception as e:
            if "already registered" in str(e):
                print("Super Admin already exists.")
            else:
                print(f"Error creating Super Admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_superuser()
