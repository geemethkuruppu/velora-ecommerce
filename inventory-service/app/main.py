from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.inventory import router as inventory_router
from app.models.inventory import Inventory, InventoryReservation, InventoryEvent

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Inventory Service - Manages product stock and reservations with Saga pattern support"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {
        "service": settings.app_name,
        "environment": settings.env,
        "status": "running",
        "port": settings.port
    }

app.include_router(inventory_router, prefix="/api/v1")
