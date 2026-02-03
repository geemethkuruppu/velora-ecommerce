import sys
import os
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def set_simple_pass():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if user:
            # Simple password: "test1234"
            # We generate it RIGHT HERE to be sure.
            fresh_hash = pwd_context.hash("test1234")
            user.hashed_password = fresh_hash
            db.commit()
            print(f"Password reset to 'test1234'.")
            print(f"Hash: {fresh_hash}") 
    finally:
        db.close()

if __name__ == "__main__":
    set_simple_pass()
