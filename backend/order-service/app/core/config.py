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
    algorithm: str
    access_token_expire_minutes: int

    # Database
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    db_sslmode: str
    
    # External Service URLs
    inventory_service_url: str = "http://localhost:8004/api/v1"
    product_service_url: str = "http://localhost:8001/api/v1"
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@velora.com"
    verification_token_expire_hours: int = 24

    class Config:
        env_file = ".env"
        extra = "forbid"


settings = Settings()
