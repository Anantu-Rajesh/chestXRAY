from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    password: str
    created_at: datetime