"""
Database Reset Script for Product Service
Drops all tables and recreates them with the new 3-level hierarchy schema
"""
from app.db.session import engine
from app.db.base import Base
from app.models.product import Category, Type, Product, ProductVariant, ProductMedia, ProductSpecification
from sqlalchemy.orm import Session

def reset_database():
    """Drop all tables and recreate them"""
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("✨ Creating tables with new schema...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset complete!")
    print("\n📊 New Schema:")
    print("  - categories (with department field)")
    print("  - types (NEW - belongs to category)")
    print("  - products (now references type_id)")
    print("  - product_variants")
    print("  - product_media")
    print("  - product_specifications")


def seed_sample_data():
    """Add sample data to test the hierarchy"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        print("\n🌱 Seeding sample data...")
        
        # Create Categories
        cat_dresses = Category(name="Dresses", slug="dresses", department="Womenswear")
        cat_suits = Category(name="Suits", slug="suits", department="Menswear")
        cat_shoes = Category(name="Shoes", slug="shoes", department="Kidswear")
        
        db.add_all([cat_dresses, cat_suits, cat_shoes])
        db.commit()
        
        # Create Types
        type_evening = Type(name="Evening Gowns", slug="evening-gowns", category_id=cat_dresses.id)
        type_casual = Type(name="Casual Dresses", slug="casual-dresses", category_id=cat_dresses.id)
        type_business = Type(name="Business Suits", slug="business-suits", category_id=cat_suits.id)
        type_sneakers = Type(name="Sneakers", slug="sneakers", category_id=cat_shoes.id)
        
        db.add_all([type_evening, type_casual, type_business, type_sneakers])
        db.commit()
        
        # Create Sample Products
        product1 = Product(
            sku="VELORA-EG-001",
            name="Silk Evening Gown",
            slug="silk-evening-gown",
            brand="VELORA",
            short_description="Elegant silk evening gown",
            base_price=299.99,
            type_id=type_evening.id
        )
        
        product2 = Product(
            sku="VELORA-CD-001",
            name="Summer Dress",
            slug="summer-dress",
            brand="VELORA",
            short_description="Light and breezy summer dress",
            base_price=79.99,
            type_id=type_casual.id
        )
        
        product3 = Product(
            sku="VELORA-BS-001",
            name="Navy Blue Suit",
            slug="navy-blue-suit",
            brand="VELORA",
            short_description="Classic navy blue business suit",
            base_price=499.99,
            type_id=type_business.id
        )
        
        db.add_all([product1, product2, product3])
        db.commit()
        
        print("✅ Sample data seeded successfully!")
        print("\n📦 Created:")
        print(f"  - 3 Categories (Dresses, Suits, Shoes)")
        print(f"  - 4 Types (Evening Gowns, Casual Dresses, Business Suits, Sneakers)")
        print(f"  - 3 Products")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🔄 Starting database reset...")
    print("⚠️  WARNING: This will delete ALL existing data!")
    
    confirm = input("\nType 'yes' to continue: ")
    if confirm.lower() == 'yes':
        reset_database()
        
        seed = input("\n🌱 Seed sample data? (yes/no): ")
        if seed.lower() == 'yes':
            seed_sample_data()
        
        print("\n✨ Done! You can now start the product-service.")
    else:
        print("❌ Reset cancelled.")
