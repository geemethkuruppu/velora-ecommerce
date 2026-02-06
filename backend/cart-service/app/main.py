from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.api.v1.cart import router as cart_router
from app.core.config import settings
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
from app.core.logging_utils import setup_logging, CorrelationIdMiddleware
from app.core.security_utils import SecurityHeadersMiddleware

app = FastAPI(title="Cart Service")

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

# Custom Dynamic Logic (Mirrors Origin for CloudFront)
from app.core.middleware import DynamicCORSMiddleware
app.add_middleware(DynamicCORSMiddleware)

# Security Headers (Applied after CORS)
app.add_middleware(SecurityHeadersMiddleware)


# Add Security Headers Middleware
# app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Standard CORS Middleware removed to prevent conflict with Gateway/Custom Middleware
# app.add_middleware(CORSMiddleware, ...)

# Create tables
Base.metadata.create_all(bind=engine)

@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    """
    Explicit OPTIONS handler to ensure preflight requests always succeed.
    Middleware will handle actual header injection.
    """
    return Response(status_code=200)

@app.get("/health")
def health_check():
    return {"status": "running", "service": "cart-service", "port": 8005}

@app.get("/api/v1/cart/debug-product/{product_id}")
async def debug_product(product_id: int):
    """Debug internal connectivity to product-service"""
    from app.services.cart_service import fetch_product_info
    info = await fetch_product_info(product_id)
    return {
        "product_id": product_id,
        "product_service_url": settings.product_service_url,
        "product_info": info if info else "FETCH_FAILED",
        "instructions": "Check CloudWatch logs for 'DEBUG' messages to see the exact status code and error."
    }

app.include_router(cart_router, prefix="/api/v1")
