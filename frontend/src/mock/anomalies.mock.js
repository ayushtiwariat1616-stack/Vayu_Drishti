// Mock anomalies following exact API contract
const baseTime = new Date('2026-08-31T18:09:04+05:30');
const t = (offsetMin) => new Date(baseTime.getTime() - offsetMin * 60000).toISOString();

export const mockAnomalies = [
  {
    id: 'ANO-001',
    stationId: 'AWS-001',
    timestamp: t(0),
    type: 'TEMPERATURE_SPIKE',
    severity: 'HIGH',
    score: 0.94,
    confidence: 0.91,
    status: 'active',
    detectionLayers: {
      ruleEngine: 0.20,
      temporalAnalysis: 0.85,
      multivariate: 0.60,
      isolationForest: 0.88,
    },
    rootCauses: ['TEMPERATURE_SPIKE', 'MULTIVARIATE_INCONSISTENCY'],
    affectedSensors: ['temperature', 'humidity'],
    explanation:
      'Temperature increased by 23.2°C above the recent 30-minute baseline, reaching 55.0°C. ' +
      'The temperature-humidity relationship also deviates significantly from the expected covariation pattern — ' +
      'humidity dropped to 31.2% while temperature spiked, which is consistent with a sensor fault or external heat source. ' +
      'Temporal analysis detected a steep step-change inconsistent with natural atmospheric variation.',
    rawReading: { temperature: 55.0, pressure: 1007.4, humidity: 31.2, anomalyScore: 0.94 },
    correctedReading: { temperature: 33.1, pressure: 1007.4, humidity: 64.1, confidence: 0.94 },
    normalReading: { temperature: 31.8, pressure: 1008.2, humidity: 64.2 },
  },
  {
    id: 'ANO-002',
    stationId: 'AWS-002',
    timestamp: t(25),
    type: 'FROZEN_SENSOR',
    severity: 'HIGH',
    score: 0.81,
    confidence: 0.88,
    status: 'active',
    detectionLayers: {
      ruleEngine: 0.75,
      temporalAnalysis: 0.90,
      multivariate: 0.30,
      isolationForest: 0.65,
    },
    rootCauses: ['FROZEN_SENSOR', 'REPEATED_VALUE'],
    affectedSensors: ['temperature'],
    explanation:
      'Temperature sensor has reported an identical value (29.4°C) for 12 consecutive readings over 60 seconds. ' +
      'A functioning sensor should exhibit at minimum micro-variation due to thermal noise. ' +
      'This pattern is strongly indicative of a frozen or stuck sensor value — likely a firmware or hardware communication failure.',
    rawReading: { temperature: 29.4, pressure: 1010.6, humidity: 72.8, anomalyScore: 0.81 },
    correctedReading: { temperature: 28.9, pressure: 1010.6, humidity: 72.8, confidence: 0.72 },
    normalReading: { temperature: 28.8, pressure: 1011.2, humidity: 74.0 },
  },
  {
    id: 'ANO-003',
    stationId: 'AWS-001',
    timestamp: t(98),
    type: 'SENSOR_DRIFT',
    severity: 'MEDIUM',
    score: 0.52,
    confidence: 0.68,
    status: 'acknowledged',
    detectionLayers: {
      ruleEngine: 0.05,
      temporalAnalysis: 0.55,
      multivariate: 0.45,
      isolationForest: 0.52,
    },
    rootCauses: ['SENSOR_DRIFT'],
    affectedSensors: ['pressure'],
    explanation:
      'Pressure readings show a slow, monotonic drift of 4.2 hPa below the 6-hour baseline without corresponding ' +
      'atmospheric events. This gradual departure from expected values suggests progressive sensor calibration drift ' +
      'rather than a sudden fault or genuine meteorological event.',
    rawReading: { temperature: 30.2, pressure: 1003.8, humidity: 67.1, anomalyScore: 0.52 },
    correctedReading: { temperature: 30.2, pressure: 1008.0, humidity: 67.1, confidence: 0.68 },
    normalReading: { temperature: 31.0, pressure: 1009.6, humidity: 62.1 },
  },
  {
    id: 'ANO-004',
    stationId: 'AWS-001',
    timestamp: t(145),
    type: 'HUMIDITY_SPIKE',
    severity: 'MEDIUM',
    score: 0.63,
    confidence: 0.74,
    status: 'resolved',
    detectionLayers: {
      ruleEngine: 0.35,
      temporalAnalysis: 0.70,
      multivariate: 0.55,
      isolationForest: 0.58,
    },
    rootCauses: ['HUMIDITY_SPIKE'],
    affectedSensors: ['humidity'],
    explanation:
      'Humidity spiked to 94.8%, which is 32.7% above the recent baseline. ' +
      'Temperature remained stable, making natural precipitation unlikely. ' +
      'Pattern is consistent with local condensation on the sensor housing.',
    rawReading: { temperature: 31.1, pressure: 1009.1, humidity: 94.8, anomalyScore: 0.63 },
    correctedReading: { temperature: 31.1, pressure: 1009.1, humidity: 63.2, confidence: 0.74 },
    normalReading: { temperature: 31.0, pressure: 1009.6, humidity: 62.1 },
  },
  {
    id: 'ANO-005',
    stationId: 'AWS-003',
    timestamp: t(220),
    type: 'COMMUNICATION_FAILURE',
    severity: 'WATCH',
    score: 0.38,
    confidence: 0.55,
    status: 'resolved',
    detectionLayers: {
      ruleEngine: 0.60,
      temporalAnalysis: 0.20,
      multivariate: 0.15,
      isolationForest: 0.30,
    },
    rootCauses: ['MISSING_DATA', 'TIMEOUT'],
    affectedSensors: ['temperature', 'pressure', 'humidity'],
    explanation:
      'Station AWS-003 missed 4 consecutive telemetry transmissions (20-second gap). ' +
      'This exceeds the expected 5-second interval by 4×. ' +
      'Station recovered automatically. May indicate transient network instability.',
    rawReading: null,
    correctedReading: null,
    normalReading: { temperature: 25.5, pressure: 1013.0, humidity: 57.5 },
  },
  {
    id: 'ANO-006',
    stationId: 'AWS-001',
    timestamp: t(310),
    type: 'SENSOR_DRIFT',
    severity: 'WATCH',
    score: 0.41,
    confidence: 0.61,
    status: 'resolved',
    detectionLayers: {
      ruleEngine: 0.05,
      temporalAnalysis: 0.44,
      multivariate: 0.38,
      isolationForest: 0.40,
    },
    rootCauses: ['SENSOR_DRIFT'],
    affectedSensors: ['humidity'],
    explanation: 'Minor humidity drift detected. Values returned to baseline within 10 minutes.',
    rawReading: { temperature: 31.4, pressure: 1008.8, humidity: 45.2, anomalyScore: 0.41 },
    correctedReading: { temperature: 31.4, pressure: 1008.8, humidity: 62.8, confidence: 0.61 },
    normalReading: { temperature: 31.0, pressure: 1009.6, humidity: 62.1 },
  },
];

export const mockAnomalyStats = {
  total: mockAnomalies.length,
  high: mockAnomalies.filter(a => a.severity === 'HIGH').length,
  medium: mockAnomalies.filter(a => a.severity === 'MEDIUM').length,
  watch: mockAnomalies.filter(a => a.severity === 'WATCH').length,
};

export const severityOrder = { HIGH: 0, MEDIUM: 1, WATCH: 2 };
