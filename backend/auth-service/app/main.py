from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
from app.api.v1.auth import router as auth_router
from app.core.logging_utils import setup_logging, CorrelationIdMiddleware
from app.core.security_utils import SecurityHeadersMiddleware
from app.api.v1.debug_cors import router as debug_cors_router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)

# Setup Structured Logging
setup_logging(settings.app_name)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add Correlation ID Middleware
app.add_middleware(CorrelationIdMiddleware)

# Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add CORS Middleware (Standard)
# Add Dynamic CORS Middleware (Fixes CloudFront Origin Mismatch)
from app.core.middleware import DynamicCORSMiddleware
app.add_middleware(DynamicCORSMiddleware)

# Keeping Standard middleware as fallback/double-safety is risky as it might override headers.
# We comment it out to rely purely on Dynamic Logic for exact control.
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
#     expose_headers=["Set-Cookie", "Content-Disposition"]
# )

# IMPORTANT: Handle OPTIONS Pre-flight manually if Middleware doesn't catch it
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str, request: Request, response: Response):
    origin = request.headers.get("origin")
    if origin and origin in settings.cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Vary"] = "Origin"
        return Response(status_code=200)
    return Response(status_code=200)


Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {
        "service": settings.app_name,
        "environment": settings.env,
        "status": "running"
    }

app.include_router(auth_router, prefix="/api/v1")
app.include_router(debug_cors_router, prefix="/api/v1")