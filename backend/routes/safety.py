from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# -----------------------------
# Request Model
# -----------------------------
class SafetyRequest(BaseModel):
    location: str
    risk_level: str
    elderly: bool
    disabled: bool
    children: bool


# -----------------------------
# ADVANCED AI LOGIC
# -----------------------------
def generate_safety_plan(data: SafetyRequest):

    risk = data.risk_level.lower()

    # -----------------------------
    # PRIORITY CALCULATION
    # -----------------------------
    if data.disabled:
        priority = "CRITICAL"
    elif data.elderly:
        priority = "HIGH"
    elif data.children:
        priority = "MEDIUM"
    else:
        priority = "NORMAL"

    # -----------------------------
    # EVACUATION PLAN
    # -----------------------------
    if risk == "high":
        evacuation = "Immediate evacuation required using safest and shortest route."
    elif risk == "medium":
        evacuation = "Prepare for evacuation. Stay alert and ready."
    else:
        evacuation = "No evacuation needed. Stay informed."

    # -----------------------------
    # SPECIAL INSTRUCTIONS
    # -----------------------------
    special = []
    alerts = []

    if data.disabled:
        special.append("Use wheelchair-accessible exits and ramps.")
        alerts.append("Avoid stairs and uneven terrain.")

    if data.elderly:
        special.append("Ensure assisted movement and avoid long distances.")
        alerts.append("Evacuate early to avoid panic.")

    if data.children:
        special.append("Keep children supervised at all times.")
        alerts.append("Carry essentials for children.")

    if not special:
        special.append("No special assistance required.")

    # -----------------------------
    # TRANSPORT RECOMMENDATION
    # -----------------------------
    if data.disabled:
        transport = "Use ambulance or assisted vehicle."
    elif data.elderly:
        transport = "Use private vehicle or assisted transport."
    else:
        transport = "Evacuate by walking or personal vehicle."

    # -----------------------------
    # FINAL RESPONSE
    # -----------------------------
    return {
        "risk": risk.upper(),
        "location": data.location,
        "evacuation_priority": priority,
        "evacuation_plan": evacuation,
        "special_instructions": special,
        "recommended_transport": transport,
        "alerts": alerts,
        "emergency_contact": "Dial 101"
    }


# -----------------------------
# API
# -----------------------------
@router.post("/safety")
def safety_api(data: SafetyRequest):
    return generate_safety_plan(data)