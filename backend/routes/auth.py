from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import db
from bson import ObjectId
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from typing import Optional

router = APIRouter()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
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

@router.post("/register")
async def register_user(user_data: dict):
    email = user_data.get("email")
    password = user_data.get("password")
    full_name = user_data.get("fullName")
    phone = user_data.get("phone")
    
    if not all([email, password, full_name]):
        raise HTTPException(status_code=400, detail="Email, password, and full name are required")
    
    # Check if user already exists
    existing_user = db.db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Create user document
    user_doc = {
        "email": email,
        "password": hashed_password,
        "full_name": full_name,
        "phone": phone,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user
    result = db.db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    
    # Create access token
    token_data = {"user_id": str(result.inserted_id), "email": email}
    token = create_access_token(data=token_data)
    
    # Remove password from response
    del user_doc["password"]
    
    return {"token": token, "user": user_doc}

@router.post("/login")
async def login_user(credentials: dict):
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not all([email, password]):
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Find user
    user = db.db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Update last login
    db.db.users.update_one(
        {"_id": user["_id"]}, 
        {"$set": {"last_login": datetime.utcnow()}}
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