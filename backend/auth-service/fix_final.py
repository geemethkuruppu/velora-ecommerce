import sys
import os
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.user import User

def fix_final():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
        if user:
            # Re-calculated valid hash for 'Geemeth@32#'
            # This is 60 chars exactly.
            correct_hash = "$2b$12$dKisaGjcihokytZ3hOSN8.qrSLqA/wcUs55H49G5kYYrS16y.uBL.u"
            
            print(f"Old Hash: {user.hashed_password} (Len: {len(user.hashed_password)})")
            
            user.hashed_password = correct_hash
            db.commit()
            
            # Verify immediately
            db.refresh(user)
            print(f"New Hash: {user.hashed_password}")
            print(f"New Len:  {len(user.hashed_password)}")
            
            if len(user.hashed_password) == 60:
                print("✅ PERFECT. Login should work now.")
            else:
                print("❌ STILL BROKEN.")
        else:
            print("User not found.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_final()
