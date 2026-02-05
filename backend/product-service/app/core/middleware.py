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
