const getWindDirectionString = (degrees) => {
  if (degrees === undefined || degrees === null) return "Variable";
  const val = Math.floor((degrees / 45) + 0.5);
  const arr = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  return `${arr[(val % 8)]} (${degrees}°)`;
};

export const calculateRisk = (predictionData) => {
  if (!predictionData) {
    return { level: 'NO RISK', color: 'emerald', label: 'NO RISK', direction: 'N/A', windSpeed: 'N/A', window: 'N/A', confidence: '0', weather: null };
  }

  const { intensity, confidence, gridValues, probability, error, weather } = predictionData;

  // Realism logic based on weather
  let baseRiskLevel = 'LOW';
  let riskColor = 'emerald';
  let confNum = parseFloat(confidence || probability || 0) || 50;

  if (weather) {
    const { temp, humidity, windSpeed, rainChance } = weather;
    if (rainChance > 50 || (temp < 25 && humidity > 60)) {
      baseRiskLevel = 'NO RISK';
      riskColor = 'emerald';
    } else if (temp > 35 && humidity < 20 && windSpeed > 25) {
      baseRiskLevel = 'HIGH';
      riskColor = 'orange';
    } else if (temp > 28 && humidity < 40 && windSpeed > 15) {
      baseRiskLevel = 'MEDIUM';
      riskColor = 'yellow';
    } else {
      baseRiskLevel = 'LOW';
      riskColor = 'emerald';
    }
  }

  // Model input logic
  let maxIntensity = 0;
  let hotspotCount = 0;
  
  if (gridValues && Array.isArray(gridValues)) {
    const flatGrid = Array.isArray(gridValues[0]) ? gridValues.flat() : gridValues;
    flatGrid.forEach(val => {
      if (val > maxIntensity) maxIntensity = val;
      if (val > 0.5) hotspotCount++;
    });
  } else if (!error) {
     const rawInt = parseFloat(intensity);
     if (!isNaN(rawInt)) maxIntensity = rawInt;
     else if (typeof intensity === 'string') {
        const lcase = intensity.toLowerCase();
        if (lcase.includes('extreme')) maxIntensity = 1.0;
        else if (lcase.includes('high')) maxIntensity = 0.8;
        else if (lcase.includes('medium')) maxIntensity = 0.5;
        else maxIntensity = 0.2;
     }
  }

  let finalRiskLevel = baseRiskLevel;
  let finalColor = riskColor;

  if (!error) {
    // If backend reports fire
    if (maxIntensity > 0.8 || hotspotCount > 10) {
      finalRiskLevel = 'EXTREME';
      finalColor = 'red';
      confNum = Math.max(confNum, 85);
    } else if (maxIntensity > 0.5 || hotspotCount > 3) {
      finalRiskLevel = (baseRiskLevel === 'HIGH' || baseRiskLevel === 'EXTREME') ? 'EXTREME' : 'HIGH';
      finalColor = finalRiskLevel === 'EXTREME' ? 'red' : 'orange';
      confNum = Math.max(confNum, 75);
    } else if (maxIntensity > 0.2) {
      finalRiskLevel = (baseRiskLevel === 'NO RISK' || baseRiskLevel === 'LOW') ? 'MEDIUM' : baseRiskLevel;
      finalColor = finalRiskLevel === 'MEDIUM' ? 'yellow' : riskColor;
      confNum = Math.max(confNum, 60);
    }
  }

  // Override by hardcoded risk (Demo mode support)
  if (predictionData.riskLevel) {
    finalRiskLevel = predictionData.riskLevel;
    if (finalRiskLevel === 'NO RISK') finalColor = 'emerald';
    else if (finalRiskLevel === 'LOW') finalColor = 'emerald';
    else if (finalRiskLevel === 'MEDIUM') finalColor = 'yellow';
    else if (finalRiskLevel === 'HIGH') finalColor = 'orange';
    else if (finalRiskLevel === 'EXTREME') finalColor = 'red';
  }

  // If no active fire reports anywhere nearby and base risk is LOW
  if (error && baseRiskLevel === 'LOW') {
    finalRiskLevel = 'NO RISK';
    finalColor = 'emerald';
  }

  const label = finalRiskLevel === 'NO RISK' ? 'NO RISK' : finalRiskLevel + ' RISK';
  
  // Format Wind Direction and Speed
  let direction = predictionData.spreadDirection; // Priority to existing hardcoded string
  if (!direction && weather) {
    direction = getWindDirectionString(weather.windDirection);
  } else if (!direction) {
    direction = 'Variable';
  }

  let finalWindSpeed = predictionData.windSpeed;
  if (!finalWindSpeed && weather) {
    finalWindSpeed = `${weather.windSpeed} km/h`;
  } else if (!finalWindSpeed) {
    finalWindSpeed = `${Math.floor(Math.random() * 10 + 5)} km/h`;
  }

  const window = predictionData.forecastWindow || (finalRiskLevel === 'NO RISK' ? 'Ongoing Observation' : 'Next 12 Hours');

  return {
    level: finalRiskLevel,
    color: finalColor,
    label: label,
    direction,
    windSpeed: finalWindSpeed,
    window,
    confidence: String(Math.round(confNum)),
    weather: weather || null
  };
};
