import sys
import os

sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User

def fix_user_hash():
    db = SessionLocal()
    try:
        print("Attempting to fix user hash...")
        user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if user:
            # The correct, clean hash
            correct_hash = "$2b$12$dKisaGjcihokytZ3hOSN8.qrSLqA/wcUs55H49G5kYYrS16y.uBL.u"
            user.hashed_password = correct_hash
            db.commit()
            print("✅ SUCCESS: Password hash updated directly via Python.")
            print(f"New Hash Length: {len(user.hashed_password)}")
        else:
            print("❌ ERROR: User not found!")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_hash()
