import sys
import os

# Add the current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app.db.session import engine
from app.db.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.product import Category, Product, ProductVariant, ProductMedia, ProductSpecification

def reset_database():
    print("⚠️  DANGER: This will delete all products and categories.")
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database has been hard-reset successfully!")

if __name__ == "__main__":
    reset_database()
