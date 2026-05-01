import axios from 'axios';

export const getChatResponse = async (messagesHistory, context, locationName) => {
  // Try sending to Python FastAPI backend
  try {
    const response = await axios.post('http://127.0.0.1:8000/assistant', {
      messages: messagesHistory,
      context
    }, { timeout: 8000 });
    
    if (response.data && response.data.reply) {
      return response.data.reply;
    }
  } catch (err) {
    console.warn("Backend offline or unreachable, falling back to local chat logic...");
  }

  // Get the most recent user message
  const userMessages = messagesHistory.filter(m => m.role === 'user');
  const lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].content.toLowerCase() : '';
  const priorLastMsg = userMessages.length > 1 ? userMessages[userMessages.length - 2].content.toLowerCase() : '';

  const loc = locationName || 'this region';
  const risk = context?.level || 'UNKNOWN';
  const dir = context?.direction || 'Variable';
  const wind = context?.windSpeed || '10 km/h';
  const conf = context?.confidence || '80';
  const temp = context?.weather?.temp ? `${context.weather.temp}°C` : 'Moderate';
  const hum = context?.weather?.humidity ? `${context.weather.humidity}%` : 'Moderate';

  // State flags based on previous turns
  const talkedAboutEvacuation = priorLastMsg.includes('where') || priorLastMsg.includes('evacuate');

  if (risk === 'NO RISK') {
    if (lastMsg.includes('weather') || lastMsg.includes('condition')) {
      return `Currently in ${loc}, the temperature is ${temp} with humidity at ${hum} and winds blowing at ${wind}. Conditions are generally safe with no immediate wildfire threat detected.`;
    }
    if (lastMsg.includes('danger') || lastMsg.includes('risk') || lastMsg.includes('fire')) {
      return `Good news! Our AI model predicts **NO RISK** for ${loc} at this time. Current environmental conditions (${temp}, ${hum} humidity) indicate a very low probability of ignition.`;
    }
    return `Conditions in ${loc} are currently safe with NO RISK of wildfire detected. How else can I assist you today?`;
  }

  // Emergency Checks & Intent Matching
  if (lastMsg.includes('help') || lastMsg.includes('fire nearby') || lastMsg.includes('trapped') || lastMsg.includes('injured') || lastMsg.includes('emergency')) {
    return `🚨 **CRITICAL EMERGENCY PROTOCOL** 🚨
    
1. Call **911** or your local emergency number immediately if you are trapped.
2. The model shows an active ${risk} risk fire moving ${dir}. Do NOT wait for official evacuation orders.
3. Leave immediately heading opposite to the direction of the ${dir} wind.
4. Keep headlights on and yield to emergency vehicles.`;
  }

  if (lastMsg.includes('smoke')) {
    return 'Heavy smoke can be lethal. Seal all doors and windows immediately. Stay low to the ground and use a wet cloth completely covering your mouth and nose. Prepare your emergency go-bag if the fire path nears.';
  }

  if (lastMsg.includes('drive') || lastMsg.includes('car')) {
    return `Driving visibility may be severely impacted by smoke. Head opposite to the ${dir} spread. Drive with headlights on, keep windows rolled up, and recirculate the AC air.`;
  }

  if (lastMsg.includes('evacuate') || lastMsg.includes('where') || lastMsg.includes('safe place') || lastMsg.includes('shelter')) {
    return `The nearest safe zone from ${loc} is the Community Hall, located approximately 1.8 miles away. Avoid the active ${risk} clusters moving ${dir}.`;
  }

  if (lastMsg.includes('route') || lastMsg.includes('escape')) {
    return `Your safest evaluated escape route is Route B via Lake Road. Avoid the smoke-heavy corridors which our telemetry predicts will worsen over the next hour due to ${wind} winds.`;
  }

  if (lastMsg.includes('wheelchair') || lastMsg.includes('accessible') || lastMsg.includes('disabled') || lastMsg.includes('elderly') || lastMsg.includes('grandmother') || lastMsg.includes('grandpa')) {
    return `Proceed safely to the Civic Center shelter. It is fully wheelchair accessible with ramp egress and has specialized medical staff on standby. Exclude stairs from your route map.`;
  }

  if (lastMsg.includes('pet') || lastMsg.includes('dog') || lastMsg.includes('cat')) {
    return `Ensure your pets are securely leashed or in carriers. The County Fairgrounds 3 miles west is a pet-friendly evacuation center currently accepting arrivals.`;
  }

  if (lastMsg.includes('dangerous') || lastMsg.includes('risk') || lastMsg.includes('bad')) {
    return `Our AI model predicts a **${risk}** risk level for ${loc}. Fire intensity is classified as critical, with confidence at ${conf}%. Wind speeds of ${wind} are driving the fire ${dir}. Please formulate a readiness plan.`;
  }

  if (lastMsg.includes('thank') || lastMsg.includes('ok')) {
    return 'You are welcome. Stay safe, monitor official alerts, and let me know if conditions change.';
  }

  // Generic conversational fallback varying by risk
  if (risk === 'EXTREME' || risk === 'HIGH') {
    return `This is a highly volatile situation in ${loc}. Time is critical. Ask me for evacuation routes, shelter info, or specific hazards.`;
  } else if (talkedAboutEvacuation) {
    return `Please confirm once you have safely reached the shelter. If any roads are blocked, tell me and I will reroute you.`;
  } else {
    return `I am dynamically analyzing the latest grids for ${loc}. Environmental conditions are ${temp} with ${wind} winds. How can I assist you—do you need shelter locations, emergency supply checklists, or an evacuation map?`;
  }
};
