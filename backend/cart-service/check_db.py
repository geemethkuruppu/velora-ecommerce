import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.cart import Cart, CartItem

# Database URL from .env
DB_URL = "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/cart_db"

def check_db():
    print(f"Connecting to: {DB_URL}")
    try:
        engine = create_engine(DB_URL, connect_args={"sslmode": "require"})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("--- Carts ---")
        carts = db.query(Cart).all()
        for c in carts:
            print(f"Cart ID: {c.id}, User ID: {c.user_id}")
            
        # Try to insert an item manually
        # print("\n--- Attempting Insert ---")
        # cart = db.query(Cart).filter(Cart.user_id == 3).first()
        # if cart:
        #     print(f"Found cart for user 3: {cart.id}")
        #     new_item = CartItem(
        #         cart_id=cart.id,
        #         product_id=101,
        #         variant_id=None,
        #         quantity=1
        #     )
        #     db.add(new_item)
        #     try:
        #         db.commit()
        #         print("Insert SUCCESS!")
        #         db.refresh(new_item)
        #         print(f"New Item ID: {new_item.id}")
        #     except Exception as e:
        #         print(f"Insert FAILED: {e}")
        #         db.rollback()
        # else:
        #     print("Cart for user 3 not found!")

        print("\n--- Cart Items (After) ---")
        items = db.query(CartItem).all()
        for i in items:
            print(f"Item ID: {i.id}, Product: {i.product_id}, Qty: {i.quantity}")
            
        db.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
