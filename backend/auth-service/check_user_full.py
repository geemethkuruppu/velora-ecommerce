import sys
import os
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.user import User
from sqlalchemy import text

def inspect_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if user:
            print(f"User Found: {user.email}")
            print(f"Role: {user.role}")
            print(f"Active: {user.is_active}")
            print(f"Verified: {user.is_verified}")
            print(f"Hash Length: {len(user.hashed_password)}")
        else:
            print("User 'geemeth@gmail.com' NOT FOUND.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_user()
