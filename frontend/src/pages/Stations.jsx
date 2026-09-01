import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Radio, HeartPulse, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatRelative } from '../components/utils/time';

function HealthBar({ value }) {
  const color = value >= 85 ? '#4caf8a' : value >= 65 ? '#d97706' : '#c0392b';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-atmo-mid rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mono text-xs font-semibold w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

function StationCard({ station, readings, anomalies }) {
  const navigate = useNavigate();
  const r = readings[station.id] || {};
  const stationAnomalies = anomalies.filter(a => a.stationId === station.id && a.status === 'active');

  return (
    <div className={`glass p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-glass-lg animate-in-up
      ${station.status === 'healthy' ? 'hover:shadow-glow' :
        station.status === 'monitoring' ? 'hover:shadow-glow-amber' : ''}`}>
      {/* Station header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`status-dot ${
              station.status === 'healthy' ? 'status-dot-live' :
              station.status === 'monitoring' ? 'status-dot-warning' : 'status-dot-muted'
            }`} />
            <span className="text-lg font-bold text-atmo-deep">{station.id}</span>
          </div>
          <div className="text-xs text-atmo-muted">{station.location.name}</div>
          <div className="text-2xs text-atmo-muted/60 mt-0.5">{station.device}</div>
        </div>
        <span className={`badge ${
          station.status === 'healthy' ? 'badge-healthy' :
          station.status === 'monitoring' ? 'badge-medium' : 'badge-watch'
        }`}>
          {station.status.toUpperCase()}
        </span>
      </div>

      {/* Health */}
      <div>
        <div className="label mb-1.5 flex items-center gap-1">
          <HeartPulse className="w-3 h-3" /> HEALTH
        </div>
        <HealthBar value={station.health} />
      </div>

      {/* Sensor readings */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: 'TEMP',  v: r.temperature?.toFixed(1), u: '°C' },
          { l: 'PRESS', v: r.pressure?.toFixed(0),    u: 'hPa' },
          { l: 'HUMID', v: r.humidity?.toFixed(0),    u: '%' },
        ].map(({ l, v, u }) => (
          <div key={l} className="text-center bg-atmo-mid/40 rounded-lg px-2 py-2">
            <div className="text-2xs text-atmo-muted mb-0.5">{l}</div>
            <div className="mono text-sm font-bold text-atmo-deep">{v ?? '—'}<span className="text-2xs font-normal ml-0.5 text-atmo-muted">{u}</span></div>
          </div>
        ))}
      </div>

      {/* Last seen */}
      <div className="flex items-center gap-1.5 text-xs text-atmo-muted">
        <Clock className="w-3 h-3" />
        Last seen: <span className="text-atmo-deep font-medium">{formatRelative(station.lastSeen)}</span>
      </div>

      {/* Active alerts */}
      {stationAnomalies.length > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-critical/5 border border-critical/10 rounded-lg">
          <AlertTriangle className="w-3 h-3 text-critical flex-shrink-0" />
          <span className="text-xs text-critical font-medium">{stationAnomalies.length} active alert{stationAnomalies.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Open button */}
      <button
        onClick={() => navigate(`/stations/${station.id}`)}
        className="w-full btn-primary flex items-center justify-center gap-2 mt-auto"
      >
        OPEN STATION
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Stations() {
  const { state } = useApp();
  const { stations, currentReadings, anomalies, anomalyStats } = state;

  const activeCount   = stations.filter(s => s.status === 'healthy').length;
  const degradedCount = stations.filter(s => s.status !== 'healthy').length;

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Header */}
      <div className="animate-in-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Stations</h1>
          <p className="text-sm text-atmo-muted mt-0.5">
            {stations.length} stations monitored · {activeCount} healthy · {degradedCount} monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card-sm px-4 py-2 text-center">
            <div className="label text-2xs mb-0.5">NETWORK HEALTH</div>
            <div className="text-2xl font-bold text-teal tabular">
              {Math.round(stations.reduce((s, st) => s + st.health, 0) / stations.length)}%
            </div>
          </div>
        </div>
      </div>

      {/* Station cards grid */}
      <div className="grid grid-cols-3 gap-5">
        {stations.map((s, i) => (
          <div key={s.id} className={`stagger-${i + 1}`}>
            <StationCard
              station={s}
              readings={currentReadings}
              anomalies={anomalies}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
