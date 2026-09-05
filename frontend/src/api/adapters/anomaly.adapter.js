export const adaptAnomaly = (data) => {
  if (!data) return null;

  return {
    ...data,
    id: String(data.id),
    stationId: data.station_id || data.stationId,
    type: data.anomaly_type || data.type,
    severity: data.severity,
    score: data.score,
    confidence: data.confidence,
    status: data.status,
    description: data.description,
    timestamp: data.timestamp,
    isResolved: data.is_resolved !== undefined ? data.is_resolved : data.isResolved,
    // Add default fallbacks for nested properties not currently present on backend model
    detectionLayers: data.detection_layers || data.detectionLayers || {},
    rootCauses: data.root_causes || data.rootCauses || [],
    affectedSensors: data.affected_sensors || data.affectedSensors || [],
    rawReading: data.raw_reading || data.rawReading || null,
    normalReading: data.normal_reading || data.normalReading || null,
    explanation: data.explanation || data.description,
  };
};

export const adaptAnomaliesList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(adaptAnomaly);
};
