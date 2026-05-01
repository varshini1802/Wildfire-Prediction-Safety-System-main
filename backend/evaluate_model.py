import torch
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score
import os

# ======================
# LOAD DATA
# ======================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

X = np.load(os.path.join(BASE_DIR, "data", "processed", "X.npy"))
y = np.load(os.path.join(BASE_DIR, "data", "processed", "y.npy"))

print("✅ Data Loaded:", X.shape, y.shape)

# ======================
# MODEL DEFINITION (SAME AS TRAINING)
# ======================

import torch.nn as nn

class CNN_LSTM(nn.Module):
    def __init__(self):
        super(CNN_LSTM, self).__init__()

        self.conv1 = nn.Conv1d(3, 16, kernel_size=2)
        self.relu = nn.ReLU()
        self.lstm = nn.LSTM(16, 64, batch_first=True)
        self.fc = nn.Linear(64, 3)

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.relu(self.conv1(x))
        x = x.permute(0, 2, 1)

        _, (h, _) = self.lstm(x)
        return self.fc(h[-1])

# ======================
# LOAD MODEL
# ======================

model = CNN_LSTM()

model_path = os.path.join(BASE_DIR, "backend", "saved_models", "cnn_lstm.pth")
model.load_state_dict(torch.load(model_path))

model.eval()

print("✅ Model Loaded")

# ======================
# PREDICTION
# ======================

X_tensor = torch.tensor(X[:50000], dtype=torch.float32)  # use subset

with torch.no_grad():
    preds = model(X_tensor).numpy()

y_true = y[:50000]

# ======================
# METRICS
# ======================

mse = np.mean((preds - y_true) ** 2)
mae = mean_absolute_error(y_true, preds)
r2 = r2_score(y_true, preds)

print("\n📊 Evaluation Results:")
print("MSE:", mse)
print("MAE:", mae)
print("R2 Score:", r2)