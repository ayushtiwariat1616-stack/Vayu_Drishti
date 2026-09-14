import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom icons using standard HTML/CSS
const getMarkerIcon = (status) => {
  const isCritical = status === 'critical' || status === 'error';
  const colorClass = isCritical ? 'bg-critical' : 'bg-teal';
  
  const html = `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute inset-0 rounded-full ${colorClass} shadow-md flex items-center justify-center rounded-br-none -rotate-45 transform origin-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

export default function StationMap({ stations, center = [20.5937, 78.9629], zoom = 4, className = 'h-64 w-full rounded-xl' }) {
  // Fallback to empty array if stations is undefined
  const mapStations = Array.isArray(stations) ? stations : (stations ? [stations] : []);

  // Use Esri World Physical Map (matches the mockup and requires no API key)
  const mapUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
  const attribution = 'Tiles &copy; Esri &mdash; Source: US National Park Service';

  return (
    <div className={`overflow-hidden border border-atmo-border shadow-glass ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full bg-atmo-bg z-0">
        <TileLayer
          attribution={attribution}
          url={mapUrl}
        />
        {mapStations.map((station) => (
          station.location?.lat && station.location?.lon ? (
            <Marker 
              key={station.station_id || station.id} 
              position={[station.location.lat, station.location.lon]}
              icon={getMarkerIcon(station.status)}
            >
              <Popup className="text-atmo-deep custom-popup">
                <div className="font-semibold text-sm">{station.name || station.station_id || station.id}</div>
                <div className="text-xs text-atmo-muted">{station.location.name || 'Unknown Location'}</div>
                <div className="flex gap-3 mt-2 text-xs font-medium">
                   <span>25.0 °C</span>
                   <span>1012.0 hPa</span>
                   <span>60%</span>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
