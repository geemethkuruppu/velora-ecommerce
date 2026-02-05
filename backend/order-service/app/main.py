from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.orders import router as orders_router
from app.api.v1.events import router as events_router
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
from app.core.logging_utils import setup_logging, CorrelationIdMiddleware
from app.core.security_utils import SecurityHeadersMiddleware

# Initialize FastAPI
app = FastAPI(
    title="Order Service",
    version="1.0.0",
    description="Manages orders and orchestrates Saga transactions"
)

# Setup Structured Logging
setup_logging(settings.app_name)

# Add Correlation ID Middleware
app.add_middleware(CorrelationIdMiddleware)

# Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Standard CORS Middleware (Handles Pre-flight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Dynamic Logic (Mirrors Origin for CloudFront)
from app.core.middleware import DynamicCORSMiddleware
app.add_middleware(DynamicCORSMiddleware)

# Create Database Tables
# In production, use Alembic migrations. For dev/MVP, this is fine.
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {
        "service": "order-service",
        "status": "running",
        "port": settings.port,
        "environment": settings.env
    }

# Include Routers
# Trigger Deployment
app.include_router(orders_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
