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

    class Config:
        env_file = ".env"
        extra = "ignore"  # Changed from "forbid" to allow extra fields in .env


settings = Settings()
