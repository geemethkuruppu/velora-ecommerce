from app.db.session import SessionLocal
from app.models.product import Product, ProductVariant, Category, Type

def check_data():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        variants = db.query(ProductVariant).all()
        categories = db.query(Category).all()
        types = db.query(Type).all()

        print(f"Total Products: {len(products)}")
        print(f"Total Variants: {len(variants)}")
        print(f"Total Categories: {len(categories)}")
        for c in categories:
            print(f"- {c.name}")
        print(f"Total Types: {len(types)}")
        for t in types:
            print(f"- {t.name}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
