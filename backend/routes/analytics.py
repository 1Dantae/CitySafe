from fastapi import APIRouter
import db
from bson.son import SON

router = APIRouter()


@router.get("/counts")
def total_counts():
    total_reports = db.db.reports.count_documents({})
    total_users = db.db.users.count_documents({})
    return {"reports": total_reports, "users": total_users}


@router.get("/density")
def density_grid(size_meters: int = 500):
    """Return simple aggregation of report counts by a geo-hash-like grid using $geoNear/$bucketAuto fallback.
    This is a minimal placeholder for real tiling/vector aggregation.
    """
    # For a production-ready implementation, use PostGIS / Tegola or generate vector tiles.
    pipeline = [
        {"$match": {"location": {"$exists": True}}},
        {"$project": {"coords": "$location.coordinates"}},
        {"$group": {"_id": {"coords": "$coords"}, "count": {"$sum": 1}}},
        {"$limit": 1000}
    ]
    docs = list(db.db.reports.aggregate(pipeline))
    # Convert to simple array
    out = []
    for d in docs:
        out.append({"coords": d["_id"]["coords"], "count": d["count"]})
    return out
