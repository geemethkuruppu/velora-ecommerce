from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.inventory import router as inventory_router
from app.api.v1.events import router as events_router
from app.models.inventory import Inventory, InventoryReservation, InventoryEvent

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Inventory Service - Manages product stock and reservations with Saga pattern support"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(events_router, prefix="/api/v1")
