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
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import os
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Product Service")

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


# Add Security Headers Middleware
# app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Detailed logging for 422 errors to identify mismatched schemas.
    """
    logger.error(f"422 Validation Error: {exc.errors()}")
    logger.error(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors(), "body": str(await request.body())}),
    )

# Create uploads directory if it doesn't exist
os.makedirs("uploads/products", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Standard CORS Middleware removed to prevent conflict with Gateway/Custom Middleware
# app.add_middleware(CORSMiddleware, ...)

Base.metadata.create_all(bind=engine)

# Removed explicit preflight_handler to let CORSMiddleware handle it natively

@app.get("/health")
def health_check():
    return {"status": "running", "service": "product-service", "port": 8001}

app.include_router(types_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
