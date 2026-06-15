from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class History(BaseModel):
    id: Optional[str] = None
    user_id: str
    original_image: Optional[str] = None
    heatmap: str 
    label: str
    probability: float
    created_at: Optional[datetime] = None
    
class HistoryRecord(BaseModel):
    label: str
    probability: float
    heatmap: str
    original_image: str