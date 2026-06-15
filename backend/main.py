from pathlib import Path
import sys
from fastapi import FastAPI
from routes import predict, auth, history
from fastapi.middleware.cors import CORSMiddleware
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
	sys.path.insert(0, str(ROOT_DIR))
import predict as pred

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

pred.load_model()

app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(history.router)