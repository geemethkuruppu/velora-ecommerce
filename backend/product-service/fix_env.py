env_content = """# Application
APP_NAME=product-service
ENV=development

# Server
HOST=127.0.0.1
PORT=8001

# Security (JWT)
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (AWS RDS)
DB_HOST=velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=product_db
DB_USER=postgres
DB_PASSWORD=VeloraDB2026!
DB_SSLMODE=require

# External Service URLs
INVENTORY_SERVICE_URL=http://127.0.0.1:8004/api/v1
"""

with open(".env", "w", encoding="utf-8") as f:
    f.write(env_content)

print("✅ .env file written successfully in UTF-8")
