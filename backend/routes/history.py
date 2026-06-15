from typing import List
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from db import history_collection
from utils.auth import get_current_user
from models.history import HistoryRecord
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()

class deleteModel(BaseModel):
    record_ids:List[str]

@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    history=list(history_collection.find({"user_id": user_id}))
    for record in history:
        record["_id"] = str(record["_id"])
    return history

@router.post("/history")
async def add_history(record: HistoryRecord, user_id: str = Depends(get_current_user)):
    history_record = {
        "user_id": user_id,
        "label": record.label,
        "probability": record.probability,
        "heatmap": record.heatmap,
        "original_image": record.original_image,
        "created_at": datetime.now(datetime.now().astimezone().tzinfo)
    }
    res = history_collection.insert_one(history_record)
    return {"message": "History record added", "id": str(res.inserted_id)}

@router.delete("/history/{record_id}")
async def delete_history(record_id: str, user_id: str = Depends(get_current_user)):
    res=history_collection.delete_one({"_id": ObjectId(record_id), "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History record not found")
    return {"message": "History record deleted"}

@router.delete("/history")
async def delete_multiple(request:deleteModel, user_id: str = Depends(get_current_user)):
    obj_ids=[ObjectId(id) for id in request.record_ids]
    res=history_collection.delete_many({"_id": {"$in": obj_ids}, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No history records found to delete")
    return {"message": f"{res.deleted_count} records deleted"}

