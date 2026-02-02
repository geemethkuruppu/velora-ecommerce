from app.db.session import engine
from app.db.base import Base
# Import models so they are registered
from app.models.order import Order, OrderItem

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset successfully!")

if __name__ == "__main__":
    reset_db()
