import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from conv_lstm_model import ConvLSTM
import os

# ======================
# LOAD DATA
# ======================

X = np.load("data/processed/grid.npy")

SEQUENCE_LENGTH = 5

# Create sequences
X_seq = []
y_seq = []

for i in range(len(X) - SEQUENCE_LENGTH):
    X_seq.append(X[i:i+SEQUENCE_LENGTH])
    y_seq.append(X[i+SEQUENCE_LENGTH])

X_seq = np.array(X_seq)
y_seq = np.array(y_seq)

# Add channel dimension
X_seq = X_seq[:, :, np.newaxis, :, :]
y_seq = y_seq[:, np.newaxis, :, :]

print("📊 X shape:", X_seq.shape)
print("📊 y shape:", y_seq.shape)

# ======================
# TRAIN/VAL SPLIT
# ======================

split = int(0.8 * len(X_seq))

X_train, X_val = X_seq[:split], X_seq[split:]
y_train, y_val = y_seq[:split], y_seq[split:]

train_loader = DataLoader(
    TensorDataset(torch.tensor(X_train, dtype=torch.float32),
                  torch.tensor(y_train, dtype=torch.float32)),
    batch_size=8,
    shuffle=True
)

val_loader = DataLoader(
    TensorDataset(torch.tensor(X_val, dtype=torch.float32),
                  torch.tensor(y_val, dtype=torch.float32)),
    batch_size=8
)

# ======================
# MODEL
# ======================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = ConvLSTM().to(device)

criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# ======================
# TRAINING LOOP
# ======================

EPOCHS = 5

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0

    for X_batch, y_batch in train_loader:
        X_batch = X_batch.to(device)
        y_batch = y_batch.to(device)

        optimizer.zero_grad()

        output = model(X_batch)

        loss = criterion(output, y_batch)
        loss.backward()

        optimizer.step()

        train_loss += loss.item()

    print(f"Epoch {epoch+1}, Loss: {train_loss:.4f}")

# ======================
# SAVE MODEL
# ======================

os.makedirs("saved_models", exist_ok=True)
torch.save(model.state_dict(), "saved_models/convlstm.pth")

print("✅ Model saved!")