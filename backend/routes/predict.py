from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import io
from PIL import Image
import predict as pred
from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile=File(...)):
    file=await file.read()
    image=Image.open(io.BytesIO(file))
    result=pred.predict(image)
    return {"label": result[0], "probability": result[1], "heatmap": result[2]}