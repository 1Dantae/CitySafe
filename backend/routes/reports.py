from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
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
async def create_report(request: Request, media: UploadFile = File(None)):
    # Read the multipart form and normalize keys (supports snake_case and camelCase from clients)
    form = await request.form()
    def get_field(*keys, default=None):
        for k in keys:
            if k in form and form[k] is not None:
                return form[k]
        return default

    incident_type = get_field('incident_type', 'incidentType', default='other')
    date = get_field('date')
    time = get_field('time')
    location_str = get_field('location')
    description = get_field('description')
    anonymous = get_field('anonymous', default='true')
    name = get_field('name')
    phone = get_field('phone')
    email = get_field('email')
    witnesses = get_field('witnesses')
    lat = get_field('lat')
    lng = get_field('lng')

    # Normalize types
    try:
        anonymous = True if str(anonymous).lower() in ('true', '1', 'yes') else False
    except Exception:
        anonymous = True

    try:
        lat = float(lat) if lat is not None else None
        lng = float(lng) if lng is not None else None
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid lat/lng')

    # Validate incident type
    if incident_type and isinstance(incident_type, str) and incident_type.lower() not in ALLOWED_INCIDENT_TYPES:
        # allow unknown types but normalize
        incident_type = 'other'

    # Sanitize fields
    incident_type = str(incident_type).strip()
    if description:
        description = str(description).strip()
    if location_str:
        location_str = str(location_str).strip()
    if name:
        name = str(name).strip()
    if email:
        email = str(email).strip()

    # Basic email validation
    if email:
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        if not re.match(email_regex, email):
            raise HTTPException(status_code=400, detail='Invalid email format')

    # Validate phone
    if phone:
        phone_clean = str(phone).replace(' ', '').replace('-', '').replace('(', '').replace(')', '').replace('.', '')
        phone_regex = r'^[\+]?[0-9]{3,20}$'
        if not re.match(phone_regex, phone_clean):
            raise HTTPException(status_code=400, detail='Invalid phone number format')

    # Validate coordinates ranges
    if (lat is not None and (lat < -90 or lat > 90)) or (lng is not None and (lng < -180 or lng > 180)):
        raise HTTPException(status_code=400, detail='Invalid coordinates')

    doc = {
        'incidentType': incident_type,
        'date': date,
        'time': time,
        'description': description,
        'anonymous': anonymous,
        'name': name,
        'phone': phone,
        'email': email,
        'witnesses': witnesses,
        'createdAt': __import__('datetime').datetime.utcnow(),
    }
    # associate with user if provided
    user_id = get_field('user_id', 'userId')
    if user_id:
        try:
            doc['user_id'] = ObjectId(str(user_id))
        except Exception:
            # store as string if it isn't a valid ObjectId
            doc['user_id'] = str(user_id)

    # Store location: GeoJSON when coordinates provided, otherwise store location string
    if lat is not None and lng is not None:
        doc['location'] = {'type': 'Point', 'coordinates': [float(lng), float(lat)]}
    elif location_str:
        doc['location'] = location_str

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
    return {'id': str(result.inserted_id)}


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