import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, HeartPulse, Clock, Cpu, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatRelative, formatTimestamp } from '../components/utils/time';
import TelemetryChart from '../components/charts/TelemetryChart';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function HealthTrend({ data }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke="#4caf8a" strokeWidth={2} dot={false} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function StationDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const { stations, currentReadings, telemetry, anomalies, sensorHealth } = state;

  const station = stations.find(s => s.id === id);

  if (!station) {
    return (
      <div className="px-6 py-5">
        <Link to="/stations" className="btn-ghost text-sm flex items-center gap-2 mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Stations
        </Link>
        <div className="glass p-12 text-center">
          <div className="text-atmo-deep font-semibold">Station not found: {id}</div>
        </div>
      </div>
    );
  }

  const cr = currentReadings[id] || {};
  const chartData = telemetry[id] || [];
  const stationAnomalies = anomalies.filter(a => a.stationId === id);
  const health = sensorHealth[id];

  const anomalyStats = {
    total:  stationAnomalies.length,
    high:   stationAnomalies.filter(a => a.severity === 'HIGH').length,
    medium: stationAnomalies.filter(a => a.severity === 'MEDIUM').length,
    watch:  stationAnomalies.filter(a => a.severity === 'WATCH').length,
  };

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Back + header */}
      <div className="animate-in-up">
        <Link to="/stations" className="btn-ghost text-sm flex items-center gap-2 mb-4 w-fit -ml-1">
          <ArrowLeft className="w-4 h-4" /> STATIONS
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`status-dot w-3 h-3 ${station.status === 'healthy' ? 'status-dot-live' : 'status-dot-warning'}`} />
              <h1 className="text-2xl font-bold text-atmo-deep">{station.id}</h1>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-atmo-muted">
              <MapPin className="w-3.5 h-3.5" />
              {station.location.name}
              <span className="text-atmo-border">·</span>
              <Cpu className="w-3.5 h-3.5" />
              {station.device}
              <span className="text-atmo-border">·</span>
              <span>FW {station.firmware}</span>
            </div>
          </div>
          <span className={`badge text-sm px-3 py-1 ${station.status === 'healthy' ? 'badge-healthy' : 'badge-medium'}`}>
            {station.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3 animate-in-up stagger-1">
        <div className="card-sm px-4 py-3">
          <div className="label mb-1 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> HEALTH</div>
          <div className={`text-3xl font-bold tabular ${station.health >= 85 ? 'text-mint' : station.health >= 65 ? 'text-amber' : 'text-critical'}`}>
            {station.health}%
          </div>
        </div>
        <div className="card-sm px-4 py-3">
          <div className="label mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> LAST SEEN</div>
          <div className="text-sm font-semibold text-atmo-deep">{formatRelative(station.lastSeen)}</div>
          <div className="mono text-2xs text-atmo-muted">{new Date(station.lastSeen).toLocaleTimeString('en-IN', { hour12: false })}</div>
        </div>
        <div className="card-sm px-4 py-3">
          <div className="label mb-1">TEMPERATURE</div>
          <div className="text-2xl font-bold text-teal tabular">{cr.temperature?.toFixed(1) ?? '—'}°C</div>
        </div>
        <div className="card-sm px-4 py-3">
          <div className="label mb-1">HUMIDITY</div>
          <div className="text-2xl font-bold text-teal tabular">{cr.humidity?.toFixed(0) ?? '—'}%</div>
        </div>
        <div className="card-sm px-4 py-3">
          <div className="label mb-1">PRESSURE</div>
          <div className="text-2xl font-bold text-teal tabular">{cr.pressure?.toFixed(0) ?? '—'} <span className="text-base font-normal text-atmo-muted">hPa</span></div>
        </div>
      </div>

      {/* Health trend + anomaly summary */}
      <div className="grid grid-cols-3 gap-4 animate-in-up stagger-2">
        {/* Health trend */}
        <div className="glass p-4">
          <div className="label mb-2 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-mint" /> HEALTH TREND (12h)
          </div>
          {health?.trend ? (
            <>
              <HealthTrend data={health.trend} />
              <div className="flex justify-between mt-1 text-2xs text-atmo-muted">
                <span>12h ago</span>
                <span>Now: <span className="font-semibold text-atmo-deep">{health.overall}%</span></span>
              </div>
            </>
          ) : <div className="text-atmo-muted text-xs py-4 text-center">No trend data</div>}
        </div>

        {/* Sensor health breakdown */}
        <div className="glass p-4">
          <div className="label mb-3">SENSOR HEALTH</div>
          {health?.sensors && (
            <div className="space-y-2.5">
              {Object.entries(health.sensors).map(([sensor, data]) => (
                <div key={sensor}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs capitalize text-atmo-muted">{sensor}</span>
                    <span className={`text-xs font-semibold ${data.health >= 85 ? 'text-mint' : data.health >= 65 ? 'text-amber' : 'text-critical'}`}>{data.health}%</span>
                  </div>
                  <div className="w-full h-1 bg-atmo-mid rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${data.health}%`,
                        background: data.health >= 85 ? '#4caf8a' : data.health >= 65 ? '#d97706' : '#c0392b'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anomaly summary */}
        <div className="glass p-4">
          <div className="label mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-critical" /> ANOMALY HISTORY
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-atmo-deep tabular">{anomalyStats.total}</div>
              <div className="text-2xs text-atmo-muted">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-critical tabular">{anomalyStats.high}</div>
              <div className="text-2xs text-atmo-muted">HIGH</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber tabular">{anomalyStats.medium}</div>
              <div className="text-2xs text-atmo-muted">MEDIUM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-deep tabular">{anomalyStats.watch}</div>
              <div className="text-2xs text-atmo-muted">WATCH</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/anomalies')}
            className="w-full btn-ghost text-xs flex items-center justify-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Telemetry chart */}
      <div className="animate-in-up stagger-3">
        <TelemetryChart
          data={chartData}
          anomalies={stationAnomalies}
          mode="live"
          height={300}
          title={`TELEMETRY · ${station.id}`}
          showModeToggle={true}
          showTimeframePicker={true}
          allowMaximize={true}
        />
      </div>

      {/* Recent anomalies list */}
      {stationAnomalies.length > 0 && (
        <div className="card p-4 animate-in-up stagger-4">
          <div className="label mb-3">RECENT ANOMALIES</div>
          <div className="divide-y divide-atmo-border/40">
            {stationAnomalies.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/anomalies/${a.id}`)}
                className="w-full flex items-center gap-4 py-2.5 text-left hover:bg-atmo-mid/40 rounded-lg px-2 transition-colors group"
              >
                <span className={`badge ${a.severity === 'HIGH' ? 'badge-high' : a.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'}`}>{a.severity}</span>
                <span className="text-sm font-medium flex-1">{a.type?.replace(/_/g, ' ')}</span>
                <span className="mono text-xs text-atmo-muted">{formatRelative(a.timestamp)}</span>
                <ChevronRight className="w-4 h-4 text-atmo-border group-hover:text-teal transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
