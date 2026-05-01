import random

class DummyModel:
    def predict(self, data):
        risk = random.choice(["LOW", "MEDIUM", "HIGH"])
        confidence = round(random.uniform(0.75, 0.99), 2)
        return risk, confidence

model = DummyModel()

def get_prediction(data):
    risk, confidence = model.predict(data)
    return {
        "risk": risk,
        "confidence": confidence
    }
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from model import get_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    location: str
    temperature: float
    humidity: float
    wind: float

@app.post("/predict")
def predict(data: InputData):
    if not data.location:
        raise HTTPException(status_code=400, detail="Location required")
    return get_prediction(data)

@app.post("/safety")
def safety(data: dict):
    risk = data.get("risk")

    if risk == "HIGH":
        return {"steps": ["Evacuate immediately", "Call emergency"]}

    elif risk == "MEDIUM":
        return {"steps": ["Stay alert", "Prepare kit"]}

    return {"steps": ["Safe"]}