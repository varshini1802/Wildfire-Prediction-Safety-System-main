import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load cleaned data
df = pd.read_csv("data/processed/cleaned_wildfire_data.csv")

print("EDA Started ✅")

# -------------------------------
# 🔥 1. Fire Size Distribution
# -------------------------------
plt.figure()
sns.histplot(df["FIRE_SIZE"], bins=50)
plt.title("Fire Size Distribution")
plt.xlabel("Fire Size")
plt.ylabel("Count")
plt.show()

# -------------------------------
# 📍 2. Fire Locations (Spatial)
# -------------------------------
plt.figure()
plt.scatter(df["LONGITUDE"], df["LATITUDE"], s=1)
plt.title("Wildfire Locations")
plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.show()

# -------------------------------
# 📅 3. Fires Over Time
# -------------------------------
df["DISCOVERY_DATE"] = pd.to_datetime(df["DISCOVERY_DATE"], errors='coerce')

fires_per_day = df.groupby("DISCOVERY_DATE").size()

plt.figure()
fires_per_day.plot()
plt.title("Fires Over Time")
plt.xlabel("Date")
plt.ylabel("Number of Fires")
plt.show()

# -------------------------------
# 🔥 4. Correlation Heatmap
# -------------------------------
plt.figure()
sns.heatmap(df.corr(), annot=True, cmap="coolwarm")
plt.title("Feature Correlation")
plt.show()

print("EDA Completed ✅")