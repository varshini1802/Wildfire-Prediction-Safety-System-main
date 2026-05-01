import axios from 'axios';

// Create a professional Axios instance for the backend
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/* eslint-disable no-unused-vars */
export const fetchWeather = async (lat, lon) => {
  try {
    const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation`);
    const data = res.data;
    
    if (data && data.current) {
      const cw = data.current;
      return {
        temp: cw.temperature_2m,
        humidity: cw.relative_humidity_2m,
        windSpeed: cw.wind_speed_10m,
        windDirection: cw.wind_direction_10m,
        rainChance: cw.precipitation > 0 ? 100 : 0
      };
    }
    return null;
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return null;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = res.data;
    if(data && data.address) {
      return data.address.city || data.address.state || data.address.country || "Unknown Location";
    }
    return "Unknown Location";
  } catch (err) {
    return "Central Region";
  }
};

export const geocodeLocation = async (query) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
    const data = res.data;
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display_name: data[0].display_name };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
};

// ============================================
// BACKEND FASTAPI ENDPOINTS
// ============================================

export const predictWildfire = async (lat, lon) => {
  try {
    const res = await apiClient.post('/predict', { lat, lon });
    return res.data;
  } catch (err) {
    console.error("Prediction API failed:", err);
    return { error: 'Failed to connect to AI server' };
  }
};

export const checkRisk = async (lat, lng, grid) => {
  try {
    const res = await apiClient.post('/risk', { lat, lng, grid });
    return res.data;
  } catch (err) {
    console.error("Risk API failed:", err);
    return { error: 'Failed to connect to AI server' };
  }
};

export const checkSafetyStatus = async () => {
  try {
    const res = await apiClient.get('/safety');
    return res.data;
  } catch (err) {
    console.error("Safety API failed:", err);
    return { error: 'Failed to connect to AI server' };
  }
};