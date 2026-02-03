import sys
import os
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models.user import User

def verify():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "geemeth@gmail.com").first()
    if user:
        h = user.hashed_password
        print(f"Hash: {h}")
        print(f"Length: {len(h)}")
        if len(h) == 60:
            print("✅ VERIFIED: Hash is exactly 60 chars. Safe to start server.")
        else:
            print(f"❌ FAIL: Hash is {len(h)} chars. Still corrupt.")
            # Emergency trim
            if len(h) > 60:
                print("⚠️ Attempting emergency trim...")
                user.hashed_password = h.strip()[:60]
                db.commit()
                print("Trimmed and saved.")
    db.close()

if __name__ == "__main__":
    verify()
