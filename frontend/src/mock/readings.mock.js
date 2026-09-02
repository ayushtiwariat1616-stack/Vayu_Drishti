// Mock readings — generates realistic sensor telemetry data
const now = Date.now();

function generateReadings(stationId, count = 120, intervalMs = 5000, anomalyAt = null) {
  const readings = [];
  const baseTemp = stationId === 'AWS-001' ? 31.0 : stationId === 'AWS-002' ? 28.8 : 25.5;
  const basePress = stationId === 'AWS-001' ? 1009.6 : stationId === 'AWS-002' ? 1011.2 : 1013.0;
  const baseHumid = stationId === 'AWS-001' ? 62.1 : stationId === 'AWS-002' ? 74.0 : 57.5;

  for (let i = count; i >= 0; i--) {
    const ts = now - i * intervalMs;
    const isAnomaly = anomalyAt && Math.abs(i - anomalyAt) < 3;
    const isSpike = anomalyAt && i === anomalyAt;

    const noise = (Math.random() - 0.5) * 2;
    const trend = Math.sin(i * 0.08) * 1.5;

    const temperature = isSpike
      ? baseTemp + 23.2 + Math.random() * 2
      : baseTemp + trend + noise * 0.4 + (isAnomaly ? 5 : 0);

    const humidity = isSpike
      ? baseHumid - 32 + Math.random() * 4
      : baseHumid - trend * 0.4 + noise * 0.6;

    const pressure = basePress + Math.sin(i * 0.05) * 2 + noise * 0.3;

    const anomalyScore = isSpike ? 0.94 : isAnomaly ? 0.45 : Math.random() * 0.15;
    const sensorHealth = isSpike ? 71 : 94 - Math.random() * 5;

    readings.push({
      stationId,
      timestamp: new Date(ts).toISOString(),
      temperature: parseFloat(temperature.toFixed(2)),
      pressure: parseFloat(pressure.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      anomalyScore: parseFloat(anomalyScore.toFixed(3)),
      sensorHealth: parseFloat(sensorHealth.toFixed(1)),
    });
  }
  return readings;
}

// AWS-001: has anomaly at index ~15 from the end (recent)
export const mockReadings = {
  'AWS-001': generateReadings('AWS-001', 120, 5000, 15),
  'AWS-002': generateReadings('AWS-002', 120, 5000, null),
  'AWS-003': generateReadings('AWS-003', 120, 5000, null),
};

// Historical data (7 days, hourly)
export const mockHistoricalReadings = {
  'AWS-001': generateReadings('AWS-001', 168, 3600000, 150),
  'AWS-002': generateReadings('AWS-002', 168, 3600000, null),
};

export { generateReadings };
