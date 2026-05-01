import sqlite3
import pandas as pd

# Path to your sqlite file
db_path = "data/raw/FPA_FOD_20170508.sqlite"  # adjust if needed

# Connect to database
conn = sqlite3.connect(db_path)

# Check tables
query = "SELECT name FROM sqlite_master WHERE type='table';"
tables = pd.read_sql(query, conn)
print("Tables:", tables)

# Load main wildfire table (usually named 'Fires')
df = pd.read_sql("SELECT * FROM Fires", conn)

# Save as CSV
df.to_csv("data/raw/wildfire_data.csv", index=False)

print("Conversion successful ✅")