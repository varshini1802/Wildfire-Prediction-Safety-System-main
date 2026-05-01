import pandas as pd

# Load dataset
df = pd.read_csv("data/raw/wildfire_data.csv")

print("Dataset Loaded Successfully ✅")

# Show basic info
print("\nShape:", df.shape)
print("\nColumns:\n", df.columns)

# Preview data
print("\nFirst 5 rows:\n", df.head())

# Check missing values
print("\nMissing values:\n", df.isnull().sum())

# -------------------------------
# 🔥 SELECT IMPORTANT COLUMNS
# -------------------------------

columns_needed = [
    "LATITUDE",
    "LONGITUDE",
    "FIRE_SIZE",
    "DISCOVERY_DATE"
]

df = df[columns_needed]

# -------------------------------
# 🧹 CLEAN DATA
# -------------------------------

# Drop missing values
df = df.dropna()

# Convert date
# Convert Julian date to normal date
df["DISCOVERY_DATE"] = pd.to_datetime(
    df["DISCOVERY_DATE"] - 2440587.5,  # convert Julian → Unix
    unit='D',
    origin='unix'
)

# Drop rows where date failed
df = df.dropna()

# Sort by time (VERY IMPORTANT for LSTM later)
df = df.sort_values(by="DISCOVERY_DATE")

print("\nCleaned Data Shape:", df.shape)
print(df.head())

# Save cleaned data
df.to_csv("data/processed/cleaned_wildfire_data.csv", index=False)

print("\nCleaned dataset saved ✅")