import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import TelemetryChart from '../../components/charts/TelemetryChart';
import { Clock3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PERIODS = [
  { label: '1D',  ms: 86_400_000,    tf: '1H' },
  { label: '7D',  ms: 604_800_000,   tf: '1D' },
  { label: '30D', ms: 2_592_000_000, tf: '7D' },
];

const PARAMS = ['temperature', 'pressure', 'humidity'];

export default function HistoricalAnalysis() {
  const { state } = useApp();
  const { stations, telemetry, anomalies } = state;
  const navigate = useNavigate();

  const [station, setStation]  = useState(stations[0]?.id ?? 'AWS-001');
  const [param, setParam]      = useState('temperature');
  const [period, setPeriod]    = useState('1D');

  const periodConfig = PERIODS.find(p => p.label === period) ?? PERIODS[0];
  const data = telemetry[station] || [];
  const stationAnomalies = anomalies.filter(a => a.stationId === station);

  // Compute stats
  const stats = useMemo(() => {
    const cutoff = Date.now() - periodConfig.ms;
    const filtered = data.filter(d => new Date(d.timestamp).getTime() > cutoff);
    if (!filtered.length) return null;
    const vals = filtered.map(d => d[param]).filter(v => v != null);
    if (!vals.length) return null;
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const min  = Math.min(...vals);
    const max  = Math.max(...vals);
    const first = vals[0];
    const last  = vals[vals.length - 1];
    const change = last - first;
    return { mean, min, max, count: vals.length, change };
  }, [data, param, period, periodConfig.ms]);

  const unit = param === 'temperature' ? '°C' : param === 'pressure' ? ' hPa' : '%';

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Header */}
      <div className="animate-in-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Historical Analysis</h1>
          <p className="text-sm text-atmo-muted mt-0.5">Long-term sensor behavior · trend analysis</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 animate-in-up stagger-1">
        <div className="flex flex-col gap-0.5">
          <div className="label text-2xs">STATION</div>
          <select
            value={station}
            onChange={e => setStation(e.target.value)}
            className="text-sm border border-atmo-border rounded-lg px-3 py-2 bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50 min-w-[140px]"
          >
            {stations.map(s => (
              <option 
                key={s.station_id || s.id} 
                value={s.station_id || s.id}
              >
                {s.station_id || s.id} — {s.name || (s.latitude && s.longitude ? `Lat: ${s.latitude}°, Lon: ${s.longitude}°` : 'Location Pending')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="label text-2xs">PARAMETER</div>
          <select
            value={param}
            onChange={e => setParam(e.target.value)}
            className="text-sm border border-atmo-border rounded-lg px-3 py-2 bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50"
          >
            {PARAMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="label text-2xs">PERIOD</div>
          <div className="flex items-center gap-1">
            {PERIODS.map(p => (
              <button
                key={p.label}
                onClick={() => setPeriod(p.label)}
                className={`tf-btn ${period === p.label ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 animate-in-up stagger-2">
          {[
            { label: 'MEAN', val: stats.mean.toFixed(1), color: 'text-teal' },
            { label: 'MINIMUM', val: stats.min.toFixed(1), color: 'text-sky-deep' },
            { label: 'MAXIMUM', val: stats.max.toFixed(1), color: 'text-critical' },
            { label: 'ANOMALIES', val: stationAnomalies.length, color: stationAnomalies.length > 0 ? 'text-amber' : 'text-mint' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card-sm px-5 py-3">
              <div className="label mb-1">{label}</div>
              <div className={`text-3xl font-bold tabular ${color}`}>
                {val}{label !== 'ANOMALIES' ? unit : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historical chart */}
      <div className="animate-in-up stagger-3">
        <TelemetryChart
          data={data}
          anomalies={stationAnomalies}
          mode="historical"
          sensor={param}
          height={360}
          initialTimeframe={periodConfig.tf}
          showModeToggle={false}
          showTimeframePicker={true}
          allowMaximize={true}
          title={`HISTORICAL · ${station} · ${param.toUpperCase()}`}
        />
      </div>

      {/* Anomaly events in period */}
      {stationAnomalies.length > 0 && (
        <div className="card p-4 animate-in-up stagger-4">
          <div className="label mb-3 flex items-center gap-1.5">
            <Clock3 className="w-3.5 h-3.5 text-teal" /> ANOMALY EVENTS IN PERIOD
          </div>
          <div className="space-y-1">
            {stationAnomalies.map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/anomalies/${a.id}`)}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-atmo-mid/40 transition-colors group text-left"
              >
                <span className={`badge ${a.severity === 'HIGH' ? 'badge-high' : a.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'}`}>
                  {a.severity}
                </span>
                <span className="text-sm font-medium text-atmo-deep flex-1">{a.type?.replace(/_/g, ' ')}</span>
                <span className="mono text-xs text-atmo-muted">{new Date(a.timestamp).toLocaleDateString()}</span>
                <span className="mono text-xs font-semibold">{a.score.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
