from datetime import datetime
from pydantic import BaseModel
from db import users_collection
from utils.auth import create_token
from fastapi import APIRouter,HTTPException
from utils.hash import hash_passwd,verify_passwd

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str
    
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/auth/login")
async def login(request: LoginRequest):
    user=users_collection.find_one({"email":request.email})
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    if not verify_passwd(request.password, user["password"]):
        raise HTTPException(status_code=400,detail="Incorrect password")
    token = create_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer","name": user["name"]}

@router.post("/auth/signup")
async def signup(request: SignupRequest):
    if users_collection.find_one({"email": request.email}):
        raise HTTPException(status_code=400,detail="User already exists")
    hashed_passwd = hash_passwd(request.password)
    user={
        "name":request.name,
        "email":request.email,
        "password":hashed_passwd,
        "created_at": datetime.now()
    }
    res=users_collection.insert_one(user)
    user_id=str(res.inserted_id)
    token = create_token(user_id)
    return {"access_token": token, "token_type": "bearer","name": request.name}