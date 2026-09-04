// Central app context — stations, anomalies, connection state, live readings
import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { mockStations, mockCurrentReadings, mockBaselines } from '../mock/stations.mock';
import { mockReadings, generateReadings } from '../mock/readings.mock';
import { mockAnomalies, mockAnomalyStats } from '../mock/anomalies.mock';
import { mockSensorHealth, generateMockEvents } from '../mock/health.mock';
import { WS_URL, apiClient } from '../api/client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // default true

const initialState = {
  // Connection
  connectionStatus: 'CONNECTING', // CONNECTED | DISCONNECTED | RECONNECTING | POLLING
  lastUpdate: null,
  wsConnected: false,

  // Stations
  stations: mockStations,
  currentReadings: mockCurrentReadings,
  baselines: mockBaselines,

  // Telemetry
  telemetry: mockReadings,

  // Anomalies
  anomalies: mockAnomalies,
  anomalyStats: mockAnomalyStats,

  // Health
  sensorHealth: mockSensorHealth,

  // Events
  events: generateMockEvents(),

  // Selected station
  selectedStation: 'AWS-001',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTION':
      return { ...state, connectionStatus: action.payload };
    case 'SET_WS_CONNECTED':
      return { ...state, wsConnected: action.payload };
    case 'NEW_READING': {
      const { stationId, reading } = action.payload;
      const prev = state.telemetry[stationId] || [];
      const updated = [...prev.slice(-199), reading];
      const cr = { ...state.currentReadings, [stationId]: reading };
      const now = new Date().toISOString();
      // Update station lastSeen
      const stations = state.stations.map(s =>
        s.id === stationId ? { ...s, lastSeen: now } : s
      );
      return {
        ...state,
        telemetry: { ...state.telemetry, [stationId]: updated },
        currentReadings: cr,
        stations,
        lastUpdate: now,
      };
    }
    case 'NEW_ANOMALY': {
      const anomaly = action.payload;
      const anomalies = [anomaly, ...state.anomalies];
      const stats = {
        total: anomalies.length,
        high:   anomalies.filter(a => a.severity === 'HIGH').length,
        medium: anomalies.filter(a => a.severity === 'MEDIUM').length,
        watch:  anomalies.filter(a => a.severity === 'WATCH').length,
      };
      return { ...state, anomalies, anomalyStats: stats };
    }
    case 'ADD_EVENT': {
      const events = [action.payload, ...state.events.slice(0, 49)];
      return { ...state, events };
    }
    case 'SET_SELECTED_STATION':
      return { ...state, selectedStation: action.payload };
    case 'UPDATE_HEALTH': {
      const { stationId, health } = action.payload;
      return {
        ...state,
        sensorHealth: { ...state.sensorHealth, [stationId]: health },
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pollingTimer = useRef(null);
  const reconnectAttempts = useRef(0);

  // Simulate live telemetry in mock mode
  useEffect(() => {
    if (!USE_MOCK) return;

    dispatch({ type: 'SET_CONNECTION', payload: 'CONNECTED' });
    dispatch({ type: 'SET_WS_CONNECTED', payload: true });

    const interval = setInterval(() => {
      // Generate a new reading for each station
      state.stations.forEach(station => {
        const last = state.telemetry[station.id]?.slice(-1)[0];
        if (!last) return;

        const noise = () => (Math.random() - 0.5) * 0.4;
        const reading = {
          stationId: station.id,
          timestamp: new Date().toISOString(),
          temperature: parseFloat((last.temperature + noise()).toFixed(2)),
          pressure:    parseFloat((last.pressure + noise() * 0.3).toFixed(1)),
          humidity:    parseFloat((last.humidity + noise() * 0.6).toFixed(1)),
          anomalyScore: parseFloat((Math.random() * 0.2).toFixed(3)),
          sensorHealth: station.health,
        };

        dispatch({ type: 'NEW_READING', payload: { stationId: station.id, reading } });
      });

      dispatch({
        type: 'ADD_EVENT',
        payload: {
          id: `e${Date.now()}`,
          ts: new Date().toISOString(),
          type: 'reading',
          icon: '✓',
          text: 'Reading received — normal',
          stationId: 'AWS-001',
        },
      });
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real WebSocket connection (used when VITE_USE_MOCK=false)
  const connectWS = useCallback(() => {
    if (USE_MOCK) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      dispatch({ type: 'SET_CONNECTION', payload: 'CONNECTING' });

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        dispatch({ type: 'SET_CONNECTION', payload: 'CONNECTED' });
        dispatch({ type: 'SET_WS_CONNECTED', payload: true });
        clearInterval(pollingTimer.current);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'reading') {
            dispatch({ type: 'NEW_READING', payload: { stationId: msg.stationId, reading: msg.data } });
          } else if (msg.type === 'anomaly') {
            dispatch({ type: 'NEW_ANOMALY', payload: msg.data });
            dispatch({ type: 'ADD_EVENT', payload: { id: `e${Date.now()}`, ts: new Date().toISOString(), type: 'anomaly', icon: '🔴', text: `ANOMALY — ${msg.data.type}`, stationId: msg.data.stationId, anomalyId: msg.data.id } });
          } else if (msg.type === 'health') {
            dispatch({ type: 'UPDATE_HEALTH', payload: { stationId: msg.stationId, health: msg.data } });
          }
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        dispatch({ type: 'SET_WS_CONNECTED', payload: false });
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        if (reconnectAttempts.current > 3) {
          dispatch({ type: 'SET_CONNECTION', payload: 'POLLING' });
          startPolling();
        } else {
          dispatch({ type: 'SET_CONNECTION', payload: 'RECONNECTING' });
          reconnectTimer.current = setTimeout(connectWS, delay);
        }
      };

      ws.onerror = () => ws.close();
    } catch {
      dispatch({ type: 'SET_CONNECTION', payload: 'DISCONNECTED' });
    }
  }, []);

  const startPolling = useCallback(() => {
    // Polling fallback — fetch latest readings every 10s
    pollingTimer.current = setInterval(async () => {
      try {
        const data = await apiClient.get('/sensors');
        if (data) dispatch({ type: 'NEW_READING', payload: data });
      } catch { /* silent */ }
    }, 10000);
  }, []);

  useEffect(() => {
    if (!USE_MOCK) connectWS();
    return () => {
      wsRef.current?.close();
      clearTimeout(reconnectTimer.current);
      clearInterval(pollingTimer.current);
    };
  }, [connectWS]);

  const setSelectedStation = useCallback((id) => {
    dispatch({ type: 'SET_SELECTED_STATION', payload: id });
  }, []);

  // Inject a mock anomaly (used by Simulation Lab)
  const injectMockAnomaly = useCallback((type) => {
    const anomalyTypes = {
      TEMPERATURE_SPIKE: { severity: 'HIGH', score: 0.94 + Math.random() * 0.04, rootCauses: ['TEMPERATURE_SPIKE', 'MULTIVARIATE_INCONSISTENCY'] },
      FROZEN_SENSOR:     { severity: 'HIGH', score: 0.78 + Math.random() * 0.1, rootCauses: ['FROZEN_SENSOR', 'REPEATED_VALUE'] },
      HUMIDITY_SPIKE:    { severity: 'MEDIUM', score: 0.62 + Math.random() * 0.1, rootCauses: ['HUMIDITY_SPIKE'] },
      COMMUNICATION_FAILURE: { severity: 'WATCH', score: 0.38 + Math.random() * 0.1, rootCauses: ['MISSING_DATA', 'TIMEOUT'] },
      NORMAL:            null,
    };

    const def = anomalyTypes[type];
    if (!def) return null;

    const id = `ANO-SIM-${Date.now()}`;
    const anomaly = {
      id,
      stationId: state.selectedStation,
      timestamp: new Date().toISOString(),
      type,
      severity: def.severity,
      score: parseFloat(def.score.toFixed(3)),
      confidence: parseFloat((def.score * 0.95).toFixed(3)),
      status: 'active',
      detectionLayers: {
        ruleEngine: parseFloat((Math.random() * 0.4).toFixed(2)),
        temporalAnalysis: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
        multivariate: parseFloat((0.4 + Math.random() * 0.4).toFixed(2)),
        isolationForest: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
      },
      rootCauses: def.rootCauses,
      affectedSensors: ['temperature'],
      explanation: `Simulated ${type.toLowerCase().replace(/_/g, ' ')} event injected via Simulation Lab.`,
      rawReading: { temperature: 55.0, pressure: 1007.4, humidity: 31.2, anomalyScore: def.score },
      correctedReading: { temperature: 33.1, pressure: 1007.4, humidity: 64.1, confidence: 0.91 },
      normalReading: { temperature: 31.8, pressure: 1008.2, humidity: 64.2 },
    };

    dispatch({ type: 'NEW_ANOMALY', payload: anomaly });
    dispatch({ type: 'ADD_EVENT', payload: { id: `e${Date.now()}`, ts: new Date().toISOString(), type: 'anomaly', icon: '🔴', text: `ANOMALY — ${type}`, stationId: state.selectedStation, anomalyId: id } });
    return id;
  }, [state.selectedStation]);

  return (
    <AppContext.Provider value={{ state, dispatch, setSelectedStation, injectMockAnomaly }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
