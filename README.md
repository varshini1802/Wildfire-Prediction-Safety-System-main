# 🔥 Wildfire Spread Prediction & Emergency Response System

An end-to-end AI-powered system that predicts wildfire spread using spatio-temporal deep learning and provides real-time risk assessment, visualization, and emergency assistance through an interactive dashboard.

---

## 📌 Overview

Wildfires are complex natural disasters influenced by both historical patterns and environmental conditions. This project combines deep learning, geospatial analysis, and real-time data to predict wildfire spread and assist in emergency decision-making.

The system uses a ConvLSTM-based model trained on historical wildfire data and integrates live weather inputs to generate realistic predictions. A full-stack dashboard enables users to explore risk levels, visualize fire spread, and interact with an AI-powered safety assistant.

---

## 🚀 Key Features

* 🔥 Spatio-temporal wildfire prediction using ConvLSTM
* 🗺️ Interactive map visualization with heatmaps
* 📊 Real-time risk classification (Low / Medium / High / Extreme)
* 🌦️ Live weather-based risk adjustment
* 🤖 AI Safety Assistant with real-time chat interaction
* 🎮 Demo Mode for controlled simulation scenarios
* 🌗 Light/Dark theme support
* 📍 Location-based prediction using geocoding
* 📈 Training & validation visualization

---

## 🧠 Core Concepts Used

### Deep Learning

* ConvLSTM (Convolutional LSTM)
* Sequence-to-sequence prediction
* Spatial feature extraction (CNN)
* Temporal modeling (LSTM)

### Machine Learning

* Supervised learning
* Feature engineering
* Data normalization
* Model evaluation (Accuracy, IoU, Loss)

### Advanced Topics

* Spatio-temporal learning
* Time series forecasting
* Multi-modal learning (Fire + Weather data)
* Real-time inference
* Explainable AI (feature contribution visualization)

---

## 🧩 System Architecture

```text
Dataset → Preprocessing → Grid Generation → Sequence Creation
→ ConvLSTM Model → FastAPI Backend → React Dashboard → User Interface
```

---

## 📂 Project Structure

```text
wildfire-project/
│
├── backend/
│   ├── app.py
│   ├── predict.py
│   ├── risk.py
│   ├── safety.py
│   ├── geo_utils.py
│   ├── model.py
│   ├── train_model.py
│   └── saved_models/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
│
├── data/
├── requirements.txt
└── README.md
```

---

## ⚙️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Leaflet.js
* Axios
* Framer Motion

### Backend

* FastAPI
* Uvicorn

### AI / ML

* TensorFlow / PyTorch
* NumPy
* Pandas
* Scikit-learn

---

## 📊 Datasets Used

### 1. Historical Wildfire Dataset (1888–2025)

* Fire occurrences
* Latitude & Longitude
* Temporal patterns

### 2. Weather Dataset

* Temperature
* Humidity
* Wind speed
* Rainfall

### Why Two Datasets?

Historical data provides long-term fire patterns, while weather data provides real-time environmental triggers. Combining both enables accurate wildfire forecasting.

---

## 🧠 Model Details

### ConvLSTM

* Combines CNN (spatial learning) and LSTM (temporal learning)
* Input: Past wildfire grid sequences
* Output: Future fire spread prediction

### Input Shape

```text
(samples, time_steps, height, width)
```

### Output

* Predicted wildfire intensity grid
* Risk classification

---

## 📈 Evaluation Metrics

* Accuracy
* IoU (Intersection over Union)
* Training Loss
* Validation Loss

---

## 🌍 Features in Dashboard

* Live wildfire heatmap
* Time-based prediction slider
* Risk assessment panel
* AI safety assistant
* Weather insights
* Demo & Real mode toggle

---

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/vaishnavitp21/Wildfire-Prediction-Safety-System.git
cd Wildfire-Prediction-Safety-System
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## ▶️ Running the Project

* Backend: http://127.0.0.1:8000
* Frontend: http://localhost:5173

---

## 🎮 Demo Mode

Demo mode allows simulation of wildfire scenarios:

* Low Risk – Safe conditions
* Medium Risk – Moderate spread
* High Risk – Severe spread
* Extreme Risk – Rapid wildfire expansion

---

## 🤖 AI Safety Assistant

* Provides evacuation guidance
* Answers user queries in real-time
* Uses current risk and weather data

---

## ⚠️ Limitations

* Limited dataset coverage
* Weather API dependency
* Region-specific tuning required

---

## 🔮 Future Work

* Satellite data integration (NASA FIRMS)
* Transformer-based models
* Mobile application
* Real-time alert system
* Multi-hazard prediction

---

## 🎯 Applications

* Disaster management
* Forest monitoring
* Emergency planning
* Climate research

---

## 👥 Team Members

P. Aravindavalli
Vaishnavi T P
Varshini B
Yamini Pujar

---

## 🎓 Institution

Dayananda Sagar University
B.Tech CSE (Data Science)
2025–2026

---

## 📜 License

This project is for academic and research purposes.

---

## 💡 Conclusion

This project demonstrates how deep learning and geospatial analytics can be combined to create a real-time wildfire prediction and emergency response system. It bridges the gap between AI research and practical disaster management applications.

---
