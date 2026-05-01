import { useState, useEffect } from "react";
import axios from "axios";

export const usePrediction = () => {
  const [data, setData] = useState({ 
    forecast: [], 
    risk: "UNKNOWN", 
    intensity: 0,
    explainability: null,
    attention_map: [],
    uncertainty_map: [],
    safe_path: []
  });
  const [currentDay, setCurrentDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/predict");
        const forecast = res.data.forecast || [];
        
        let safePath = [];
        if (forecast.length > 0) {
           const safetyRes = await axios.post("http://127.0.0.1:8000/safety", { grid: forecast[0] });
           safePath = safetyRes.data.safe_path || [];
        }

        setData({
          forecast: forecast,
          risk: res.data.risk,
          intensity: res.data.intensity,
          explainability: res.data.explainability,
          attention_map: res.data.attention_map || [],
          uncertainty_map: res.data.uncertainty_map || [],
          safe_path: safePath
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isPlaying || data.forecast.length === 0) return;
    const interval = setInterval(() => setCurrentDay(prev => (prev + 1) % data.forecast.length), speed);
    return () => clearInterval(interval);
  }, [isPlaying, data.forecast.length, speed]);
  
  return { 
    ...data, 
    currentDay, 
    setCurrentDay, 
    loading, 
    isPlaying, 
    setIsPlaying, 
    speed, 
    setSpeed 
  };
};
