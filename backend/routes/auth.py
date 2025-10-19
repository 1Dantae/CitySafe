from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import db
from bson import ObjectId
import jwt
from datetime import datetime, timedelta, timezone
import os
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import time

router = APIRouter()

# Security
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
# authoritative expiry (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Simple in-memory rate limiter (token-bucket style) for /register
_RATE_LIMIT_STORE: dict = {}
RATE_LIMIT_CAPACITY = int(os.getenv("RATE_LIMIT_CAPACITY", "5"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))

def rate_limit(key: str):
    """Very small token-bucket limiter keyed by string (e.g., IP)."""
    now = int(time.time())
    bucket = _RATE_LIMIT_STORE.get(key, {"tokens": RATE_LIMIT_CAPACITY, "last": now})
    # refill
    delta = now - bucket["last"]
    if delta > 0:
        # refill tokens proportional to elapsed time
        refill = (delta / RATE_LIMIT_WINDOW) * RATE_LIMIT_CAPACITY
        bucket["tokens"] = min(RATE_LIMIT_CAPACITY, bucket["tokens"] + refill)
        bucket["last"] = now
    if bucket["tokens"] >= 1:
        bucket["tokens"] -= 1
        _RATE_LIMIT_STORE[key] = bucket
        return True
    _RATE_LIMIT_STORE[key] = bucket
    return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # JWT exp expects an int timestamp
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return user_id
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


@router.get('/me')
def get_me(user_id: str = Depends(get_current_user)):
    user = db.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "fullName": user.get("full_name"),
        "phone": user.get("phone"),
        "createdAt": user.get("created_at"),
    }

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    fullName: str = Field(..., min_length=1)
    phone: Optional[str] = None


@router.post("/register")
async def register_user(request: Request, user_data: UserRegister):
    # rate limit by client IP
    ip = request.client.host if request.client else 'unknown'
    if not rate_limit(ip):
        raise HTTPException(status_code=429, detail='Too many registration attempts. Try again later.')

    email = user_data.email
    password = user_data.password
    full_name = user_data.fullName
    phone = user_data.phone

    # Check if user already exists
    existing_user = db.db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create user document
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "phone": phone,
        "created_at": now,
        "updated_at": now
    }

    # Insert user
    result = db.db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    # Log insertion for debugging
    try:
        print(f"[auth.register] inserted user id={result.inserted_id} email={email}")
    except Exception:
        pass

    # Create access token
    token_data = {"user_id": str(result.inserted_id), "email": email}
    token = create_access_token(data=token_data)

    # Remove password from response
    del user_doc["password"]

    return {"token": token, "user": {
        "id": user_doc["_id"],
        "email": user_doc["email"],
        "fullName": user_doc["full_name"],
        "phone": user_doc.get("phone"),
        "createdAt": user_doc.get("created_at")
    }}

@router.post("/login")
async def login_user(credentials: dict):
    email = credentials.get("email")
    password = credentials.get("password")

    if not all([email, password]):
        raise HTTPException(status_code=400, detail="Email and password are required")

    # Find user
    user = db.db.users.find_one({"email": email})
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Update last login
    db.db.users.update_one(
        {"_id": user["_id"]}, 
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    # Create access token
    token_data = {"user_id": str(user["_id"]), "email": user["email"]}
    token = create_access_token(data=token_data)

    # Prepare user response (without password)
    user_response = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone"),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
        "last_login": user.get("last_login")
    }

    return {"token": token, "user": user_response}