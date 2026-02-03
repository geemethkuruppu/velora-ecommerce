from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cart Service"
    env: str = "development"
    secret_key: str
    algorithm: str = "HS256"
    
    # Server settings
    host: str = "127.0.0.1"
    port: int = 8005
    access_token_expire_minutes: int = 30
    
    # External Service URLs
    product_service_url: str = "http://localhost:8001/api/v1"
    
    # Database settings
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    db_sslmode: str = "require"
    db_pool_size: int = 20
    db_max_overflow: int = 10
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://velora-customer-app.s3-website.ap-south-1.amazonaws.com",
        "http://d2h62r2viksjq5.cloudfront.net",
        "https://d2h62r2viksjq5.cloudfront.net",
        "http://velora-admin-dashboard.s3-website.ap-south-1.amazonaws.com",
        "https://d2dnnb0ijn36mw.cloudfront.net",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
