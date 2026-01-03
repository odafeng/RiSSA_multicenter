from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models # Ensure models are registered
from sqlalchemy import text
from .routers import projects, upload

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RiSSA Multi-center Platform")

from fastapi.middleware.cors import CORSMiddleware
import os

# Get allowed origins from environment or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to RiSSA Platform API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to check DB connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
