from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


DATABASE_URL = (
    f"postgresql+psycopg2://{settings.db_user}:"
    f"{settings.db_password}@"
    f"{settings.db_host}:"
    f"{settings.db_port}/"
    f"{settings.db_name}"
    f"?sslmode={settings.db_sslmode}"
)


engine = create_engine(
    DATABASE_URL,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_recycle=settings.db_pool_recycle,
    pool_pre_ping=True
)

# Disaster Recovery / Read Scaling Support
# If a Read Replica is configured (e.g. RDS Global Database Replica), 
# we create a separate engine for read-only operations.
replica_engine = None
if settings.db_read_replica_host:
    REPLICA_URL = DATABASE_URL.replace(settings.db_host, settings.db_read_replica_host)
    replica_engine = create_engine(
        REPLICA_URL,
        pool_size=settings.db_pool_size,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
