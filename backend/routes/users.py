from fastapi import APIRouter, HTTPException
from .. import db
from bson import ObjectId

router = APIRouter()


@router.get("/")
def list_users():
    # Placeholder: in real app, implement pagination, filtering and auth
    docs = list(db.db.users.find().limit(100))
    out = []
    for d in docs:
        d["_id"] = str(d["_id"])
        out.append(d)
    return out


@router.get("/{user_id}")
def get_user(user_id: str):
    try:
        doc = db.db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    doc["_id"] = str(doc["_id"])
    return doc
