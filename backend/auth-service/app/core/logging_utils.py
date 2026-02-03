import logging
import json
import time
import uuid
from contextvars import ContextVar
from typing import Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import datetime

# Context variable to store correlation ID for the current request
correlation_id_ctx: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)

class JSONFormatter(logging.Formatter):
    """
    Custom formatter to output logs in JSON format.
    """
    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "service": self.service_name,
            "correlation_id": correlation_id_ctx.get(),
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_obj)

def setup_logging(service_name: str):
    """
    Configure the root logger with JSON formatting.
    """
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter(service_name))
    
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)
    
    # Silence verbose libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract or generate a correlation ID for every request.
    """
    async def dispatch(self, request: Request, call_next):
        # 1. Get correlation ID from header or generate new one
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        # 2. Store in context variable
        token = correlation_id_ctx.set(correlation_id)
        
        try:
            # 3. Process request
            response: Response = await call_next(request)
            
            # 4. Add to response headers for debugging
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        finally:
            # 5. Clean up context variable
            correlation_id_ctx.reset(token)
