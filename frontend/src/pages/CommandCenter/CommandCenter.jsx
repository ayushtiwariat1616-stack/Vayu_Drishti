import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, TrendingDown, Minus, Activity, Radio, AlertTriangle, HeartPulse } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import LiveEventStream from "../../components/system/LiveEventStream";
import { formatRelative } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

// Animated number component
function AnimatedNumber({ value, decimals = 1, className = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end   = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - (1 - t) ** 3;
      setDisplay(parseFloat((start + (end - start) * ease).toFixed(decimals + 1)));
      if (t < 1) requestAnimationFrame(animate);
      else { setDisplay(end); prev.current = end; }
    };
    requestAnimationFrame(animate);
  }, [value, decimals]);

  return (
    <span className={`tabular ${className}`}>
      {typeof display === 'number' ? display.toFixed(decimals) : display}
    </span>
  );
}

// Sensor sparkline
function Sparkline({ data = [], dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data.slice(-30)}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Trend indicator
function Trend({ current, baseline }) {
  if (baseline == null) return null;
  const diff = current - baseline;
  const pct  = ((Math.abs(diff) / Math.abs(baseline)) * 100).toFixed(1);
  if (Math.abs(diff) < 0.01) {
    return <span className="flex items-center gap-0.5 text-atmo-muted text-xs"><Minus className="w-3 h-3" /> Stable</span>;
  }
  const up = diff > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-critical' : 'text-sky'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{diff.toFixed(1)} vs baseline
    </span>
  );
}

// Range bar
function RangeBar({ value, min, max }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="w-full h-1 bg-atmo-mid rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-teal transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Individual sensor card
function SensorCard({ label, value, unit, icon: Icon, color, dataKey, readings, baseline, status, range }) {
  const current = readings.slice(-1)[0]?.[dataKey] ?? value;

  return (
    <div className="glass p-5 flex flex-col gap-3 animate-in-up group hover:shadow-glass-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="label flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          {label}
        </div>
        <span className={`badge ${status === 'NORMAL' ? 'badge-normal' : status === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
          <span className={`status-dot ${status === 'NORMAL' ? 'status-dot-live' : status === 'HIGH' ? 'status-dot-critical' : 'status-dot-warning'}`} />
          {status}
        </span>
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="metric-value" style={{ color }}>
            <AnimatedNumber value={current} decimals={1} />
          </span>
          <span className="text-atmo-muted text-lg font-light">{unit}</span>
        </div>
        <div className="mt-1.5">
          <Trend current={current} baseline={baseline?.mean} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="-mx-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <Sparkline data={readings} dataKey={dataKey} color={color} />
      </div>

      {/* Range */}
      {range && (
        <div>
          <RangeBar value={current} min={range.min} max={range.max} />
          <div className="flex justify-between mt-1">
            <span className="mono text-2xs text-atmo-muted">{range.min}{unit}</span>
            <span className="mono text-2xs text-atmo-muted">{range.max}{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Network summary chip
function SummaryChip({ label, value, color = 'text-atmo-deep', sublabel }) {
  return (
    <div className="card-sm px-5 py-3 flex flex-col">
      <div className="label mb-1">{label}</div>
      <div className={`text-3xl font-bold tabular ${color}`}>{value}</div>
      {sublabel && <div className="text-2xs text-atmo-muted mt-0.5">{sublabel}</div>}
    </div>
  );
}

// Station status row
function StationRow({ station, readings }) {
  const navigate = useNavigate();
  const r = readings[station.id] || {};
  return (
    <button
      onClick={() => navigate(`/stations/${station.id}`)}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-atmo-mid/60
                 transition-all duration-200 text-left group"
    >
      <span className={`status-dot ${
        station.status === 'healthy' ? 'status-dot-live' :
        station.status === 'monitoring' ? 'status-dot-warning' : 'status-dot-muted'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-atmo-deep">{station.id}</div>
        <div className="text-2xs text-atmo-muted">{station.location.name}</div>
      </div>
      <div className="flex items-center gap-5 text-xs tabular">
        <div className="text-center">
          <div className="text-atmo-muted text-2xs">TEMP</div>
          <div className="font-semibold text-atmo-deep mono">{r.temperature?.toFixed(1) ?? '—'}°C</div>
        </div>
        <div className="text-center">
          <div className="text-atmo-muted text-2xs">HUM</div>
          <div className="font-semibold text-atmo-deep mono">{r.humidity?.toFixed(0) ?? '—'}%</div>
        </div>
        <div className="text-center">
          <div className="text-atmo-muted text-2xs">PRESS</div>
          <div className="font-semibold text-atmo-deep mono">{r.pressure?.toFixed(0) ?? '—'} hPa</div>
        </div>
        <div className={`badge ${
          station.status === 'healthy' ? 'badge-healthy' :
          station.status === 'monitoring' ? 'badge-medium' : 'badge-watch'
        }`}>
          {station.status.toUpperCase()}
        </div>
      </div>
    </button>
  );
}

export default function CommandCenter() {
  const { state } = useApp();
  const { stations, currentReadings, telemetry, anomalies, anomalyStats, baselines, events } = state;

  const selected = stations.find(s => s.id === state.selectedStation) || stations[0];
  const cr = currentReadings[selected.id] || {};
  const bl = baselines[selected.id] || {};
  const td = telemetry[selected.id] || [];

  const activeAlerts = anomalies.filter(a => a.status === 'active').length;

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Page header */}
      <div className="animate-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Command Center</h1>
            <p className="text-sm text-atmo-muted mt-0.5">Real-time overview of the AWS monitoring network</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="status-dot status-dot-live" />
              <span className="text-xs font-semibold text-mint tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
            <div className="text-2xs text-atmo-muted mt-0.5">{selected.id} · WebSocket LIVE</div>
          </div>
        </div>
      </div>

      {/* Network Summary */}
      <div className="grid grid-cols-4 gap-3 animate-in-up stagger-1">
        <SummaryChip label="ACTIVE STATIONS" value={stations.length} sublabel="Monitored nodes" />
        <SummaryChip
          label="HEALTHY"
          value={stations.filter(s => s.status === 'healthy').length}
          color="text-mint"
          sublabel="Operating normally"
        />
        <SummaryChip
          label="MONITORING"
          value={stations.filter(s => s.status === 'monitoring').length}
          color="text-amber"
          sublabel="Degraded sensors"
        />
        <SummaryChip
          label="ACTIVE ALERTS"
          value={activeAlerts}
          color={activeAlerts > 0 ? 'text-critical' : 'text-atmo-deep'}
          sublabel={activeAlerts > 0 ? `${anomalyStats.high} HIGH severity` : 'All clear'}
        />
      </div>

      {/* Sensor cards */}
      <div className="grid grid-cols-3 gap-4">
        <SensorCard
          label="TEMPERATURE"
          value={cr.temperature ?? 0}
          unit="°C"
          icon={Activity}
          color="#2a7a7b"
          dataKey="temperature"
          readings={td}
          baseline={bl.temperature}
          status={cr.anomalyScore > 0.6 ? 'HIGH' : 'NORMAL'}
          range={bl.temperature}
        />
        <SensorCard
          label="PRESSURE"
          value={cr.pressure ?? 0}
          unit=" hPa"
          icon={Activity}
          color="#5a9db5"
          dataKey="pressure"
          readings={td}
          baseline={bl.pressure}
          status="NORMAL"
          range={bl.pressure}
        />
        <SensorCard
          label="HUMIDITY"
          value={cr.humidity ?? 0}
          unit="%"
          icon={Activity}
          color="#4caf8a"
          dataKey="humidity"
          readings={td}
          baseline={bl.humidity}
          status="NORMAL"
          range={bl.humidity}
        />
      </div>

      {/* Bottom row: stations + events */}
      <div className="grid grid-cols-5 gap-4 animate-in-up stagger-3">
        {/* Station overview */}
        <div className="col-span-3 glass p-4">
          <div className="label mb-3 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal" /> STATION OVERVIEW
          </div>
          <div className="space-y-1">
            {stations.map(s => (
              <StationRow key={s.id} station={s} readings={currentReadings} />
            ))}
          </div>

          {/* Anomaly summary */}
          <div className="mt-4 pt-4 border-t border-atmo-border">
            <div className="label mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-critical" /> RECENT ANOMALIES
            </div>
            <div className="space-y-1.5">
              {anomalies.filter(a => a.status === 'active').slice(0, 3).map(a => (
                <div key={a.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg
                  ${a.severity === 'HIGH' ? 'bg-critical/5 border border-critical/10' : 'bg-amber/5 border border-amber/10'}`}>
                  <span className={`status-dot ${a.severity === 'HIGH' ? 'status-dot-critical' : 'status-dot-warning'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{a.type?.replace(/_/g, ' ')}</span>
                    <span className="text-2xs text-atmo-muted ml-2">{a.stationId}</span>
                  </div>
                  <span className={`badge ${a.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>{a.severity}</span>
                  <span className="mono text-2xs text-atmo-muted">{formatRelative(a.timestamp)}</span>
                </div>
              ))}
              {anomalies.filter(a => a.status === 'active').length === 0 && (
                <div className="text-center py-4 text-atmo-muted text-xs">
                  ✓ No active anomalies
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live events */}
        <div className="col-span-2">
          <LiveEventStream events={events} maxItems={10} className="h-full" />
        </div>
      </div>
    </div>
  );
}
