from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.inventory import router as inventory_router
from app.api.v1.events import router as events_router
from app.models.inventory import Inventory, InventoryReservation, InventoryEvent
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
from app.core.logging_utils import setup_logging, CorrelationIdMiddleware
from app.core.security_utils import SecurityHeadersMiddleware

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Inventory Service - Manages product stock and reservations with Saga pattern support"
)

# Setup Structured Logging
setup_logging(settings.app_name)

# Add Correlation ID Middleware
app.add_middleware(CorrelationIdMiddleware)

# Outermost Middleware: Standard CORS (Handles Pre-flight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie", "Content-Disposition"]
)

# Security Headers (Applied after CORS)
app.add_middleware(SecurityHeadersMiddleware)

# Create database tables
Base.metadata.create_all(bind=engine)

# Removed explicit preflight_handler to let CORSMiddleware handle it natively

@app.get("/health")
def health_check():
    return {
        "service": settings.app_name,
        "environment": settings.env,
        "status": "running",
        "port": settings.port
    }

app.include_router(inventory_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1/inventory")
