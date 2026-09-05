export const adaptStation = (data) => {
  if (!data) return null;
  
  return {
    ...data, // Preserve other fields
    id: data.station_id || data.id,
    location: {
      lat: data.latitude,
      lon: data.longitude,
    },
    health: data.sensor_health || data.health,
    // Normalize status to lowercase — backend sends "HEALTHY", UI checks "healthy"
    status: (data.status || 'healthy').toLowerCase(),
  };
};

export const adaptStationsList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(adaptStation);
};
