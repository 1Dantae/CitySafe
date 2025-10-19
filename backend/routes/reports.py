from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from .. import db

router = APIRouter()


@router.post("/")
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
    lat: float = Form(None),
    lng: float = Form(None),
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

    if lat is not None and lng is not None:
        # Store as GeoJSON point
        doc["location"] = {"type": "Point", "coordinates": [float(lng), float(lat)]}

    if media:
        contents = await media.read()
        file_id = db.fs.put(contents, filename=media.filename, contentType=media.content_type)
        doc["media_id"] = file_id

    result = db.db.reports.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/")
def list_reports():
    docs = list(db.db.reports.find().sort("createdAt", -1).limit(100))
    return [db.oid_str(d) for d in docs]


@router.get("/{report_id}")
def get_report(report_id: str):
    try:
        doc = db.db.reports.find_one({"_id": ObjectId(report_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    return db.oid_str(doc)


@router.get("/geojson")
def reports_geojson():
    docs = db.db.reports.find({"location": {"$exists": True}})
    features = []
    for d in docs:
        coords = d["location"]["coordinates"]
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": coords},
            "properties": {
                "id": str(d["_id"]),
                "incidentType": d.get("incidentType"),
                "createdAt": d.get("createdAt").isoformat() if d.get("createdAt") else None,
            },
        })
    return {"type": "FeatureCollection", "features": features}
