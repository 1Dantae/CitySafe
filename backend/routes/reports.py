from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from typing import Optional
import re
import db

router = APIRouter()


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


@router.post("/")
async def create_report(
    incident_type: str = Form(..., description="Type of incident", max_length=50),
    date: str = Form(None, description="Date of incident", max_length=20),
    time: str = Form(None, description="Time of incident", max_length=20), 
    location: str = Form(None, description="Location of incident", max_length=500),
    description: str = Form(None, description="Description of incident", max_length=2000),
    anonymous: bool = Form(True, description="Whether report is anonymous"),
    name: str = Form(None, description="Reporter name", max_length=100),
    phone: str = Form(None, description="Reporter phone", max_length=20),
    email: str = Form(None, description="Reporter email", max_length=100),
    lat: float = Form(None, description="Latitude for geolocation"),
    lng: float = Form(None, description="Longitude for geolocation"),
    media: UploadFile = File(None),
):
    # Validate incident type
    if incident_type.lower() not in ALLOWED_INCIDENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Incident type must be one of: {', '.join(ALLOWED_INCIDENT_TYPES)}")
    
    # Sanitize and validate inputs
    incident_type = incident_type.lower().strip()
    
    # Validate and sanitize location
    if location:
        location = location.strip()
        if len(location) > 500:
            raise HTTPException(status_code=400, detail="Location too long")
    
    # Validate and sanitize description
    if description:
        description = description.strip()
        if len(description) > 2000:
            raise HTTPException(status_code=400, detail="Description too long")
    
    # Validate and sanitize name
    if name:
        name = name.strip()
        if len(name) > 100:
            raise HTTPException(status_code=400, detail="Name too long")
    
    # Validate email format
    if email:
        email = email.strip()
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        if not re.match(email_regex, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate phone format
    if phone:
        phone = phone.strip()
        phone_clean = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace(".", "")
        phone_regex = r'^[\+]?[1-9][\d]{0,15}'
        if not re.match(phone_regex, phone_clean):
            raise HTTPException(status_code=400, detail="Invalid phone number format")
    
    # Validate coordinates
    if (lat is not None and (lat < -90 or lat > 90)) or (lng is not None and (lng < -180 or lng > 180)):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    doc = {
        "incidentType": incident_type,
        "date": date,
        "time": time,
        "description": description,
        "anonymous": anonymous,
        "name": name,
        "phone": phone,
        "email": email,
        "createdAt": __import__("datetime").datetime.utcnow(),
    }

    # Only add location field if coordinates are provided
    if lat is not None and lng is not None:
        # Store as GeoJSON point
        doc["coordinates"] = {"type": "Point", "coordinates": [float(lng), float(lat)]}
    else:
        # Store location as string if coordinates not provided
        doc["location"] = location

    # Handle media upload with validation
    if media:
        try:
            # FastAPI doesn't provide file size directly, so we'll read the content
            contents = await media.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
            
            # Check content type
            content_type = media.content_type.lower()
            if content_type not in ALLOWED_FILE_TYPES:
                raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES)}")
            
            file_id = db.fs.put(contents, filename=media.filename, contentType=media.content_type)
            doc["media_id"] = file_id
        except HTTPException:
            # Re-raise HTTP exceptions as they are already properly formatted
            raise
        except Exception as e:
            # Handle any other errors during file handling
            raise HTTPException(status_code=500, detail=f"Error processing media file: {str(e)}")

    result = db.db.reports.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/")
def list_reports(skip: int = 0, limit: int = 100):
    # Validate parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="Skip parameter must be non-negative")
    
    if limit <= 0 or limit > 1000:  # Set reasonable maximum limit
        raise HTTPException(status_code=400, detail="Limit parameter must be between 1 and 1000")
    
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
    
    docs = db.db.reports.find({"coordinates": {"$exists": True}}).sort("createdAt", -1).skip(skip).limit(limit)
    features = []
    for d in docs:
        coords = d["coordinates"]["coordinates"]
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