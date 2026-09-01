// Mock sensor health data
export const mockSensorHealth = {
  'AWS-001': {
    overall: 94,
    sensors: {
      temperature: { health: 96, status: 'normal', lastCalibrated: '2026-08-01' },
      pressure:    { health: 92, status: 'normal', lastCalibrated: '2026-08-01' },
      humidity:    { health: 94, status: 'normal', lastCalibrated: '2026-08-01' },
    },
    trend: [100,100,99,99,98,97,97,96,95,95,94,94],
  },
  'AWS-002': {
    overall: 71,
    sensors: {
      temperature: { health: 55, status: 'degraded', lastCalibrated: '2026-07-15' },
      pressure:    { health: 82, status: 'normal',   lastCalibrated: '2026-07-15' },
      humidity:    { health: 76, status: 'normal',   lastCalibrated: '2026-07-15' },
    },
    trend: [95,92,88,85,80,78,75,74,73,72,71,71],
  },
  'AWS-003': {
    overall: 88,
    sensors: {
      temperature: { health: 90, status: 'normal', lastCalibrated: '2026-08-10' },
      pressure:    { health: 88, status: 'normal', lastCalibrated: '2026-08-10' },
      humidity:    { health: 86, status: 'normal', lastCalibrated: '2026-08-10' },
    },
    trend: [92,91,90,90,89,89,89,88,88,88,88,88],
  },
};

// Mock events for the live event stream
export const generateMockEvents = () => {
  const now = Date.now();
  return [
    { id: 'e1', ts: new Date(now - 1000).toISOString(),  type: 'anomaly',  icon: '🔴', text: 'ANOMALY CREATED — Temperature Spike', stationId: 'AWS-001', anomalyId: 'ANO-001' },
    { id: 'e2', ts: new Date(now - 2000).toISOString(),  type: 'warning',  icon: '⚠',  text: 'Temperature reading: 55.0°C',         stationId: 'AWS-001' },
    { id: 'e3', ts: new Date(now - 5000).toISOString(),  type: 'reading',  icon: '✓',  text: 'Sensor health updated — 94%',          stationId: 'AWS-001' },
    { id: 'e4', ts: new Date(now - 7000).toISOString(),  type: 'reading',  icon: '✓',  text: 'Reading received — normal',            stationId: 'AWS-001' },
    { id: 'e5', ts: new Date(now - 10000).toISOString(), type: 'reading',  icon: '✓',  text: 'Reading received — normal',            stationId: 'AWS-001' },
    { id: 'e6', ts: new Date(now - 25000).toISOString(), type: 'anomaly',  icon: '🔴', text: 'ANOMALY CREATED — Frozen Sensor',      stationId: 'AWS-002', anomalyId: 'ANO-002' },
    { id: 'e7', ts: new Date(now - 30000).toISOString(), type: 'reading',  icon: '✓',  text: 'Reading received — normal',            stationId: 'AWS-003' },
  ];
};
