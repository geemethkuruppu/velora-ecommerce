import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User
from sqlalchemy import text

def inspect_user():
    db = SessionLocal()
    try:
        # Check connection first
        print("Checking database connection...")
        db.execute(text("SELECT 1"))
        print("Database connected.")

        user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if user:
            print(f"User Found: {user.email}")
            print(f"Hashed Password: '{user.hashed_password}'")
            print(f"Hash Length: {len(user.hashed_password)}")
            print(f"Is ASCII? {user.hashed_password.isascii()}")
            # Print hex to see hidden characters
            print(f"Hex Dump: {user.hashed_password.encode('utf-8').hex()}")
        else:
            print("User 'geemeth@gmail.com' NOT FOUND in this database.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_user()
