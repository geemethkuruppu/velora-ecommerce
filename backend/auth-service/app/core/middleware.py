from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi import Request
from app.core.config import settings

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    """
    Custom Middleware to handle Dynamic CORS for CloudFront.
    Solves the 'Access-Control-Allow-Origin' mismatch by explicitly mirroring
    the request Origin if it is in the allowed whitelist.
    """
    async def dispatch(self, request: Request, call_next):
        # 1. Handle Preflight OPTIONS requests directly for speed & reliability
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            if origin and origin in settings.cors_origins:
                response = Response(status_code=200)
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Set-Cookie"
                response.headers["Access-Control-Max-Age"] = "3600"
                response.headers["Vary"] = "Origin"
                return response

        # 2. Handle standard requests
        response: Response = await call_next(request)
        
        origin = request.headers.get("origin")
        
        # Dynamic Origin matching logic
        if origin and origin in settings.cors_origins:
            # Mirror the origin to ensure CloudFront forwards it correctly
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
            # Ensure Vary: Origin is present for caching safety
            if "Vary" not in response.headers:
                response.headers["Vary"] = "Origin"
            elif "Origin" not in response.headers["Vary"]:
                response.headers["Vary"] = f"{response.headers['Vary']}, Origin"
            
        return response
