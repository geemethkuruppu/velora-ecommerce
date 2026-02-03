from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str
    env: str

    # Server
    host: str
    port: int

    # Security
    secret_key: str
    refresh_secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int = 7

    # Database
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    db_sslmode: str
    db_pool_size: int = 20
    db_max_overflow: int = 10
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@velora.com"
    verification_token_expire_hours: int = 24
    
    # Frontend
    frontend_url: str = "http://localhost:5173"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

    class Config:
        env_file = ".env"
        extra = "forbid"


settings = Settings()
