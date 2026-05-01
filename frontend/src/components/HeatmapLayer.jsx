import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { calculateRisk } from '../utils/riskCalculator';

const HeatmapLayer = ({ timelineIndex, location, predictionData }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    // Determine base location 
    const baseLat = location ? location.lat : 37.1625;
    const baseLng = location ? location.lon : -119.3301;
    
    // Determine Risk Level via unified calculator
    const riskProps = calculateRisk(predictionData);
    const risk = riskProps.level;
    
    let riskMult = 1.0;
    if (risk === 'NO RISK') riskMult = 0.0;
    else if (risk === 'LOW') riskMult = 0.15;
    else if (risk === 'MEDIUM') riskMult = 0.6;
    else if (risk === 'EXTREME') riskMult = 2.5;

    // Clean up previous layer
    if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
    }

    if (risk === 'NO RISK') {
      // Subtle green safe overlay
      const points = [];
      for(let i=0; i<100; i++) {
         const spreadRadius = 0.05;
         const rLat = baseLat + (Math.random() - 0.5) * spreadRadius;
         const rLng = baseLng + (Math.random() - 0.5) * spreadRadius;
         points.push([rLat, rLng, Math.random() * 0.3]);
      }
      const heat = L.heatLayer(points, {
        radius: 40,
        blur: 35,
        maxZoom: 12,
        gradient: { 0.5: '#10b981', 1.0: '#059669' } // emerald greens
      });
      heat.addTo(map);
      heatLayerRef.current = heat;
      return;
    }

    // Spread logic mapped to risk
    const latOffset = timelineIndex * (0.04 * riskMult);
    const lngOffset = timelineIndex * (0.015 * riskMult);
    
    // Number of points and spread scale with risk
    const points = [];
    const numPoints = Math.floor((300 + (timelineIndex * 150)) * Math.max(0.5, riskMult));
    
    for (let i = 0; i < numPoints; i++) {
       const spreadRadius = (0.15 + (timelineIndex * 0.08)) * riskMult;
       const isCore = Math.random() < (0.2 * riskMult);
       
       const rLat = baseLat + latOffset + (Math.random() - 0.5) * spreadRadius;
       const rLng = baseLng + lngOffset + (Math.random() - 0.5) * spreadRadius * 1.2;
       
       const intensity = isCore ? Math.random() * 0.5 + 0.5 : Math.random() * 0.4;
       points.push([rLat, rLng, intensity]);
    }

    // Create cinematic fire colors
    const heat = L.heatLayer(points, {
      radius: Math.floor(35 * Math.max(0.5, riskMult)),
      blur: 25,
      maxZoom: 12,
      gradient: risk === 'LOW' 
        ? { 0.5: '#facc15', 1.0: '#eab308' } // plain yellow for low risk 
        : { 
          0.2: '#0facad',  // Blue-ish edge for structure
          0.4: '#7e22ce',  // Purple warning
          0.6: '#e11d48',  // Deep red 
          0.8: '#ea580c',  // Orange
          1.0: '#fef08a'   // Yellow/white hot core
        }
    });

    heat.addTo(map);
    heatLayerRef.current = heat;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, timelineIndex, location, predictionData]);

  return null;
};

export default HeatmapLayer;
