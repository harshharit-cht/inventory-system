from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import products_router, customers_router, orders_router, dashboard_router
import app.models
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Inventory API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "Inventory API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}