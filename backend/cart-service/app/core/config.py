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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
