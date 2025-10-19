from pymongo import MongoClient
import gridfs
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["citysafe"]

# Initialize GridFS
fs = gridfs.GridFS(db)

# Create geospatial index for reports.location if it doesn't exist
try:
    db.reports.create_index([("location", "2dsphere")], background=True)
except Exception:
    # Index creation may fail in certain test environments; ignore for now
    pass

def oid_str(d):
    d = dict(d)
    d["_id"] = str(d["_id"])
    if "media_id" in d:
        d["media_id"] = str(d["media_id"])
        d["media_url"] = f"/media/{d['media_id']}"
    return d
