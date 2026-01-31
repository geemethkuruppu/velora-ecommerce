from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.orders import router as orders_router

# Initialize FastAPI
app = FastAPI(
    title="Order Service",
    version="1.0.0",
    description="Manages orders and orchestrates Saga transactions"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
# In production, use Alembic migrations. For dev/MVP, this is fine.
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {
        "service": "order-service",
        "status": "running",
        "port": settings.port,
        "environment": settings.env
    }

# Include Routers
# Trigger Deployment
app.include_router(orders_router, prefix="/api/v1")
