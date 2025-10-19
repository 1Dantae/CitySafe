from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from .. import db

router = APIRouter()


@router.get("/{file_id}")
def get_media(file_id: str):
    try:
        f = db.fs.get(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="file not found")
    return StreamingResponse(f, media_type=f.content_type or "application/octet-stream")


@router.delete("/{file_id}")
def delete_media(file_id: str):
    try:
        db.fs.delete(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="file not found or could not be deleted")
    return {"status": "deleted"}
