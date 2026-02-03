import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# RDS connection details
RDS_HOST = "velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com"
RDS_PORT = 5432
RDS_USER = "postgres"
RDS_PASSWORD = "VeloraDB2026!"

try:
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        host=RDS_HOST,
        port=RDS_PORT,
        user=RDS_USER,
        password=RDS_PASSWORD,
        database="postgres",  # Connect to default database
        sslmode="require"
    )
    
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Create cart_db database
    cursor.execute("CREATE DATABASE cart_db;")
    print("✅ Database 'cart_db' created successfully!")
    
    cursor.close()
    conn.close()
    
except psycopg2.errors.DuplicateDatabase:
    print("ℹ️  Database 'cart_db' already exists")
except Exception as e:
    print(f"❌ Error: {e}")
