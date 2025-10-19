# filepath: d:\Dev\Projects\CitySafe\backend\app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import reports, media, users, analytics

app = FastAPI(title="CitySafe Test Backend")

# Minimal CORS for development - adjust origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(media.router, prefix="/media", tags=["media"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
