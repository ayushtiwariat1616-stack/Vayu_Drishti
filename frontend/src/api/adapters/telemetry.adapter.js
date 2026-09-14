export const adaptTelemetry = (data) => {
  if (!data) return null;

  return {
    ...data, // Preserve other fields
    stationId: data.station || data.station_id || data.stationId,
    health: data.sensor_health || data.health,
    anomalyScore: data.anomaly_score !== undefined ? data.anomaly_score : data.anomalyScore,
  };
};
