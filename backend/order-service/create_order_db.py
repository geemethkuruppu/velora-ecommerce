import psycopg2

# Connect to RDS
try:
    conn = psycopg2.connect(
        host='velora-postgres.cz0ooqu2wcz4.ap-south-1.rds.amazonaws.com',
        port=5432,
        user='postgres',
        password='VeloraDB2026!',
        dbname='postgres',
        sslmode='require'
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    # Create database
    cur.execute('CREATE DATABASE order_db')
    print('✅ Database order_db created successfully!')
    
    conn.close()
except Exception as e:
    if 'already exists' in str(e):
        print('ℹ️  Database order_db already exists')
    else:
        print(f'❌ Error: {e}')
