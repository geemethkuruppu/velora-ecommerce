from app.core.config import settings

print(f"DEBUG: SECRET_KEY='{settings.secret_key}'")
print(f"DEBUG: DB_HOST='{settings.db_host}'")
print(f"DEBUG: DB_PORT='{settings.db_port}'")
