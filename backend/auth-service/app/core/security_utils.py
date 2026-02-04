from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security-related HTTP headers to every response.
    Inspired by 'helmet' in Node.js.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # 1. Prevent Clickjacking
        # Prevents the site from being embedded in an <iframe>
        response.headers["X-Frame-Options"] = "DENY"
        
        # 2. Prevent MIME-Type Sniffing
        # Forces the browser to stick to the content-type header
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 3. Enable XSS Filtering
        # Modern browsers stop loading the page if an XSS attack is detected
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 6. Referrer Policy
        # Only send referrer when navigating within the same site
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 7. Disable Caching for API Security
        # Critical for CloudFront to avoid caching        # Disable Caching for API Security
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        # Force CloudFront to respect CORS variations
        response.headers["Vary"] = "Origin"
        
        return response
