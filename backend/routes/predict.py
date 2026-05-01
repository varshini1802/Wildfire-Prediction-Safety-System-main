from fastapi import APIRouter
import torch
import numpy as np
import os

router = APIRouter()

# ======================
# PATH SETUP
# ======================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

GRID_PATH = os.path.join(PROJECT_ROOT, "data", "processed", "grid.npy")
BOUNDS_PATH = os.path.join(PROJECT_ROOT, "data", "processed", "bounds.npy")
MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "conv_lstm.pth")

# ======================
# LOAD MODEL
# ======================

from conv_lstm_model import ConvLSTM

model = ConvLSTM()
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
model.eval()

print("✅ Model Loaded!")

# ======================
# API
# ======================

@router.get("/predict-grid")
def predict_grid():

    if not os.path.exists(GRID_PATH):
        return {"error": f"Grid file not found at {GRID_PATH}"}

    if not os.path.exists(BOUNDS_PATH):
        return {"error": "Bounds file missing. Run grid_generator.py"}

    grid = np.load(GRID_PATH)
    bounds = np.load(BOUNDS_PATH, allow_pickle=True).item()

    input_seq = grid[-1:]
    input_tensor = torch.tensor(input_seq, dtype=torch.float32)
    input_tensor = input_tensor.unsqueeze(2)

    with torch.no_grad():
        output = model(input_tensor)

    prediction = output.squeeze().numpy()

    return {
        "grid": prediction.tolist(),
        "lat_min": bounds["lat_min"],
        "lat_max": bounds["lat_max"],
        "lon_min": bounds["lon_min"],
        "lon_max": bounds["lon_max"]
    }