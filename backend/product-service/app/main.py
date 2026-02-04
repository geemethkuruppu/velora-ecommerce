from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.api.v1.products import router as products_router
from app.api.v1.types import router as types_router
from app.core.config import settings
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
from app.core.logging_utils import setup_logging, CorrelationIdMiddleware
from app.core.security_utils import SecurityHeadersMiddleware
import os

app = FastAPI(title="Product Service")

# Setup Structured Logging
setup_logging(settings.app_name)

# Add Correlation ID Middleware
app.add_middleware(CorrelationIdMiddleware)

# Custom CORS Fallback (Ensures headers are present even if CORSMiddleware is bypassed)
@app.middleware("http")
async def cors_fallback(request: Request, call_next):
    origin = request.headers.get("origin")
    response = await call_next(request)
    if origin in settings.cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Add Security Headers Middleware
# app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/products", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "running", "service": "product-service", "port": 8001}

app.include_router(products_router, prefix="/api/v1")
app.include_router(types_router, prefix="/api/v1")
