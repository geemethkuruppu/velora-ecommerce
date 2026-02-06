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

# 1. Standard CORS Middleware (Handles Pre-flight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie", "Content-Disposition"]
)

# 2. Custom Dynamic Logic (Mirrors Origin for CloudFront)
from app.core.middleware import DynamicCORSMiddleware
app.add_middleware(DynamicCORSMiddleware)

# 3. Security Headers Middleware (Applied last to protect response)
app.add_middleware(SecurityHeadersMiddleware)


@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    """
    Explicit OPTIONS handler to ensure preflight requests always succeed.
    Middleware will handle actual header injection.
    """
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