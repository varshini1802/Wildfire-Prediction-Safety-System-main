import React, { useState } from 'react';
import { Activity, Settings, Database, Crosshair, ThermometerSun, ShieldAlert, Search, MapPin, AlertTriangle } from 'lucide-react';

const LeftPanel = ({ onSearch, onCurrentLocation, isSearching, searchStatus, predictionData }) => {
  const [query, setQuery] = useState('');

  const handleSearchClick = () => {
    onSearch(query);
  };

  return (
    <div className="flex-1 glass-panel p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Wildfire Prediction & Safety System
        </h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-[0.2em] font-bold">ConvLSTM Active</p>
      </div>

      {/* Model Info */}
      <div className="space-y-3 mt-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 pb-2">
          <Database className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-semibold tracking-wide">Data Sources</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="bg-slate-100 dark:bg-slate-800/80 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Satellite IO
          </span>
          <span className="bg-slate-100 dark:bg-slate-800/80 text-orange-700 dark:text-orange-200 border border-orange-200 dark:border-orange-500/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <ThermometerSun className="w-3.5 h-3.5" /> Weather API
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-5 flex-1 mt-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 pb-2">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide">Model Metrics</span>
        </div>

        {/* Accuracy Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Crosshair className="w-3.5 h-3.5 text-slate-500"/> Accuracy</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">94.2%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/5">
            <div className="h-full bg-emerald-500 neon-glow-green w-[94.2%]" />
          </div>
        </div>

        {/* IoU Progress */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-slate-500"/> IoU Score</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono tracking-wider">0.89</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/5">
            <div className="h-full bg-blue-500 neon-glow-blue w-[89%]" />
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-slate-500"/> Confidence</span>
            <span className="text-orange-600 dark:text-orange-400 font-mono tracking-wider">88.5%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/5">
            <div className="h-full bg-orange-500 neon-glow-orange w-[88.5%]" />
          </div>
        </div>

        {/* Live Risk Search Section */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-semibold tracking-wide flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Live Risk Search
          </h3>
          
          <div className="flex bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors shadow-sm">
            <input 
              type="text" 
              placeholder="Enter city / area / lat,lon"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 text-slate-800 dark:text-white"
            />
            <button 
              onClick={onCurrentLocation}
              className="px-2 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-500"
              title="Use current location"
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSearchClick}
              disabled={isSearching}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 transition-colors disabled:opacity-50"
            >
              {isSearching ? <span className="animate-pulse">...</span> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* Server Status / Premium Loading Card */}
          {searchStatus && searchStatus !== 'offline' && (
            <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 backdrop-blur-md transition-all duration-300 shadow-sm
              ${searchStatus === 'connecting' ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30' : ''}
              ${searchStatus === 'loaded' ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30' : ''}
              ${searchStatus === 'error_geo' ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30' : ''}`}
              style={{
                backgroundColor: searchStatus === 'connecting' ? 'rgba(59, 130, 246, 0.05)' : 
                                 searchStatus === 'loaded' ? 'rgba(16, 185, 129, 0.05)' : 
                                 'rgba(239, 68, 68, 0.05)',
                borderColor: searchStatus === 'connecting' ? 'rgba(59, 130, 246, 0.2)' : 
                             searchStatus === 'loaded' ? 'rgba(16, 185, 129, 0.2)' : 
                             'rgba(239, 68, 68, 0.2)'
              }}
            >
              <div className="flex-shrink-0">
                {searchStatus === 'connecting' && (
                   <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                )}
                {searchStatus === 'loaded' && (
                   <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   </div>
                )}
                {searchStatus === 'error_geo' && (
                   <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30">
                     <AlertTriangle className="w-3 h-3" />
                   </div>
                )}
              </div>
              <div className="flex-1">
                {searchStatus === 'connecting' && (
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Connecting...</p>
                )}
                {searchStatus === 'loaded' && (
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">Prediction loaded</p>
                )}
                {searchStatus === 'error_geo' && (
                  <p className="text-xs font-bold text-red-700 dark:text-red-300 tracking-wide uppercase">Location Invalid</p>
                )}
              </div>
            </div>
          )}


        </div>

        {/* Graph Mockup (Training vs Val Loss) */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
           <h3 className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-semibold tracking-wide">Training vs Validation Loss</h3>
           <div className="h-32 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 flex items-end gap-1 relative overflow-hidden border border-slate-200 dark:border-white/5">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,35 Q20,10 40,25 T80,10 T100,5" fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.5" className="animate-dash filter drop-shadow-md" />
                <path d="M0,38 Q25,20 50,30 T90,20 T100,15" fill="none" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1.5" className="animate-dash filter drop-shadow-md" />
              </svg>
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 bg-white/80 dark:bg-black/40 p-2 rounded backdrop-blur-sm border border-slate-200 dark:border-white/5 text-[10px] font-medium shadow-sm">
                 <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 neon-glow-blue" /> Train Loss
                 </span>
                 <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500 neon-glow-orange" /> Val Loss
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
