from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base
from app.api.v1.products import router as products_router
from app.api.v1.types import router as types_router
import os

app = FastAPI(title="Product Service")

# Create uploads directory if it doesn't exist
os.makedirs("uploads/products", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "running", "service": "product-service", "port": 8001}

app.include_router(products_router, prefix="/api/v1")
app.include_router(types_router, prefix="/api/v1")
