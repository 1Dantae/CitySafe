# CitySafe — Temporary Python + MongoDB backend (test space)

This document shows a minimal FastAPI + MongoDB (GridFS for media) backend you can run locally for testing with the mobile app and website.

Overview
- Run MongoDB locally (recommended with Docker) or use MongoDB Atlas.
- Run a small FastAPI app that exposes:
  - POST /reports — multipart/form-data to save report metadata + optional media file
  - GET /reports — list reports
  - GET /reports/{id} — single report
  - GET /media/{file_id} — stream media stored in GridFS

Files to create
- `backend/app.py` — FastAPI server
- `backend/requirements.txt`
- optionally a Docker command to run MongoDB for testing

1) Run MongoDB locally (Docker)
```bash
# run a local mongo for testing
docker run -d -p 27017:27017 --name citysafe-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=pass \
  mongo:6.0
```
Set MONGO_URI to: `mongodb://admin:pass@localhost:27017`

2) Python requirements (create backend/requirements.txt)
- fastapi
- uvicorn[standard]
- pymongo
- python-multipart
- gridfs

3) Minimal server (backend/app.py)
```py
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
```

4) Run the server (from backend folder)
```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

5) Test with curl
- Create report without file:
```bash
curl -X POST http://localhost:8000/reports \
  -F "incidentType=Theft" -F "location=Kingston" -F "description=Test"
```
- Create with file:
```bash
curl -X POST http://localhost:8000/reports \
  -F "incidentType=Vandalism" -F "location=X" -F "description=photo" \
  -F "media=@/path/to/photo.jpg"
```

6) Mobile (React Native) — quick example to upload from your ReportScreen
- See your file: [mobile/components/report/ReportScreen.tsx](mobile/components/report/ReportScreen.tsx)
- Example POST using FormData (Android emulator uses 10.0.2.2 for host machine)
```ts
// example snippet to run from RN (modify in ReportScreen.handleSubmit)
const submitToBackend = async () => {
  const url = "http://10.0.2.2:8000/reports"; // or http://localhost:8000 on simulator
  const form = new FormData();
  form.append("incidentType", formData.incidentType);
  form.append("location", formData.location);
  form.append("description", formData.description);

  if (pickedImage) {
    const filename = pickedImage.split('/').pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";
    // For Expo / React Native, append an object with uri, name, type
    form.append("media", { uri: pickedImage, name: filename, type } as any);
  }

  await fetch(url, {
    method: "POST",
    body: form,
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

Notes and tips
- When testing on Android emulator, use 10.0.2.2 to reach host machine's localhost.
- For production, use authentication and validate inputs before saving.
- For easier async drivers you can use `motor` (async) instead of `pymongo`, but GridFS support with motor is a bit different.
- You can also use an object storage (S3) for media and store URL in MongoDB if you prefer not to use GridFS.

Related workspace files
- Mobile entry/ui: [mobile/app/index.tsx](mobile/app/index.tsx)
- Mobile report screen: [mobile/components/report/ReportScreen.tsx](mobile/components/report/ReportScreen.tsx)

This is a minimal test backend — if you want, I can:
- generate `backend/app.py` and `backend/requirements.txt` files for you now
- add a small Postman/curl collection
- or switch to Flask or async motor implementation