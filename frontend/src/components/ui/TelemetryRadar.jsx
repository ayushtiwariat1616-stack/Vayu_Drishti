import React, { useState, useEffect } from 'react';

const TelemetryRadar = () => {
  // State to hold our live threats and connection status
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('🔴 Disconnected');

  useEffect(() => {
    // 1. Forge the WebSocket connection to your Django ASGI Elite
    const ws = new WebSocket('ws://localhost:8000/ws/telemetry/');

    // 2. The Handshake
    ws.onopen = () => {
      setConnectionStatus('🟢 TARGET LOCKED: Connected to Django');
    };

    // 3. The Interceptor (Catching the JSON blast)
    ws.onmessage = (event) => {
      // Parse the JSON string coming from Python into a JavaScript object
      const payload = JSON.parse(event.data);
      
      // Add the new alert to our state array without destroying the old ones
      setAlerts((prevAlerts) => [...prevAlerts, payload.data]);
    };

    // 4. The Failsafes
    ws.onerror = (error) => {
      console.error("WebSocket Error: ", error);
      setConnectionStatus('⚠️ ERROR: Signal blocked!');
    };

    ws.onclose = () => {
      setConnectionStatus('🔴 CONNECTION LOST');
    };

    // 5. THE CLEANUP (CRITICAL FOR FAANG ELITES)
    // If the component unmounts, sever the connection so it doesn't drain memory!
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array means this runs ONCE when the component mounts.

  return (
    // Stripped minHeight: '100vh' and changed to a clean, adaptable container
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#ffffff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      margin: '10px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1a202c', fontWeight: 'bold' }}>
        🛰️ Live Threat Radar
      </h3>
      
      <p style={{ 
        margin: '0 0 15px 0', 
        fontSize: '0.9rem', 
        color: connectionStatus.includes('LOCKED') ? '#38a169' : '#e53e3e',
        fontWeight: 'bold'
      }}>
        {connectionStatus}
      </p>
      
      <div>
        {alerts.length === 0 ? (
          <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>All systems nominal. Awaiting threats...</p>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} style={{ 
              color: '#c53030', 
              margin: '8px 0', 
              padding: '12px', 
              borderLeft: '4px solid #e53e3e',
              backgroundColor: '#fff5f5',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              {alert}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TelemetryRadar;