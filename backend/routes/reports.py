from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId
from typing import Optional
import re
import db
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime

router = APIRouter()


# Pydantic model for report data
class ReportData(BaseModel):
    incident_type: str = Field("other", alias="incidentType")
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    anonymous: bool = True
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    witnesses: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    user_id: Optional[str] = Field(None, alias="userId")

    @validator('lat')
    def validate_lat(cls, v):
        if v is not None and (v < -90 or v > 90):
            raise ValueError('Invalid latitude')
        return v

    @validator('lng')
    def validate_lng(cls, v):
        if v is not None and (v < -180 or v > 180):
            raise ValueError('Invalid longitude')
        return v

# Define allowed incident types
ALLOWED_INCIDENT_TYPES = {
    "assault", "theft", "harassment", "vandalism", "accident", 
    "suspicious_activity", "other"
}

# Define allowed file types
ALLOWED_FILE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "video/mp4", 
    "video/mov", "video/quicktime", "video/avi", "video/wmv"
}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("")
async def create_report(
    report_data: ReportData = Depends(),
    media: UploadFile = File(None)
):
    # Validate incident type
    if report_data.incident_type.lower() not in ALLOWED_INCIDENT_TYPES:
        report_data.incident_type = 'other'

    doc = {
        'incidentType': report_data.incident_type,
        'description': report_data.description,
        'anonymous': report_data.anonymous,
        'name': report_data.name,
        'phone': report_data.phone,
        'email': report_data.email,
        'witnesses': report_data.witnesses,
        'createdAt': datetime.utcnow(),
    }
    # associate with user if provided
    if report_data.user_id:
        try:
            doc['user_id'] = ObjectId(report_data.user_id)
        except Exception:
            # store as string if it isn't a valid ObjectId
            doc['user_id'] = report_data.user_id

    # Store location: GeoJSON when coordinates provided, otherwise store location string
    if report_data.lat is not None and report_data.lng is not None:
        doc['location'] = {'type': 'Point', 'coordinates': [report_data.lng, report_data.lat]}
    elif report_data.location:
        doc['location'] = report_data.location

    # Handle media upload
    if media:
        try:
            contents = await media.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail='File too large. Maximum size is 10MB')
            content_type = (media.content_type or '').lower()
            if content_type not in ALLOWED_FILE_TYPES:
                raise HTTPException(status_code=400, detail=f'File type not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES)}')
            file_id = db.fs.put(contents, filename=media.filename, contentType=media.content_type)
            doc['media_id'] = file_id
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'Error processing media file: {str(e)}')

    result = db.db.reports.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/")
def list_reports(skip: int = 0, limit: int = 100):
    # Validate parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="Skip parameter must be non-negative")
    
    if limit <= 0 or limit > 1000:  # Set reasonable maximum limit
        raise HTTPException(status_code=400, detail="Limit parameter must be between 1 and 1000")
    
    # optional user filter
    user_id = None
    # FastAPI query params can be read in but for simplicity accept from function args if passed as str
    # If the user wants filtering, they can call /reports?user_id=<id>
    # Using request query parsing here would require Request injection; keep simple for now
    docs = list(db.db.reports.find().sort("createdAt", -1).skip(skip).limit(limit))
    return [db.oid_str(d) for d in docs]


@router.get("/{report_id}")
def get_report(report_id: str):
    try:
        object_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID format")
    
    doc = db.db.reports.find_one({"_id": object_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    return db.oid_str(doc)


@router.get("/geojson")
def reports_geojson(skip: int = 0, limit: int = 1000):
    # Validate parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="Skip parameter must be non-negative")
    
    if limit <= 0 or limit > 10000:  # Set reasonable maximum limit for geojson
        raise HTTPException(status_code=400, detail="Limit parameter must be between 1 and 10000")
    
    # Find documents that have a GeoJSON location object
    docs = db.db.reports.find({"location": {"$exists": True, "$type": "object"}}).sort("createdAt", -1).skip(skip).limit(limit)
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