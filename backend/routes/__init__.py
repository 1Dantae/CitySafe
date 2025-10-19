"""Routes package for CitySafe backend.

This file makes the `routes` directory a package so imports like
`from routes import reports` work when running uvicorn from the `backend` folder.
"""

__all__ = ["reports", "media", "users", "analytics"]
