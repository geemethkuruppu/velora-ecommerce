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
    return {
        "service": settings.app_name,
        "environment": settings.env,
        "status": "running"
    }

app.include_router(auth_router, prefix="/api/v1")