from fastapi import APIRouter, Request
from app.core.config import settings

router = APIRouter(tags=["Debug"])

@router.get("/debug-cors")
def debug_cors(request: Request):
    """
    Echoes back the request headers and server configuration.
    Use this to verify if CloudFront is stripping the 'Origin' header.
    """
    return {
        "received_origin": request.headers.get("origin"),
        "received_host": request.headers.get("host"),
        "allowed_origins_configured": settings.cors_origins,
        "environment": settings.env,
        "all_headers": dict(request.headers)
    }
