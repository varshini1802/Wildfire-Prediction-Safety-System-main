import torch
import os

from model import CNN_LSTM_Model   # ✅ FIXED IMPORT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "saved_models", "best_wildfire_model.pth")


def load_model():
    model = CNN_LSTM_Model(input_size=1, weather_size=3)
    model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    model.eval()
    return model


model = load_model()


def predict_fire(x_input, weather_input):
    x = torch.tensor([x_input], dtype=torch.float32)
    weather = torch.tensor([weather_input], dtype=torch.float32)

    with torch.no_grad():
        output = model(x, weather)
        output = torch.sigmoid(output)

    return float(output.item())