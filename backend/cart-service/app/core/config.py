from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cart Service"
    env: str = "development"
    secret_key: str
    algorithm: str = "HS256"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8005
    access_token_expire_minutes: int = 30
    
    # External Service URLs (Using ALB for Production)
    product_service_url: str = "http://velora-auth-alb-1482335493.ap-south-1.elb.amazonaws.com/api/v1/products"
    
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
        "https://d2h62r2viksjq5.cloudfront.net",
        "https://d2dnnb0ijn36mw.cloudfront.net",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
