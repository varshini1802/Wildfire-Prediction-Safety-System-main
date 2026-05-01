import React, { useState, useEffect } from 'react';
import LeftPanel from '../components/LeftPanel';
import MapPanel from '../components/MapPanel';
import RightPanel from '../components/RightPanel';
import ThemeToggle from '../components/ThemeToggle';
import { Flame, MoreHorizontal, CheckCircle2, FlaskConical } from 'lucide-react';
import { geocodeLocation, predictWildfire, fetchWeather } from '../api/api';

export const DEMO_SCENARIOS = {
  LOW: { 
    id: 'LOW', name: 'Bengaluru Outskirts', lat: 12.9716, lon: 77.5946, 
    data: { level: 'LOW', riskLevel: 'LOW', intensity: 'Low', confidence: 92, spreadDirection: 'S', forecastWindow: 'Next 12h', error: null, windSpeed: '5 mph', weather: { temp: 26, humidity: 65, windSpeed: 8, windDirection: 180, rainChance: 5 } } 
  },
  MEDIUM: { 
    id: 'MEDIUM', name: 'Chhattisgarh Forest Edge', lat: 21.2787, lon: 81.8661, 
    data: { level: 'MEDIUM', riskLevel: 'MEDIUM', intensity: 'Moderate', confidence: 85, spreadDirection: 'E', forecastWindow: 'Next 8h', error: null, windSpeed: '12 mph', weather: { temp: 32, humidity: 40, windSpeed: 19, windDirection: 90, rainChance: 0 } } 
  },
  HIGH: { 
    id: 'HIGH', name: 'Pine Ridge CA', lat: 37.1625, lon: -119.3301, 
    data: { level: 'HIGH', riskLevel: 'HIGH', intensity: 'High', confidence: 88, spreadDirection: 'NNE', forecastWindow: 'Next 6h', error: null, windSpeed: '18 mph', weather: { temp: 36, humidity: 15, windSpeed: 28, windDirection: 25, rainChance: 0 } } 
  },
  EXTREME: { 
    id: 'EXTREME', name: 'Australian Bushfire', lat: -33.8688, lon: 151.2093, 
    data: { level: 'EXTREME', riskLevel: 'EXTREME', intensity: 'Severe', confidence: 95, spreadDirection: 'NW', forecastWindow: 'Next 2h', error: null, windSpeed: '35 mph', weather: { temp: 42, humidity: 8, windSpeed: 56, windDirection: 315, rainChance: 0 } } 
  }
};

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [livePredictionData, setLivePredictionData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');

  // Demo state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoScenario, setDemoScenario] = useState('HIGH');

  const handleSearch = async (query) => {
    if (!query) return;
    setIsSearching(true);
    setSearchStatus('connecting');
    setLivePredictionData(null);

    // 1. Geocode
    let lat, lon, displayName, fullName;
    const coordMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?),\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lon = parseFloat(coordMatch[2]);
      displayName = `Coordinates: ${lat}, ${lon}`;
      fullName = displayName;
    } else {
      const geoResult = await geocodeLocation(query);
      if (!geoResult) {
        setSearchStatus('error_geo');
        setIsSearching(false);
        return;
      }
      lat = geoResult.lat;
      lon = geoResult.lon;
      displayName = geoResult.display_name.split(',')[0];
      fullName = geoResult.display_name;
    }

    const fetchedLoc = { lat, lon, name: displayName, fullName };
    setSelectedLocation(fetchedLoc);

    if (isDemoMode) setIsDemoMode(false);

    // 2. Predict & Fetch Weather
    const [prediction, weatherData] = await Promise.all([
      predictWildfire(lat, lon),
      fetchWeather(lat, lon)
    ]);
    
    if (prediction && !prediction.error) {
       setLivePredictionData({ ...prediction, weather: weatherData });
       setSearchStatus('loaded');
    } else {
       // Fallback to local simulated data
       setSearchStatus('offline');
       setTimeout(() => {
         setIsDemoMode(true);
         setDemoScenario('MEDIUM'); // Default fallback scenario
       }, 2000);
       setLivePredictionData({ error: 'Backend offline', weather: weatherData });
    }
    
    setIsSearching(false);
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsSearching(true);
      setSearchStatus('connecting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleSearch(`${latitude},${longitude}`);
        },
        (error) => {
          setSearchStatus('error_geo');
          setIsSearching(false);
        }
      );
    } else {
      setSearchStatus('error_geo');
    }
  };

  // Derived effective data depending on mode
  const currentPrediction = isDemoMode ? DEMO_SCENARIOS[demoScenario].data : livePredictionData;
  const currentLocBase = isDemoMode ? DEMO_SCENARIOS[demoScenario] : selectedLocation;

  return (
    <div className="flex h-screen w-screen p-4 gap-4 bg-slate-50 dark:bg-[#030712] transition-colors duration-500 overflow-hidden">
      {/* Left Column: Metrics & Config */}
      <div className="w-[300px] h-full flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-2 pr-1">
        <LeftPanel 
          onSearch={handleSearch} 
          onCurrentLocation={handleCurrentLocation}
          isSearching={isSearching}
          searchStatus={searchStatus}
          predictionData={currentPrediction}
        />
      </div>

      {/* Center Column: Map */}
      <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel border border-slate-200/50 dark:border-white/10 shadow-xl">
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 z-[999] flex items-center gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 shadow-lg">
          {isDemoMode ? (
             <FlaskConical className="w-5 h-5 text-blue-500 animate-pulse" />
          ) : (
             <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          )}
          <h1 className="text-slate-800 dark:text-white font-semibold tracking-wide text-sm">
            {isDemoMode ? 'Presentation Mode' : 'Live Wildfire Map'}
          </h1>
        </div>

        {/* Demo Mode Toggle Controller */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden flex items-center p-1 transition-colors">
            <button 
               onClick={() => setIsDemoMode(false)}
               className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors flex items-center gap-2
                 ${!isDemoMode ? 'bg-orange-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
               { !isDemoMode && <CheckCircle2 className="w-3.5 h-3.5" /> } REAL MODE
            </button>
            <button 
               onClick={() => setIsDemoMode(true)}
               className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors flex items-center gap-2
                 ${isDemoMode ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
               { isDemoMode && <CheckCircle2 className="w-3.5 h-3.5" /> } DEMO MODE
            </button>
            
            {/* Demo Dropdown Sub-select */}
            {isDemoMode && (
              <div className="ml-2 pr-2 border-l border-slate-300 dark:border-white/20 pl-2">
                 <select 
                    value={demoScenario}
                    onChange={(e) => setDemoScenario(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer p-1"
                 >
                    <option value="LOW">LOW RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="HIGH">HIGH RISK</option>
                    <option value="EXTREME">EXTREME RISK</option>
                 </select>
              </div>
            )}
        </div>

        <div className="absolute top-4 right-4 z-[999] flex items-center gap-3">
           <ThemeToggle />
           <button className="p-2 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-white shadow-lg">
             <MoreHorizontal className="w-5 h-5" />
           </button>
        </div>
        
        <MapPanel selectedLocation={currentLocBase} predictionData={currentPrediction} />
      </div>

      {/* Right Column: AI Assistant & Risk */}
      <div className="w-[340px] flex-shrink-0 flex flex-col gap-4">
        <RightPanel predictionData={currentPrediction} locationName={currentLocBase?.name} fullName={currentLocBase?.fullName} />
      </div>
    </div>
  );
};

export default Dashboard;
