from app.db.session import SessionLocal
from app.models.product import Category, Type, Product, ProductVariant, ProductMedia, ProductSpecification
from decimal import Decimal

def seed():
    db = SessionLocal()
    try:
        # 1. Create Categories
        # Womenswear
        handbag_cat = Category(name="Handbags", slug="handbags", department="Womenswear")
        jewelry_cat = Category(name="Fine Jewelry", slug="fine-jewelry", department="Womenswear")
        dresses_cat = Category(name="Evening Gowns", slug="evening-gowns", department="Womenswear")
        
        # Menswear
        suits_cat = Category(name="Tailored Suits", slug="tailored-suits", department="Menswear")
        shoes_cat = Category(name="Leather Shoes", slug="leather-shoes", department="Menswear")
        
        # Kidswear
        kids_casual_cat = Category(name="Casual Wear", slug="kids-casual", department="Kidswear")
        
        # Others
        watch_cat = Category(name="Luxury Watches", slug="luxury-watches", department="Others")
        
        db.add_all([handbag_cat, jewelry_cat, dresses_cat, suits_cat, shoes_cat, kids_casual_cat, watch_cat])
        db.flush()

        # 2. Create Types
        automatic_type = Type(name="Automatic Watches", slug="automatic-watches", category_id=watch_cat.id)
        leather_type = Type(name="Leather Handbags", slug="leather-handbags", category_id=handbag_cat.id)
        db.add(automatic_type)
        db.add(leather_type)
        db.flush()

        # 3. Create Products
        # Product 1: Watch
        watch_product = Product(
            sku="VEL-WATCH-001",
            name="Velora Grand Classic",
            slug="velora-grand-classic",
            brand="Velora",
            tags="luxury,gold,automatic",
            short_description="A masterpiece of horology.",
            description="The Velora Grand Classic features a 24k gold plated case and a Swiss-made automatic movement.",
            base_price=Decimal("4999.00"),
            currency="USD",
            type_id=automatic_type.id
        )
        
        # Product 2: Handbag
        bag_product = Product(
            sku="VEL-BAG-001",
            name="Seraphina Leather Tote",
            slug="seraphina-leather-tote",
            brand="Velora",
            tags="luxury,leather,tote",
            short_description="Timeless elegance in every stitch.",
            description="Crafted from premium Italian calfskin, the Seraphina Tote is the ultimate accessory for the modern woman.",
            base_price=Decimal("2450.00"),
            currency="USD",
            type_id=leather_type.id
        )
        
        db.add(watch_product)
        db.add(bag_product)
        db.flush()

        # 4. Create Variants
        # Watch Variant
        watch_variant = ProductVariant(
            product_id=watch_product.id,
            sku="VEL-WATCH-001-GOLD",
            color="Gold",
            size="Standard",
            stock_quantity=12
        )
        
        # Bag Variant
        bag_variant = ProductVariant(
            product_id=bag_product.id,
            sku="VEL-BAG-001-BLACK",
            color="Midnight Black",
            size="One Size",
            stock_quantity=25
        )
        
        db.add(watch_variant)
        db.add(bag_variant)
        db.flush()

        # 5. Create Media
        db.add(ProductMedia(
            product_id=watch_product.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1524592094714-0f0654e20314",
            is_primary=True
        ))
        
        db.add(ProductMedia(
            product_id=bag_product.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1584917865442-de89df76afd3",
            is_primary=True
        ))

        db.commit()
        print("✨ Seeding completed successfully! Luxury products added.")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
