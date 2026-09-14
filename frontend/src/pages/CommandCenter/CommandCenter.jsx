import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Radio,
  AlertTriangle,
  MapPin,
  Thermometer,
  Gauge,
  Droplets
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import LiveEventStream from "../../components/system/LiveEventStream";
import { formatRelative } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";
import StationMap from "../../components/ui/StationMap";

// Animated number component
function AnimatedNumber({ value, decimals = 1, className = "" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - (1 - t) ** 3;
      setDisplay(
        parseFloat((start + (end - start) * ease).toFixed(decimals + 1)),
      );
      if (t < 1) requestAnimationFrame(animate);
      else {
        setDisplay(end);
        prev.current = end;
      }
    };
    requestAnimationFrame(animate);
  }, [value, decimals]);

  return (
    <span className={`tabular ${className}`}>
      {typeof display === "number" ? display.toFixed(decimals) : display}
    </span>
  );
}

// Trend indicator
function Trend({ current, baseline, unit }) {
  if (baseline == null) return null;
  const diff = current - baseline;
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-atmo-muted text-sm font-medium">
        <Minus className="w-3.5 h-3.5" /> Stable
      </span>
    );
  }
  const up = diff > 0;
  return (
    <span
      className={`flex items-center gap-1 text-sm font-semibold ${up ? "text-critical dark:text-critical-light" : "text-teal"}`}
    >
      {up ? "+" : ""}
      {diff.toFixed(1)} {unit} vs baseline
    </span>
  );
}

// Big Chart Cards
function BigSensorCard({
  label,
  subtitle,
  value,
  unit,
  icon: Icon,
  color,
  dataKey,
  readings,
  baseline,
  status,
  chartType
}) {
  const current = readings.slice(-1)[0]?.[dataKey] ?? value;

  return (
    <div className="glass flex flex-col justify-between animate-in-up group transition-all duration-300 overflow-hidden h-[180px]">
      <div className="p-4 pb-0 flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-atmo-muted" />
            <span className="text-xs font-bold tracking-widest text-atmo-deep uppercase">{label}</span>
            <span className="text-2xs text-atmo-muted uppercase ml-1 hidden lg:block">{subtitle}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold tabular text-teal tracking-tight" style={{ color: color }}>
              <AnimatedNumber value={current} decimals={1} />
            </span>
            <span className="text-atmo-muted text-xl font-medium">{unit}</span>
          </div>
          <div className="mt-1">
            <Trend current={current} baseline={baseline?.mean} unit={unit} />
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded border text-[10px] font-bold flex items-center gap-1.5 uppercase ${
            status === 'NORMAL' ? 'bg-mint/10 border-mint/20 text-mint-dark dark:text-mint' :
            status === 'CRITICAL' ? 'bg-critical/10 border-critical/20 text-critical-dark dark:text-critical' :
            'bg-amber/10 border-amber/20 text-amber-dark dark:text-amber'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'NORMAL' ? 'bg-mint animate-breathe' : status === 'CRITICAL' ? 'bg-critical animate-pulse-slow' : 'bg-amber'}`} />
          {status}
        </div>
      </div>

      <div className="w-full mt-auto flex flex-col">
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={readings.slice(-30)}>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} strokeOpacity={0.2} dot={false} isAnimationActive={false} />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={readings.slice(-30)}>
                <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
              </BarChart>
            ) : (
              <AreaChart data={readings.slice(-30)}>
                <defs>
                  <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#color-${dataKey})`} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        {readings.length > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-atmo-muted px-4 pb-2.5">
            <span>{Math.floor(Math.min(...readings.map(r => r[dataKey] || 0)))}{label === 'TEMPERATURE' ? '°' : ''}</span>
            <span>{Math.ceil(Math.max(...readings.map(r => r[dataKey] || 0)))}{label === 'TEMPERATURE' ? '°' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const { state } = useApp();
  const {
    stations,
    currentReadings,
    telemetry,
    anomalies,
    baselines,
    events,
    connectionStatus,
  } = state;
  const navigate = useNavigate();

  if (!stations || stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-atmo-muted">
        <div className="text-2xl font-bold mb-2 tracking-widest text-atmo-deep">
          AWAITING TELEMETRY
        </div>
        <p className="text-sm">Command Center standing by. Waiting for backend sync...</p>
        <p className="text-xs mt-4 text-sky">Status: {connectionStatus}</p>
      </div>
    );
  }

  const selected = stations.find(s => s.id === state.selectedStation) || stations[0];
  const cr = currentReadings[selected.id] || {};
  const bl = baselines[selected.id] || {};
  const td = telemetry[selected.id] || [];

  return (
    <div className="space-y-4">
      {/* Sensor cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in-up">
        <BigSensorCard
          label="Temperature"
          subtitle={`(24h at ${selected.id})`}
          value={cr.temperature ?? 0}
          unit="°C"
          icon={Thermometer}
          color="rgb(var(--color-teal))"
          dataKey="temperature"
          readings={td}
          baseline={bl.temperature}
          status={(cr.temperature ?? 0) > 50 || (cr.temperature ?? 0) < -10 ? "CRITICAL" : "NORMAL"}
          chartType="line"
        />
        <BigSensorCard
          label="Pressure"
          subtitle="(Atmospheric)"
          value={cr.pressure ?? 0}
          unit="hPa"
          icon={Gauge}
          color="rgb(var(--color-teal))"
          dataKey="pressure"
          readings={td}
          baseline={bl.pressure}
          status={(cr.pressure ?? 0) < 950 || (cr.pressure ?? 0) > 1060 ? "WARNING" : "NORMAL"}
          chartType="bar"
        />
        <BigSensorCard
          label="Humidity"
          subtitle="(Relative Humidity)"
          value={cr.humidity ?? 0}
          unit="%"
          icon={Droplets}
          color="rgb(var(--color-teal))"
          dataKey="humidity"
          readings={td}
          baseline={bl.humidity}
          status={(cr.humidity ?? 0) > 95 || (cr.humidity ?? 0) < 10 ? "WARNING" : "NORMAL"}
          chartType="area"
        />
      </div>

      {/* Middle row: Station Analysis & Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in-up stagger-1">
        {/* Left Col: Station Analysis + Warnings */}
        <div className="flex flex-col gap-4">
          <div className="glass flex flex-col h-full">
            <div className="px-5 py-4 border-b border-atmo-border/40 flex items-center gap-2">
              <Activity className="w-4 h-4 text-atmo-deep" />
              <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Station Analysis</h2>
            </div>
            <div className="p-2 space-y-1">
              {stations.slice(0, 3).map((s) => {
                const r = currentReadings[s.id] || {};
                return (
                  <div key={s.id} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-atmo-mid/50 transition-colors">
                    <div className="flex items-center gap-3 w-[140px] flex-shrink-0">
                      <span className={`status-dot ${s.status === 'healthy' ? 'status-dot-live' : s.status === 'monitoring' ? 'status-dot-warning' : 'status-dot-muted'}`} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-atmo-deep truncate">{s.name?.split(',')[0] || s.id}</div>
                        <div className="text-2xs text-atmo-muted truncate">{s.location?.name || 'Location unknown'}</div>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-between items-center px-2 lg:px-6">
                      <div className="text-sm font-semibold tabular text-atmo-deep w-16 text-center">{r.temperature?.toFixed(1) ?? "—"} °C</div>
                      <div className="text-sm font-semibold tabular text-atmo-deep w-16 text-center">{r.humidity?.toFixed(1) ?? "—"} %</div>
                      <div className="text-sm font-semibold tabular text-atmo-deep w-20 text-center">{r.pressure?.toFixed(1) ?? "—"} hPa</div>
                    </div>
                    <div className="w-[70px] flex justify-end flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${s.status === 'healthy' ? 'bg-mint/10 text-mint' : 'bg-amber/10 text-amber'}`}>
                        {s.status === 'healthy' ? 'Normal' : 'Warning'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Telemetry Warnings */}
          <div className="glass flex flex-col">
            <div className="px-5 py-4 border-b border-atmo-border/40 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-critical" />
              <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Telemetry Warnings</h2>
            </div>
            <div className="p-3 space-y-2">
              {anomalies.filter((a) => a.status === "active").slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5 bg-critical/10 border border-critical/20 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-critical" />
                    <span className="text-xs font-bold tracking-wider text-critical uppercase">{a.type?.replace(/_/g, " ")}</span>
                    <span className="text-xs text-atmo-deep/70">Sensor Error</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-critical">{a.stationId}</span>
                    <span className="mono text-xs text-atmo-muted">{formatRelative(a.timestamp)}</span>
                  </div>
                </div>
              ))}
              {anomalies.filter((a) => a.status === "active").length === 0 && (
                <div className="text-center py-4 text-atmo-muted text-xs">No active warnings</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Live Station Telemetry */}
        <div className="bg-white/40 dark:bg-atmo-surface/40 backdrop-blur-md border border-white/60 dark:border-atmo-border/40 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] flex flex-col h-full overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-atmo-deep" />
              <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Live Station Telemetry</h2>
            </div>
            <button className="text-atmo-muted hover:text-atmo-deep font-bold tracking-widest leading-none">•••</button>
          </div>
          <div className="flex-1 pb-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-2xs font-semibold text-atmo-muted tracking-wider">
                  <th className="px-3 py-2 whitespace-nowrap">Station ID</th>
                  <th className="px-3 py-2 whitespace-nowrap">Location</th>
                  <th className="px-3 py-2 whitespace-nowrap">Type</th>
                  <th className="px-3 py-2 whitespace-nowrap">Temp (°C)</th>
                  <th className="px-3 py-2 whitespace-nowrap">Pressure (hPa)</th>
                  <th className="px-3 py-2 whitespace-nowrap">Humidity (%)</th>
                  <th className="px-3 py-2 whitespace-nowrap">Last Update</th>
                  <th className="px-3 py-2 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {stations.slice(0, 6).map((s, idx) => {
                  const r = currentReadings[s.id] || {};
                  const isErr = s.status === 'monitoring' || s.status === 'error' || s.status === 'critical';
                  return (
                    <tr key={s.id} className={`${idx % 2 !== 0 ? 'bg-white/30 dark:bg-atmo-mid/20' : 'bg-transparent'} hover:bg-white/50 dark:hover:bg-atmo-mid/40 transition-colors`}>
                      <td className="px-3 py-2.5 text-xs font-medium text-atmo-deep whitespace-nowrap">{s.id}</td>
                      <td className="px-3 py-2.5 text-xs text-atmo-muted whitespace-nowrap">{s.name?.split(',')[0] || "Unknown"}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${isErr ? 'bg-[#fff4e5] text-[#ed8936] dark:bg-amber/10 dark:text-amber' : 'bg-mint/10 text-mint-dark dark:text-mint'}`}>
                          {isErr ? (
                            <AlertTriangle className="w-3 h-3" strokeWidth={3} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                          )}
                          {isErr ? 'Warning' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium tabular text-atmo-deep">{r.temperature?.toFixed(1) ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs font-medium tabular text-atmo-deep">{r.pressure?.toFixed(1) ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs font-medium tabular text-atmo-deep">{r.humidity?.toFixed(0) ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-atmo-muted whitespace-nowrap">1 min ago</td>
                      <td className={`px-3 py-2.5 text-xs font-semibold ${isErr ? 'text-critical' : 'text-mint'}`}>{isErr ? 'Sensor Error' : 'Nominal'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Network Map */}
      <div className="glass p-4 flex flex-col h-[400px] animate-in-up stagger-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-atmo-deep" />
            <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Network Map</h2>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-atmo-deep bg-teal/10 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal" /> All Stations
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-atmo-muted">
              <span className="w-2 h-2 rounded-full bg-amber" /> Alerts
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-atmo-muted">
              <span className="w-2 h-2 rounded-full bg-mint" /> Nominal
            </span>
          </div>
        </div>
        <div className="flex-1 rounded-xl overflow-hidden border border-atmo-border/50">
          <StationMap stations={stations} center={[20.5937, 78.9629]} zoom={3} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
