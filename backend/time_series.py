import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "processed.csv")


def load_processed_data():
    df = pd.read_csv(DATA_PATH)
    print("✅ Processed Data Loaded:", df.shape)
    return df


def create_sequences(df, seq_length=5):
    print("\n🔄 Creating sequences...")

    # Sort by time
    df = df.sort_values(by="date")

    features = df[['latitude', 'longitude', 'fire_size']].values

    sequences = []
    targets = []

    for i in range(len(features) - seq_length):
        seq = features[i:i+seq_length]
        target = features[i+seq_length]

        sequences.append(seq)
        targets.append(target)

    X = np.array(sequences)
    y = np.array(targets)

    print("✅ Sequences Created:")
    print("X shape:", X.shape)
    print("y shape:", y.shape)

    return X, y


if __name__ == "__main__":
    df = load_processed_data()
    X, y = create_sequences(df)

    # Save for training
    np.save("data/processed/X.npy", X)
    np.save("data/processed/y.npy", y)

    print("💾 Saved sequences successfully")