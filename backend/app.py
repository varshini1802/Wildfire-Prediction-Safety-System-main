from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from predict import predict_next_7_days, classify_risk, generate_explainability

app = FastAPI()

# ======================
# CORS (VERY IMPORTANT for React)
# ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# SAFETY API
# ======================
@app.get("/safety")
def safety_status():
    return {"status": "Monitoring Active", "systems": "Online"}

# ======================
# ROOT API
# ======================
@app.get("/")
def home():
    return {"message": "🔥 Wildfire Prediction API Running"}

# ======================
# PREDICTION API
# ======================
from pydantic import BaseModel

class PredictRequest(BaseModel):
    lat: float
    lon: float

@app.post("/predict")
def predict(req: PredictRequest):
    preds = predict_next_7_days(req.lat, req.lon)
    import numpy as np
    
    all_days = np.array(preds)
    overall_risk = classify_risk(all_days)
    overall_intensity = float(all_days.mean())
    forecast_list = [day.tolist() for day in preds]

    contribution, attention_map, uncertainty_map = generate_explainability(req.lat, req.lon)

    return {
        "status": "success",
        "risk": overall_risk,
        "intensity": overall_intensity,
        "forecast": forecast_list,
        "explainability": contribution,
        "attention_map": attention_map,
        "uncertainty_map": uncertainty_map
    }

# ======================
# STEP 4: EMERGENCY PLATFORM
# ======================
from pydantic import BaseModel
from typing import List, Optional

class RiskRequest(BaseModel):
    lat: float
    lng: float
    grid: List[List[float]]

@app.post("/risk")
def calculate_risk(req: RiskRequest):
    import numpy as np
    grid_arr = np.array(req.grid)
    max_val = np.max(grid_arr)
    # Simple proximity alert check based on overall grid maximum or center proxy
    alert = bool(max_val > 0.6)
    message = "Fire detected nearby!" if alert else "Safe"
    return {"alert": alert, "message": message}

class AssistantRequest(BaseModel):
    messages: List[dict]
    context: Optional[dict] = None

@app.post("/assistant")
def chat_assistant(req: AssistantRequest):
    user_msgs = [m["content"].lower() for m in req.messages if m.get("role") == "user"]
    msg = user_msgs[-1] if user_msgs else ""
    ctx = req.context or {}
    
    direction = ctx.get("direction", "unknown")
    risk = ctx.get("level", "UNKNOWN")
    
    if any(keyword in msg for keyword in ["help", "fire nearby", "trapped", "smoke", "injured", "emergency"]):
        reply = f"🚨 **EMERGENCY DETECTED** 🚨\n\n1. Call 911 immediately if you are trapped.\n2. Evacuate immediately! The fire is moving {direction}.\n3. Stay low if there is smoke.\n\nSeek immediate safe shelter."
    elif "evacuate" in msg or "where" in msg:
        reply = f"The nearest safe shelter is Shelter A, located 2.3 miles away. Avoid the active fire zones spreading towards the {direction}."
    elif "wheelchair" in msg or "disabled" in msg or "grandmother" in msg:
        reply = "Use accessible Route B (Highway 9). Shelter A has wheelchair ramps and medical aid available."
    elif "dangerous" in msg or "risk" in msg:
        reply = f"The current prediction model shows a **{risk}** risk level. Stay alert and prepare an emergency kit."
    elif "thank" in msg or "ok" in msg:
        reply = "Stay safe. I am monitoring the situation continuously."
    else:
        reply = "I am monitoring the wildfire situation. Please ask me about evacuation routes, current risk levels, or emergency actions."
        
    return {"reply": reply}

class SimulateRequest(BaseModel):
    scenario: str

@app.post("/simulate")
def simulate(req: SimulateRequest):
    # Mock adjustment response based on scenario
    return {"status": "Scenario Adjusted", "scenario": req.scenario}