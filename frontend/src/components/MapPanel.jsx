import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateRisk } from '../utils/riskCalculator';

// Fix for default marker icons in React Leaflet (optional fallback)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Glowing marker icon
const glowingIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-full h-full bg-orange-500 rounded-full animate-ping opacity-75"></div>
           <div class="relative w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(251,146,60,1)]"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to handle map centering dynamically
const MapUpdater = ({ location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lon], 11, {
        animate: true,
        duration: 1.5
      });
    }
  }, [location, map]);
  
  return null;
};

const MapPanel = ({ selectedLocation, predictionData }) => {
  const [timelineIndex, setTimelineIndex] = useState(2); // 0 corresponds to T-2h, 4 corresponds to T+6h
  const timelineSteps = ['T-2h', 'T-1h', 'Now', 'T+3h', 'T+6h'];

  const riskProps = useMemo(() => calculateRisk(predictionData), [predictionData]);
  const risk = riskProps.level;

  const currentIcon = useMemo(() => {
    if (risk === 'NO RISK') {
      return new L.DivIcon({
        className: 'bg-transparent border-none',
        html: `<div class="relative flex items-center justify-center w-4 h-4">
                 <div class="relative w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
               </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
    } else if (risk === 'LOW') {
      return new L.DivIcon({
        className: 'bg-transparent border-none',
        html: `<div class="relative flex items-center justify-center w-5 h-5">
                 <div class="absolute w-full h-full bg-yellow-400 rounded-full animate-ping opacity-50"></div>
                 <div class="relative w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm"></div>
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    }
    return glowingIcon;
  }, [risk]);

  return (
    <div className="w-full h-full relative bg-[#09090b] dark:bg-[#09090b] transition-colors duration-500">
      <MapContainer
        center={[37.1625, -119.3301]} 
        zoom={9}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <HeatmapLayer timelineIndex={timelineIndex} location={selectedLocation} predictionData={predictionData} />
        
        {selectedLocation && (
          <>
            <MapUpdater location={selectedLocation} />
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={currentIcon}>
              <Popup className="custom-popup">
                <div className="text-sm font-semibold p-1">{selectedLocation.name}</div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Timeline Controls Bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3000] w-[90%] max-w-lg bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl transition-colors duration-500">
        <div className="flex items-center justify-between mb-4">
          <button 
             onClick={() => setTimelineIndex(Math.max(0, timelineIndex - 1))}
             className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-600 dark:text-slate-300"
             disabled={timelineIndex === 0}
          >
             <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
             <span className="text-xs font-bold tracking-[0.2em] text-slate-800 dark:text-slate-100 uppercase">
               Forecast Timeline
             </span>
          </div>

          <button 
             onClick={() => setTimelineIndex(Math.min(timelineSteps.length - 1, timelineIndex + 1))}
             className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 text-slate-600 dark:text-slate-300"
             disabled={timelineIndex === timelineSteps.length - 1}
          >
             <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative mt-5 mb-2 px-3">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-300 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div className="flex justify-between relative z-10">
            {timelineSteps.map((step, idx) => (
              <div 
                key={step} 
                className="flex flex-col items-center gap-2.5 cursor-pointer group" 
                onClick={() => setTimelineIndex(idx)}
              >
                <div 
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-[3px] 
                  ${idx === timelineIndex 
                    ? 'bg-orange-500 border-orange-200 scale-[1.6] shadow-[0_0_15px_rgba(251,146,60,0.8)]' 
                    : 'bg-slate-400 dark:bg-slate-900 border-slate-200 dark:border-slate-600 group-hover:border-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                  }`} 
                />
                <span className={`text-[11px] font-bold tracking-wider absolute -bottom-5 transition-colors
                  ${idx === timelineIndex ? 'text-orange-500 dark:text-orange-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-300'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Cinematic Inner Shadow to blend the map edges */}
      <div className="absolute inset-0 pointer-events-none z-[1000] rounded-2xl shadow-[inset_0_0_80px_rgba(248,250,252,0.8)] dark:shadow-[inset_0_0_80px_rgba(3,7,18,0.8)] transition-all duration-500" />
    </div>
  );
};

export default MapPanel;
