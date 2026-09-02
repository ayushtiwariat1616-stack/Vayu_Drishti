// Mock stations following exact API contract
export const mockStations = [
  {
    id: 'AWS-001',
    name: 'Primary Weather Station',
    status: 'healthy',
    health: 94,
    lastSeen: new Date(Date.now() - 1200).toISOString(),
    device: 'ESP32-001',
    location: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
    firmware: 'v2.4.1',
    uptime: 99.7,
  },
  {
    id: 'AWS-002',
    name: 'Secondary Weather Station',
    status: 'monitoring',
    health: 71,
    lastSeen: new Date(Date.now() - 8400).toISOString(),
    device: 'ESP32-002',
    location: { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
    firmware: 'v2.4.0',
    uptime: 97.2,
  },
  {
    id: 'AWS-003',
    name: 'Remote Station Alpha',
    status: 'healthy',
    health: 88,
    lastSeen: new Date(Date.now() - 3600).toISOString(),
    device: 'ESP32-003',
    location: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
    firmware: 'v2.4.1',
    uptime: 98.5,
  },
];

export const mockCurrentReadings = {
  'AWS-001': { temperature: 31.8, pressure: 1008.2, humidity: 64.2, anomalyScore: 0.12, sensorHealth: 94 },
  'AWS-002': { temperature: 29.4, pressure: 1010.6, humidity: 72.8, anomalyScore: 0.08, sensorHealth: 71 },
  'AWS-003': { temperature: 26.1, pressure: 1012.1, humidity: 58.3, anomalyScore: 0.05, sensorHealth: 88 },
};

export const mockBaselines = {
  'AWS-001': {
    temperature: { mean: 31.0, min: 28.4, max: 34.1 },
    pressure:    { mean: 1009.6, min: 1002.0, max: 1015.0 },
    humidity:    { mean: 62.1, min: 55.0, max: 78.0 },
  },
  'AWS-002': {
    temperature: { mean: 28.8, min: 26.0, max: 32.5 },
    pressure:    { mean: 1011.2, min: 1004.0, max: 1016.5 },
    humidity:    { mean: 74.0, min: 65.0, max: 82.0 },
  },
  'AWS-003': {
    temperature: { mean: 25.5, min: 22.0, max: 30.0 },
    pressure:    { mean: 1013.0, min: 1006.0, max: 1018.0 },
    humidity:    { mean: 57.5, min: 48.0, max: 68.0 },
  },
};
