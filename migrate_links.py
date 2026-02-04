
from sqlalchemy import create_engine, text

# Database connection details
DB_URLS = {
    "product_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/product_db",
    "auth_db": "postgresql://postgres:VeloraDB2026!@velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com:5432/auth_db"
}

NEW_BASE_URL = "https://velora-media-storage-ap-south-1.s3.ap-south-1.amazonaws.com"
OLD_BASE_URL = "http://localhost:8001/uploads"

def migrate_media_links():
    for db_name, url in DB_URLS.items():
        print(f"Migrating {db_name}...")
        try:
            engine = create_engine(url)
            with engine.connect() as conn:
                # 1. Update Product Media
                if db_name == "product_db":
                    # Update product_media table
                    result = conn.execute(text(f"UPDATE product_media SET media_url = REPLACE(media_url, '{OLD_BASE_URL}', '{NEW_BASE_URL}') WHERE media_url LIKE '{OLD_BASE_URL}%'"))
                    print(f"Updated {result.rowcount} product media links.")
                    
                    # Update categories table image_url
                    result = conn.execute(text(f"UPDATE categories SET image_url = REPLACE(image_url, '{OLD_BASE_URL}', '{NEW_BASE_URL}') WHERE image_url LIKE '{OLD_BASE_URL}%'"))
                    print(f"Updated {result.rowcount} category image links.")
                
                conn.commit()
                print(f"✅ {db_name} migration complete.")
        except Exception as e:
            print(f"❌ Error migrating {db_name}: {str(e)}")

if __name__ == "__main__":
    migrate_media_links()
