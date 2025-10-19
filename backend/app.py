# filepath: d:\Dev\Projects\CitySafe\backend\app.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from routes import reports, media, users, analytics, auth
from db import db

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
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/health")
def health_check():
    try:
        # Check if we can connect to the database
        # Use the client's admin ping for a reliable server check
        db.client.admin.command("ping")
        return JSONResponse({"status": "ok", "database": "connected"}, status_code=200)
    except Exception as e:
        return JSONResponse({"status": "error", "database": "disconnected", "error": str(e)}, status_code=503)
