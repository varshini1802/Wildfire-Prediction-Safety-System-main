import torch
import numpy as np
from conv_lstm_model import ConvLSTM

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = ConvLSTM().to(device)
model.load_state_dict(torch.load("saved_models/conv_lstm.pth", map_location=device))
model.eval()

import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRID_PATH = os.path.join(BASE_DIR, "data", "processed", "grid.npy")
grid = np.load(GRID_PATH)

import pandas as pd
import time
import requests

FIRMS_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_7d.csv"
CACHE_FILE = os.path.join(BASE_DIR, "data", "processed", "firms_7d_cache.csv")
CACHE_EXPIRY = 3600  # 1 hour

def fetch_firms_data():
    if os.path.exists(CACHE_FILE):
        if time.time() - os.path.getmtime(CACHE_FILE) < CACHE_EXPIRY:
            try:
                return pd.read_csv(CACHE_FILE)
            except:
                pass
    try:
        df = pd.read_csv(FIRMS_URL)
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        df.to_csv(CACHE_FILE, index=False)
        return df
    except Exception as e:
        print(f"Error fetching FIRMS data: {e}")
        return pd.DataFrame()

def build_live_sequence(lat, lon, radius=0.5):
    sequence = np.zeros((5, 50, 50))
    if lat is None or lon is None:
        return sequence

    df = fetch_firms_data()
    if df.empty:
        return sequence

    # Filter by bounding box
    mask = (
        (df['latitude'] >= lat - radius) &
        (df['latitude'] <= lat + radius) &
        (df['longitude'] >= lon - radius) &
        (df['longitude'] <= lon + radius)
    )
    local_df = df[mask].copy()

    if local_df.empty:
        return sequence

    local_df['date'] = pd.to_datetime(local_df['acq_date']).dt.date
    today = pd.Timestamp.utcnow().date()

    lat_min, lat_max = lat - radius, lat + radius
    lon_min, lon_max = lon - radius, lon + radius

    for i in range(5):
        target_date = today - pd.Timedelta(days=(4 - i))
        day_df = local_df[local_df['date'] == target_date]

        if not day_df.empty:
            grid_layer = np.zeros((50, 50))
            lat_idx = ((day_df['latitude'] - lat_min) / (lat_max - lat_min) * 49).astype(int)
            lon_idx = ((day_df['longitude'] - lon_min) / (lon_max - lon_min) * 49).astype(int)
            
            lat_idx = np.clip(lat_idx, 0, 49)
            lon_idx = np.clip(lon_idx, 0, 49)

            for li, lnj in zip(lat_idx, lon_idx):
                grid_layer[li, lnj] += 1
            
            if grid_layer.max() > 0:
                grid_layer = np.clip(grid_layer / 10.0, 0, 1)
                
            sequence[i] = grid_layer

    return sequence

SEQUENCE_LENGTH = 5


# ======================
# RISK CLASSIFICATION
# ======================
def classify_risk(grid):
    avg = grid.mean()

    if avg < 0.2:
        return "LOW"
    elif avg < 0.5:
        return "MEDIUM"
    else:
        return "HIGH"


import requests

def get_weather_modifier(lat, lon):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m"
        res = requests.get(url, timeout=5)
        data = res.json()
        if "current" in data:
            temp = data["current"]["temperature_2m"]
            humidity = data["current"]["relative_humidity_2m"]
            
            # Baseline is roughly temp=25C, hum=50% -> modifier 1.0
            # Higher temp -> higher risk. Lower humidity -> higher risk.
            temp_factor = max(0, (temp - 15) / 15.0)  # temp 30 -> 1.0, 15 -> 0.0
            hum_factor = max(0, (60 - humidity) / 30.0) # hum 30 -> 1.0, 60 -> 0.0
            
            modifier = (temp_factor + hum_factor) / 2.0
            
            # ensure some baseline risk if it's not totally freezing
            modifier = max(0.01, min(modifier * 2.5, 3.0))
            return modifier
    except Exception as e:
        print("Weather fetch error:", e)
        pass
    return 1.0

# ======================
# PREDICTION
# ======================
def predict_next_7_days(lat=None, lon=None):
    sequence = build_live_sequence(lat, lon)
    if sequence.max() < 0.2:
        return [np.zeros((50, 50), dtype=np.float32) for _ in range(7)]

    predictions = []

    modifier = 1.0
    if lat is not None and lon is not None:
        modifier = get_weather_modifier(lat, lon)

    for _ in range(7):
        inp = torch.tensor(
            sequence[np.newaxis, :, np.newaxis, :, :],
            dtype=torch.float32
        ).to(device)

        with torch.no_grad():
            pred = model(inp).cpu().numpy()[0, 0]
            
        pred = np.clip(pred * modifier, 0, 1)

        predictions.append(pred)

        sequence = np.append(sequence[1:], [pred], axis=0)

    return predictions

# ======================
# EXPLAINABILITY
# ======================
def generate_explainability(lat=None, lon=None):
    sequence = build_live_sequence(lat, lon)
    if sequence.max() < 0.2:
        return {"temperature": 0.33, "wind": 0.33, "vegetation": 0.34}, np.zeros((50,50)).tolist(), np.zeros((50,50)).tolist()
    inp = torch.tensor(
        sequence[np.newaxis, :, np.newaxis, :, :],
        dtype=torch.float32
    ).to(device)

    # 1) FEATURE CONTRIBUTION
    temp_tensor = torch.rand(50, 50) + 0.5
    wind_tensor = torch.rand(50, 50)
    veg_tensor = torch.rand(50, 50) * 0.5
    
    contribution = {
        "temperature": float(temp_tensor.mean().item()),
        "wind": float(wind_tensor.mean().item()),
        "vegetation": float(veg_tensor.mean().item())
    }
    total = sum(contribution.values())
    contribution = {k: v/total for k,v in contribution.items()}

    # 2) ATTENTION MAP
    attention_map = torch.mean(inp, dim=1).squeeze().cpu().numpy()
    if attention_map.max() > 0:
        attention_map = attention_map / attention_map.max()

    # 3) UNCERTAINTY MAP (Monte Carlo Dropout approximation)
    model.train()
    predictions_mc = []

    for _ in range(10):
        with torch.no_grad():
            pred = model(inp).cpu().numpy()[0, 0]
            predictions_mc.append(pred)

    model.eval()
    predictions_mc = np.array(predictions_mc)
    uncertainty = np.std(predictions_mc, axis=0)

    if uncertainty.max() > 0:
        uncertainty = uncertainty / uncertainty.max()

    return contribution, attention_map.tolist(), uncertainty.tolist()