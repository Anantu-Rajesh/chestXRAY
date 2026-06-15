import os 
import jwt  
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from fastapi import HTTPException, status, Depends
from datetime import datetime, timedelta, timezone  

load_dotenv()
priv_key=os.getenv('SECRET_KEY')
token_expiry_mins = 10080

def create_token(user_id):
    payload={
        "user_id":user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=token_expiry_mins)
    }
    token=jwt.encode(payload,priv_key,algorithm="HS256")
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, priv_key, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):     
    user_id= verify_token(token)     
    return user_id