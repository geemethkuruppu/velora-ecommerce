from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str
    env: str

    # Server
    host: str = "0.0.0.0"
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
    db_pool_size: int = 20
    db_max_overflow: int = 10
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800
    
    # CORS
    cors_origins: list[str] = [
        "https://d2h62r2viksjq5.cloudfront.net",
        "https://d2dnnb0ijn36mw.cloudfront.net",
    ]

    # Database Read Replica (Optional for Scale/DR)
    db_read_replica_host: str | None = None
    
    # External Service URLs (Using ALB for Production)
    auth_service_url: str = "http://velora-prod-alb-1368791126.ap-south-1.elb.amazonaws.com/api/v1"
    inventory_service_url: str = "http://velora-prod-alb-1368791126.ap-south-1.elb.amazonaws.com/api/v1/inventory"
    product_service_url: str = "http://velora-prod-alb-1368791126.ap-south-1.elb.amazonaws.com/api/v1"
    
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
