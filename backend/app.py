# filepath: d:\Dev\Projects\CitySafe\backend\app.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pymongo import MongoClient
import gridfs
from bson import ObjectId
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["citysafe"]
fs = gridfs.GridFS(db)

app = FastAPI(title="CitySafe Test Backend")

def oid_str(d):
    d = dict(d)
    d["_id"] = str(d["_id"])
    if "media_id" in d:
        d["media_id"] = str(d["media_id"])
        d["media_url"] = f"/media/{d['media_id']}"
    return d

@app.post("/reports")
async def create_report(
    incidentType: str = Form(...),
    date: str = Form(None),
    time: str = Form(None),
    location: str = Form(None),
    description: str = Form(None),
    anonymous: bool = Form(True),
    name: str = Form(None),
    phone: str = Form(None),
    email: str = Form(None),
    media: UploadFile = File(None),
):
    doc = {
        "incidentType": incidentType,
        "date": date,
        "time": time,
        "location": location,
        "description": description,
        "anonymous": anonymous,
        "name": name,
        "phone": phone,
        "email": email,
        "createdAt": __import__("datetime").datetime.utcnow(),
    }

    if media:
        contents = await media.read()
        file_id = fs.put(contents, filename=media.filename, contentType=media.content_type)
        doc["media_id"] = file_id

    result = db.reports.insert_one(doc)
    return {"id": str(result.inserted_id)}

@app.get("/reports")
def list_reports():
    docs = list(db.reports.find().sort("createdAt", -1).limit(100))
    return [oid_str(d) for d in docs]

@app.get("/reports/{report_id}")
def get_report(report_id: str):
    try:
        doc = db.reports.find_one({"_id": ObjectId(report_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    return oid_str(doc)

@app.get("/media/{file_id}")
def get_media(file_id: str):
    try:
        f = fs.get(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="file not found")
    return StreamingResponse(f, media_type=f.content_type or "application/octet-stream")