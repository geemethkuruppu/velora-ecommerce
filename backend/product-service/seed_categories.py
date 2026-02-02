from app.db.session import SessionLocal
from app.models.product import Category

def seed_categories():
    db = SessionLocal()
    try:
        # Check existing categories
        existing = db.query(Category).all()
        existing_slugs = {cat.slug for cat in existing}
        
        categories = [
            # Womenswear
            Category(name="Evening Gowns", slug="evening-gowns", department="Womenswear"),
            Category(name="Luxury Handbags", slug="luxury-handbags", department="Womenswear"),
            Category(name="Fine Jewelry", slug="fine-jewelry", department="Womenswear"),
            Category(name="Designer Shoes", slug="designer-shoes-women", department="Womenswear"),
            Category(name="Silk Scarves", slug="silk-scarves", department="Womenswear"),
            
            # Menswear
            Category(name="Tailored Suits", slug="tailored-suits", department="Menswear"),
            Category(name="Dress Shirts", slug="dress-shirts", department="Menswear"),
            Category(name="Leather Shoes", slug="leather-shoes-men", department="Menswear"),
            Category(name="Luxury Watches", slug="luxury-watches-men", department="Menswear"),
            Category(name="Cashmere Sweaters", slug="cashmere-sweaters", department="Menswear"),
            
            # Kidswear
            Category(name="Casual Wear", slug="kids-casual", department="Kidswear"),
            Category(name="Formal Wear", slug="kids-formal", department="Kidswear"),
            Category(name="Outerwear", slug="kids-outerwear", department="Kidswear"),
            Category(name="Footwear", slug="kids-footwear", department="Kidswear"),
            
            # Others
            Category(name="Accessories", slug="accessories", department="Others"),
            Category(name="Fragrances", slug="fragrances", department="Others"),
            Category(name="Home & Lifestyle", slug="home-lifestyle", department="Others"),
        ]
        
        # Filter out categories that already exist
        new_categories = [cat for cat in categories if cat.slug not in existing_slugs]
        
        if new_categories:
            db.add_all(new_categories)
            db.commit()
            print(f"✨ Successfully added {len(new_categories)} new categories!")
        else:
            print("ℹ️  All categories already exist in database")
        
        print("✨ Successfully seeded categories!")
        print(f"   - Womenswear: 5 categories")
        print(f"   - Menswear: 5 categories")
        print(f"   - Kidswear: 4 categories")
        print(f"   - Others: 3 categories")
        print(f"   Total: {len(categories)} categories")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
