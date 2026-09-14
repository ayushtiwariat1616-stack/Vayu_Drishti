import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Radio, HeartPulse, Clock, ArrowRight, AlertTriangle, Search, RefreshCw, Database, Wifi, Cpu, MapPin } from 'lucide-react';
import { formatRelative } from '../../utils/formatters';
import StationMap from '../../components/ui/StationMap';

function HealthBar({ value }) {
  const color = value >= 85 ? 'rgb(var(--color-mint))' : value >= 65 ? 'rgb(var(--color-amber))' : 'rgb(var(--color-critical))';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-atmo-mid/60 rounded-full overflow-hidden border border-atmo-border/40">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mono text-sm font-bold w-9 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

function StationCard({ station, readings, anomalies }) {
  const navigate = useNavigate();
  const r = readings[station.station_id] || {};
  const stationAnomalies = anomalies.filter(a => a.stationId === station.station_id && a.status === 'active');
  const isHealthy = station.status === 'healthy';
  const isMonitoring = station.status === 'monitoring';

  return (
    <div className={`glass p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-glass-lg animate-in-up
      ${isHealthy ? 'hover:shadow-glow' : isMonitoring ? 'hover:shadow-glow-amber' : 'hover:shadow-glow-red'}`}>
      
      {/* Station header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <Radio className="w-5 h-5 text-atmo-deep mt-0.5" />
          <div>
            <div className="text-xl font-bold text-atmo-deep">{station.station_id}</div>
            <div className="text-sm text-atmo-muted">{station.location.name}</div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase ${
          isHealthy ? 'bg-mint/10 text-mint-dark dark:text-mint' :
          isMonitoring ? 'bg-amber/10 text-amber-dark dark:text-amber' : 'bg-critical/10 text-critical-dark dark:text-critical'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-mint animate-breathe' : isMonitoring ? 'bg-amber animate-pulse-slow' : 'bg-critical animate-pulse-slow'}`} />
          {station.status === 'healthy' ? 'Nominal' : station.status.toUpperCase()}
        </span>
      </div>

      {/* Health */}
      <div className="mt-2">
        <div className="text-2xs font-bold tracking-widest text-atmo-muted uppercase mb-2 flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5" /> HEALTH
        </div>
        <HealthBar value={station.health} />
      </div>

      {/* Sensor readings */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { l: 'TEMP',  v: r.temperature?.toFixed(1), u: '°C' },
          { l: 'PRESSURE', v: r.pressure?.toFixed(0), u: 'hPa' },
          { l: 'HUMIDITY', v: r.humidity?.toFixed(0), u: '%' },
        ].map(({ l, v, u }) => (
          <div key={l} className="text-center bg-white/40 dark:bg-atmo-mid/40 rounded-lg px-2 py-3 border border-atmo-border/30">
            <div className="text-2xs font-bold tracking-widest text-atmo-muted uppercase mb-1">{l}</div>
            <div className="text-base font-bold text-atmo-deep">{v ?? '—'}<span className="text-xs font-normal ml-0.5 text-atmo-muted">{u}</span></div>
          </div>
        ))}
      </div>

      {/* Last seen */}
      <div className="flex items-center gap-2 text-sm text-atmo-muted mt-2">
        <Clock className="w-4 h-4" />
        Last seen: <span className="text-atmo-deep font-semibold">{formatRelative(station.lastSeen)}</span>
      </div>

      {/* Active alerts */}
      {stationAnomalies.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-critical/5 border border-critical/20 rounded-lg group hover:bg-critical/10 transition-colors cursor-pointer" onClick={() => navigate(`/stations/${station.station_id}`)}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-critical" />
            <span className="text-sm text-critical font-bold">{stationAnomalies.length} active alert{stationAnomalies.length > 1 ? 's' : ''}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-critical/60 group-hover:text-critical transition-colors" />
        </div>
      )}

      {/* Open button */}
      <button
        onClick={() => navigate(`/stations/${station.station_id}`)}
        className="w-full btn-primary flex items-center justify-center gap-2 mt-auto py-2.5 font-bold tracking-wide"
      >
        OPEN STATION
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Need ChevronRight for the alert box
import { ChevronRight } from 'lucide-react';

export default function Stations() {
  const { state } = useApp();
  const { stations, currentReadings, anomalies, connectionStatus } = state;

  const activeCount   = stations.filter(s => s.status === 'healthy').length;
  const criticalCount = stations.filter(s => s.status !== 'healthy' && s.status !== 'monitoring').length;
  const avgHealth = stations.length > 0 ? Math.round(stations.reduce((s, st) => s + st.health, 0) / stations.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="animate-in-up flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-atmo-deep tracking-tight mb-1">Stations</h1>
          <p className="text-base text-atmo-muted">
            {stations.length} stations monitored · {activeCount} connected · nationwide telemetry
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass px-5 py-2 flex items-center gap-3">
            <Radio className="w-6 h-6 text-teal opacity-80" />
            <div className="flex flex-col">
              <div className="text-[10px] font-bold tracking-widest uppercase text-atmo-deep/70 mb-0.5">NETWORK HEALTH</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-teal leading-none">{avgHealth}%</span>
                <span className="text-xs font-semibold text-atmo-muted">{activeCount} nominal · {criticalCount} critical</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-atmo-muted" />
            <input 
              type="text" 
              placeholder="Search stations" 
              className="pl-9 pr-4 py-2 bg-white dark:bg-atmo-surface border border-atmo-border/60 rounded-full text-sm outline-none focus:border-teal/50 shadow-sm w-48"
            />
          </div>
          
          <select className="px-4 py-2 bg-white dark:bg-atmo-surface border border-atmo-border/60 rounded-full text-sm font-medium outline-none focus:border-teal/50 shadow-sm">
            <option>All Status</option>
            <option>Nominal</option>
            <option>Monitoring</option>
            <option>Critical</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-atmo-surface border border-atmo-border/60 rounded-full text-sm font-bold text-teal hover:bg-atmo-mid/50 transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Station cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Station Network Overview */}
      <div className="glass overflow-hidden animate-in-up stagger-3 flex flex-col lg:flex-row">
        <div className="lg:w-2/3 p-6 border-b lg:border-b-0 lg:border-r border-atmo-border/40 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-atmo-deep" />
            <h2 className="text-base font-bold tracking-widest text-atmo-deep uppercase">STATION NETWORK OVERVIEW</h2>
          </div>
          <p className="text-sm text-atmo-muted mb-4">Geographical distribution of monitoring stations</p>
          <div className="flex-1 w-full min-h-[350px] rounded-xl overflow-hidden border border-atmo-border/50 relative">
            <StationMap stations={stations} center={[22.5937, 78.9629]} zoom={4.5} className="w-full h-full" />
            
            <div className="absolute bottom-4 left-4 glass px-4 py-3 rounded-xl flex flex-col gap-2 shadow-glass-md z-[400]">
              <div className="flex items-center gap-2 text-xs font-semibold text-atmo-deep">
                <span className="w-2.5 h-2.5 rounded-full bg-mint" /> Nominal
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-atmo-deep">
                <span className="w-2.5 h-2.5 rounded-full bg-amber" /> Monitoring
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-atmo-deep">
                <span className="w-2.5 h-2.5 rounded-full bg-critical" /> Critical
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-atmo-muted pt-1 border-t border-atmo-border/50 mt-1">
                <span className="w-6 h-px border-t border-dashed border-teal/70" /> Network Link
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3 p-6 bg-atmo-mid/20 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-atmo-surface transition-colors">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-teal" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-atmo-deep">Data Freshness</div>
              <div className="text-2xl font-bold text-teal">98%</div>
            </div>
            <div className="w-32 text-xs text-atmo-muted text-right">All stations reporting within expected interval</div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-atmo-surface transition-colors">
            <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center flex-shrink-0">
              <Wifi className="w-6 h-6 text-mint" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-atmo-deep">WebSocket Status</div>
              <div className={`text-xl font-bold ${connectionStatus === 'CONNECTED' ? 'text-mint' : 'text-amber'}`}>
                {connectionStatus === 'CONNECTED' ? 'Live' : connectionStatus}
              </div>
            </div>
            <div className="w-32 text-xs text-atmo-muted text-right">Real-time data stream active</div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-atmo-surface transition-colors">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-6 h-6 text-teal" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-atmo-deep">ML Inference Engine</div>
              <div className="text-xl font-bold text-teal">Ready</div>
            </div>
            <div className="w-32 text-xs text-atmo-muted text-right">Anomaly detection operational</div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-atmo-surface transition-colors">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-teal" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-atmo-deep">Last Synchronization</div>
              <div className="text-xl font-bold text-teal">24 ms</div>
            </div>
            <div className="w-32 text-xs text-atmo-muted text-right">Network latency (across all stations)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
