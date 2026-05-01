import pandas as pd
import numpy as np
import os

# ======================
# CONFIG
# ======================

DATA_PATH = os.path.join("data", "raw", "wildfire.csv")

LAT_COL = "LATITUDE"
LON_COL = "LONGITUDE"
DATE_COL = "DISCOVERY_DATE"

GRID_SIZE = 50

# ======================
# LOAD DATA
# ======================

print("📂 Loading data...")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError("❌ wildfire.csv not found in data/raw/")

df = pd.read_csv(DATA_PATH, low_memory=False)

print("✅ Data Loaded:", df.shape)

# ======================
# DATE HANDLING (ROBUST FINAL)
# ======================

print("🧠 Fixing date format...")

first_val = pd.to_numeric(df[DATE_COL].dropna().iloc[0:1], errors="coerce").values
if len(first_val) > 0 and not pd.isna(first_val[0]) and first_val[0] > 2000000:
    print("⚠️ Detected Julian date format, applying conversion...")
    numeric_dates = pd.to_numeric(df[DATE_COL], errors="coerce")
    df["date"] = pd.to_datetime(numeric_dates, origin="julian", unit="D", errors="coerce")
else:
    # Try direct parsing first (for string dates)
    df["date"] = pd.to_datetime(df[DATE_COL], errors="coerce")

    # If too many failed → assume numeric format
    if df["date"].isna().sum() > 0.8 * len(df):
        print("⚠️ Detected numeric date format, applying Excel conversion...")

        numeric_dates = pd.to_numeric(df[DATE_COL], errors="coerce")

        df["date"] = pd.to_datetime(
            numeric_dates,
            origin="1899-12-30",
            unit="D",
            errors="coerce"
        )

# Drop invalid rows
df = df.dropna(subset=[LAT_COL, LON_COL, "date"])

# Convert to date only
df["date_only"] = df["date"].dt.date

print("✅ Cleaned Data:", df.shape)
print("📅 Unique dates:", df["date_only"].nunique())

# ======================
# GROUPING
# ======================

df = df.sort_values("date_only")
grouped = df.groupby("date_only")

print("📦 Total groups:", len(grouped))

# ======================
# GRID BOUNDS
# ======================

lat_min, lat_max = df[LAT_COL].min(), df[LAT_COL].max()
lon_min, lon_max = df[LON_COL].min(), df[LON_COL].max()

print("🌍 Bounds:")
print("Lat:", lat_min, lat_max)
print("Lon:", lon_min, lon_max)

# ======================
# CREATE GRIDS
# ======================

print("🧱 Creating spatial grids...")

daily_grids = []

for date, group in grouped:
    grid = np.zeros((GRID_SIZE, GRID_SIZE))

    lat_idx = ((group[LAT_COL] - lat_min) / (lat_max - lat_min + 1e-8) * (GRID_SIZE - 1)).astype(int)
    lon_idx = ((group[LON_COL] - lon_min) / (lon_max - lon_min + 1e-8) * (GRID_SIZE - 1)).astype(int)

    lat_idx = np.clip(lat_idx, 0, GRID_SIZE - 1)
    lon_idx = np.clip(lon_idx, 0, GRID_SIZE - 1)

    for i, j in zip(lat_idx, lon_idx):
        grid[i, j] += 1

    daily_grids.append(grid)

daily_grids = np.array(daily_grids)

print("🔥 Daily grids shape:", daily_grids.shape)

# ======================
# VALIDATION
# ======================

if daily_grids.shape[0] <= 1:
    raise ValueError("❌ ERROR: Only 1 grid created. Date conversion failed.")

# ======================
# NORMALIZATION
# ======================

daily_grids = daily_grids / (daily_grids.max() + 1e-8)

# ======================
# CREATE SEQUENCES
# ======================

SEQUENCE_LENGTH = 5
sequences = []

for i in range(len(daily_grids) - SEQUENCE_LENGTH):
    sequences.append(daily_grids[i:i + SEQUENCE_LENGTH])

sequences = np.array(sequences)

print("📦 Sequences shape:", sequences.shape)

# ======================
# SAVE OUTPUT
# ======================

os.makedirs("data/processed", exist_ok=True)

np.save("data/processed/grid.npy", daily_grids)

bounds = {
    "lat_min": float(lat_min),
    "lat_max": float(lat_max),
    "lon_min": float(lon_min),
    "lon_max": float(lon_max)
}

np.save("data/processed/bounds.npy", bounds)

print("💾 Saved grid.npy and bounds.npy")
print("✅ DONE")