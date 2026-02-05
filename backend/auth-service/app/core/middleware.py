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
        origin = request.headers.get("origin")
        
        # 1. Immediate Preflight handling (Bypasses core logic for speed and security)
        if request.method == "OPTIONS":
            if origin and origin in settings.cors_origins:
                response = Response(status_code=200)
                self._add_cors_headers(response, origin)
                return response

        # 2. Wrapped Request Handling with Fail-Safe Header Injection
        try:
            response: Response = await call_next(request)
        except Exception as e:
            # If the app crashes (500), we MUST still add CORS headers
            # otherwise the browser hides the actual error.
            import logging
            logger = logging.getLogger("DynamicCORS")
            logger.error(f"Fail-Safe triggered: Request failed with {str(e)}")
            
            from fastapi.responses import JSONResponse
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error (Fail-Safe Triggered)"}
            )

        # 3. Final Header Injection
        if origin and origin in settings.cors_origins:
            self._add_cors_headers(response, origin)
            
        return response

    def _add_cors_headers(self, response: Response, origin: str):
        """Helper to consistently apply CORS headers"""
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Set-Cookie"
        response.headers["Access-Control-Max-Age"] = "3600"
        
        # Caching safety for CloudFront
        if "Vary" not in response.headers:
            response.headers["Vary"] = "Origin"
        elif "Origin" not in response.headers["Vary"]:
            response.headers["Vary"] = f"{response.headers['Vary']}, Origin"
