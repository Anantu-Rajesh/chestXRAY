import io 
from PIL import Image
import predict as pred
from fastapi import FastAPI,UploadFile,File

app=FastAPI()
pred.load_model()

@app.post("/predict")
async def predict(file: UploadFile=File(...)):
    file=await file.read()
    image=Image.open(io.BytesIO(file))
    result=pred.predict(image)
    return {"label": result[0], "probability": result[1], "heatmap": result[2]}