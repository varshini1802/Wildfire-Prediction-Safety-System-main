import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AlertTriangle, Compass, Clock, MapPin, User, ArrowRight, Phone, MessageSquare, Shield, Activity, Send } from 'lucide-react';
import { calculateRisk } from '../utils/riskCalculator';
import { getChatResponse } from '../utils/chatService';

// Component for the streaming AI text effect
const StreamingMessage = ({ content, onComplete }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    const words = content.split(' ');
    setDisplayed('');

    const timer = setInterval(() => {
      if (index < words.length) {
        setDisplayed((prev) => (prev ? prev + ' ' + words[index] : words[index]));
        index++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 40); // 40ms per word simulates streaming

    return () => clearInterval(timer);
  }, [content, onComplete]);

  // Simple markdown-style bold parsing for the output
  const renderFormatted = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return <p>{renderFormatted(displayed)}</p>;
};

const getEmergencyNumber = (fullName, locationName) => {
  const loc = (fullName || locationName || '').toLowerCase();
  
  if (loc.includes('japan')) return '119';
  if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('england')) return '999';
  if (loc.includes('australia')) return '000';
  if (loc.includes('india')) return '112';
  if (loc.includes('new zealand')) return '111';
  if (loc.match(/\b(europe|france|germany|italy|spain|netherlands|belgium|sweden|norway|poland)\b/i)) return '112';
  
  return '911'; // default USA/Canada fallback
};

const RightPanel = ({ predictionData, locationName, fullName }) => {
  const riskProps = useMemo(() => calculateRisk(predictionData), [predictionData]);

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello. I am the AI Safety Assistant. How can I assist you with this emergency?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]); // also scroll when typing indicator appears

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate network delay
    setTimeout(async () => {
      // Create message array for history parsing
      const history = [...messages, userMsg];
      const responseText = await getChatResponse(history, riskProps, locationName);
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: responseText, isStreaming: true };
      
      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  const markStreamComplete = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStreaming: false } : m));
  };


  // Color mappings based on riskProps.color
  const colorMap = {
    emerald: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bgRaw: 'bg-emerald-500',
      bgGlow: 'bg-emerald-500/10',
      border: 'border-emerald-500/30 dark:border-emerald-500/50',
      pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50',
      box: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
      icon: 'text-emerald-500 dark:text-emerald-400',
      neonBase: 'shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    },
    yellow: {
      text: 'text-yellow-600 dark:text-yellow-400',
      bgRaw: 'bg-yellow-500',
      bgGlow: 'bg-yellow-500/10',
      border: 'border-yellow-500/30 dark:border-yellow-500/50',
      pill: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/50',
      box: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/50',
      icon: 'text-yellow-500 dark:text-yellow-400',
      neonBase: 'shadow-[0_0_15px_rgba(234,179,8,0.3)] dark:shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    },
    orange: {
      text: 'text-orange-600 dark:text-orange-400',
      bgRaw: 'bg-orange-500',
      bgGlow: 'bg-orange-500/10',
      border: 'border-orange-500/30 dark:border-orange-500/50',
      pill: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50',
      box: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50',
      icon: 'text-orange-500 dark:text-orange-400',
      neonBase: 'shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_rgba(249,115,22,0.5)]',
    },
    red: {
      text: 'text-red-600 dark:text-red-400',
      bgRaw: 'bg-red-500',
      bgGlow: 'bg-red-500/10',
      border: 'border-red-500/50 dark:border-red-500/50',
      pill: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50',
      box: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
      icon: 'text-red-500 dark:text-red-400',
      neonBase: 'shadow-[0_0_15px_rgba(239,68,68,0.4)] dark:neon-glow-red',
    }
  };

  const activeColor = colorMap[riskProps.color] || colorMap.emerald;
  const isExtreme = riskProps.level === 'EXTREME';
  const pulseClass = isExtreme ? 'animate-pulse' : '';

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Risk Assessment Card */}
      <div className={`glass-panel p-5 border ${activeColor.border} flex-shrink-0 relative overflow-hidden transition-colors duration-500 ${activeColor.neonBase}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 ${activeColor.bgGlow} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />
        
        <div className="flex items-center justify-between mb-5 relative z-10">
          <h3 className={`${activeColor.text} font-bold flex items-center gap-2 tracking-wide transition-colors duration-500`}>
            {isExtreme ? <AlertTriangle className="w-5 h-5 animate-ping" /> : <Activity className="w-5 h-5" />} 
            RISK ASSESSMENT
          </h3>
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${activeColor.pill} ${pulseClass} transition-colors duration-500`}>
            {riskProps.label}
          </span>
        </div>
        
        {(riskProps.level === 'NO RISK' || riskProps.level === 'LOW') ? (
          <div className="space-y-3 relative z-10 mt-2">
            <div className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm ${activeColor.box} transition-colors duration-500`}>
              <Shield className={`w-5 h-5 ${activeColor.icon} mt-1`} />
              <div className="flex flex-col gap-1 w-full">
                <p className="text-slate-800 dark:text-slate-100 font-medium text-[15px] leading-tight flex justify-between">
                  <span>Fire Probability:</span>
                  <span className={`font-bold ${activeColor.text}`}>
                    {riskProps.level === 'NO RISK' ? 'Very Low' : 'Low'}
                  </span>
                </p>
                <p className="text-slate-800 dark:text-slate-100 font-medium text-[15px] leading-tight">
                  {riskProps.level === 'NO RISK' ? 'Current Conditions Safe' : `Low risk detected in ${locationName || 'area'}`}
                </p>
                <p className="text-slate-800 dark:text-slate-100 font-medium text-[15px] leading-tight flex justify-between mt-1 pt-2 border-t border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Status</span>
                  <span className="text-xs font-semibold">Monitoring Active</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            <div className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm ${activeColor.box} transition-colors duration-500`}>
               <Compass className={`w-5 h-5 ${activeColor.icon} mt-1`} />
               <div>
                 <p className={`text-xs ${activeColor.text} font-bold uppercase tracking-wider mb-1 opacity-80`}>Spread Direction</p>
                 <p className="text-slate-800 dark:text-slate-100 font-medium text-lg leading-tight">
                    {riskProps.direction} <span className="text-sm font-normal opacity-70">({riskProps.windSpeed})</span>
                 </p>
               </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-colors duration-500">
               <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
               <div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Forecast Window</p>
                 <p className="text-slate-800 dark:text-slate-100 font-medium text-lg leading-tight">{riskProps.window}</p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* LIVE CONDITIONS CARD */}
      {riskProps.weather && (
        <div className="glass-panel p-4 border border-slate-200 dark:border-white/10 flex-shrink-0 relative overflow-hidden transition-colors duration-500 bg-white/50 dark:bg-black/20">
          <h3 className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2 tracking-wide text-xs uppercase mb-3 opacity-80">
            LIVE CONDITIONS
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Temperature</span>
              <span className="text-slate-800 dark:text-slate-100 font-semibold">{riskProps.weather.temp}°C</span>
            </div>
            <div className="flex flex-col bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Humidity</span>
              <span className="text-slate-800 dark:text-slate-100 font-semibold">{riskProps.weather.humidity}%</span>
            </div>
            <div className="flex flex-col bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Wind</span>
              <span className="text-slate-800 dark:text-slate-100 font-semibold">{riskProps.weather.windSpeed} km/h</span>
            </div>
            <div className="flex flex-col bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Rain Chance</span>
              <span className="text-slate-800 dark:text-slate-100 font-semibold">{riskProps.weather.rainChance}%</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Safety Assistant */}
      <div className="flex-1 glass-panel p-0 flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden relative shadow-lg">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3 relative z-10 transition-colors">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-md border border-blue-200 dark:border-blue-500/30">
             <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wide">AI Safety Assistant</h3>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-5 text-sm relative z-10 bg-white/40 dark:bg-transparent transition-colors">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border 
                  ${msg.role === 'user' 
                    ? 'bg-slate-200 dark:bg-slate-700/50 border-slate-300 dark:border-white/10' 
                    : 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30'}`}>
                   {msg.role === 'user' ? (
                     <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                   ) : (
                     <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                   )}
                </div>
                <div className={`p-3.5 rounded-2xl shadow-sm transition-colors whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-blue-100 dark:bg-blue-600/30 rounded-tr-none border border-blue-300 dark:border-blue-500/40 text-blue-900 dark:text-blue-50' 
                    : (msg.content.includes('EMERGENCY') || msg.content.includes('Immediate Evacuation Plan'))
                       ? 'bg-red-50 dark:bg-red-950/40 rounded-tl-none border border-red-300 dark:border-red-500/40 text-slate-900 dark:text-slate-100 dark:shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:neon-glow-red w-full'
                       : 'bg-white dark:bg-slate-800/90 rounded-tl-none border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
                   
                   {msg.isStreaming ? (
                     <StreamingMessage content={msg.content} onComplete={() => markStreamComplete(msg.id)} />
                   ) : (
                     <p>{msg.content.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                        (part.startsWith('**') && part.endsWith('**')) ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
                     )}</p>
                   )}
                </div>
             </div>
          ))}

          {isTyping && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-500/30">
                   <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-1.5 h-[46px]">
                   <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 relative z-10 transition-colors">
           <div className="bg-white dark:bg-black/40 rounded-full flex items-center px-4 py-2 border border-slate-200 dark:border-white/10 focus-within:border-blue-400 dark:focus-within:border-blue-500/50 transition-colors shadow-sm">
             <input 
               type="text" 
               placeholder="Type a message to Assistant..." 
               className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 w-full placeholder-slate-400 dark:placeholder-slate-500 font-medium px-2 py-1" 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               disabled={isTyping}
             />
             <button 
               onClick={handleSendMessage}
               disabled={!inputValue.trim() || isTyping}
               className="p-2 ml-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white rounded-full transition-colors flex-shrink-0"
             >
               <Send className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>

      {/* Helplines Bottom */}
      <div className="flex gap-3">
        <button className="flex-1 glass-panel py-3 flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 group shadow-sm">
          <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse" />
          <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{getEmergencyNumber(fullName, locationName)} Emergency</span>
        </button>
        <button className="flex-1 glass-panel py-3 flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors border border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 group shadow-sm">
          <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />
          <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">Fire Dept</span>
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
