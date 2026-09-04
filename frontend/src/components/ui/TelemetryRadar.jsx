import React from 'react';

// 1. NEUTERED: No more internal state. No more WebSocket connections.
// It now receives 'alerts' and 'connectionStatus' directly as props from the parent!
const TelemetryRadar = ({ alerts = [], connectionStatus = '🔴 Disconnected' }) => {
  
  return (
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
        color: connectionStatus.includes('LOCKED') || connectionStatus.includes('Connected') ? '#38a169' : '#e53e3e',
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
              {JSON.stringify(alert)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TelemetryRadar;