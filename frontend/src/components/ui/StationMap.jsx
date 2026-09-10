import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Use MapTiler API key from env variable
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';

export default function StationMap({ stations, center = [20.5937, 78.9629], zoom = 4, className = 'h-64 w-full rounded-xl' }) {
  
  if (!MAPTILER_KEY) {
    return (
      <div className={`flex items-center justify-center bg-atmo-surface border border-atmo-border ${className}`}>
        <div className="text-center p-4">
          <p className="text-atmo-muted text-sm mb-2">MapTiler API Key Missing</p>
          <p className="text-2xs text-atmo-muted/70">Add VITE_MAPTILER_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  // Fallback to empty array if stations is undefined
  const mapStations = Array.isArray(stations) ? stations : (stations ? [stations] : []);

  // Use MapTiler Satellite Hybrid map
  const mapTilerUrl = `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`;
  const mapTilerAttribution = '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e';

  return (
    <div className={`overflow-hidden border border-atmo-border shadow-glass ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full bg-atmo-bg">
        <TileLayer
          attribution={mapTilerAttribution}
          url={mapTilerUrl}
        />
        {mapStations.map((station) => (
          station.location?.lat && station.location?.lon ? (
            <Marker key={station.station_id || station.id} position={[station.location.lat, station.location.lon]}>
              <Popup className="text-atmo-deep">
                <div className="font-semibold text-sm">{station.station_id || station.id}</div>
                <div className="text-xs text-gray-500">{station.location.name || 'Unknown Location'}</div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
