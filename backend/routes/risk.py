from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

# -----------------------------
# Request Model
# -----------------------------
class RiskRequest(BaseModel):
    latitude: float
    longitude: float


# -----------------------------
# LOCATION-BASED LOGIC
# -----------------------------
def calculate_risk(lat, lon):

    # Simulated zones
    if 12 <= lat <= 15 and 75 <= lon <= 78:
        zone = "Forest Region"
        base_risk = 0.8
    elif 20 <= lat <= 25:
        zone = "Dry Zone"
        base_risk = 0.6
    else:
        zone = "Urban/Low Risk Area"
        base_risk = 0.3

    # Add randomness (simulate ML confidence)
    confidence = round(base_risk + random.uniform(-0.1, 0.1), 2)

    if confidence > 0.7:
        risk = "HIGH"
    elif confidence > 0.4:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "risk": risk,
        "zone": zone,
        "confidence": confidence
    }


# -----------------------------
# API
# -----------------------------
@router.post("/risk")
def risk_api(data: RiskRequest):
    return calculate_risk(data.latitude, data.longitude)