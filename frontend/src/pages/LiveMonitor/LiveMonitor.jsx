import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TelemetryChart from '../../components/charts/TelemetryChart';
import LiveEventStream from '../../components/system/LiveEventStream';
<<<<<<< HEAD
import { Radio, BookOpen, MapPin, Bell } from 'lucide-react';
=======
import { Activity, Radio, Maximize2 } from 'lucide-react';
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
import { formatRelative } from '../../utils/formatters';

export default function LiveMonitor() {
  const { state } = useApp();
  const { stations, telemetry, anomalies, events, selectedStation, currentReadings } = state;

  const selected = stations.find(s => s.id === selectedStation) || stations[0];

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-atmo-muted">
        <div className="text-2xl font-bold mb-2 tracking-widest text-atmo-deep">
          AWAITING TELEMETRY
        </div>
        <p className="text-sm">
          Live Monitor standing by. Waiting for backend sync...
        </p>
      </div>
    );
  }

  const data   = telemetry[selectedStation] || [];
  const cr     = currentReadings[selectedStation] || {};
  const stationAnomalies = anomalies.filter(a => a.stationId === selectedStation);

  return (
<<<<<<< HEAD
    <div className="space-y-4 max-w-[1400px] mx-auto pb-8">
      {/* Header */}
      <div className="animate-in-up flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">Live Monitor</h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">Real-time sensor telemetry · {selected.name || selected.id}</p>
        </div>
        
        {/* Metric Cards */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Station */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 min-w-[140px] border border-[#e2e8f0] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1">STATION</div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selected.status === 'healthy' ? 'bg-mint' : selected.status === 'monitoring' ? 'bg-amber' : 'bg-critical'}`} />
              <span className="font-bold text-sm text-[#1e3a8a]">{selected.name || selected.id}</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 min-w-[120px] border border-[#e2e8f0] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1">STATUS</div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5 uppercase w-fit ${
                selected.status === 'healthy' ? 'bg-mint/15 text-mint-dark' :
                selected.status === 'monitoring' ? 'bg-amber/15 text-amber-dark' :
                'bg-critical/15 text-critical'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selected.status === 'healthy' ? 'bg-mint' : selected.status === 'monitoring' ? 'bg-amber' : 'bg-critical'}`} />
              {selected.status.toUpperCase()}
            </span>
          </div>

          {/* Temp */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 min-w-[120px] border border-[#e2e8f0] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1">TEMP</div>
            <div className="text-xl font-bold tabular text-[#1e3a8a]">{cr.temperature?.toFixed(1) ?? '—'}°C</div>
          </div>

          {/* Humidity */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 min-w-[120px] border border-[#e2e8f0] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1">HUMIDITY</div>
            <div className="text-xl font-bold tabular text-[#1e3a8a]">{cr.humidity?.toFixed(0) ?? '—'}%</div>
          </div>

          {/* Pressure */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 min-w-[120px] border border-[#e2e8f0] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1">PRESSURE</div>
            <div className="text-xl font-bold tabular text-[#1e3a8a]">{cr.pressure?.toFixed(0) ?? '—'} hPa</div>
=======
    <div className="px-6 py-5 space-y-4">
      {/* Header */}
      <div className="animate-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Live Monitor</h1>
          <p className="text-sm text-atmo-muted mt-0.5">Real-time sensor telemetry · {selected.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card-sm px-4 py-2">
            <div className="label text-2xs mb-1">STATION</div>
            <div className="flex items-center gap-1.5">
              <span className={`status-dot ${selected.status === 'healthy' ? 'status-dot-live' : 'status-dot-warning'}`} />
              <span className="font-semibold text-sm">{selected.id}</span>
            </div>
          </div>
          <div className="card-sm px-4 py-2">
            <div className="label text-2xs mb-1">STATUS</div>
            <span className={`badge ${selected.status === 'healthy' ? 'badge-healthy' : 'badge-medium'}`}>
              {selected.status.toUpperCase()}
            </span>
          </div>
          <div className="card-sm px-4 py-2">
            <div className="label text-2xs mb-1">TEMP</div>
            <div className="mono font-bold text-atmo-deep">{cr.temperature?.toFixed(1) ?? '—'}°C</div>
          </div>
          <div className="card-sm px-4 py-2">
            <div className="label text-2xs mb-1">HUMIDITY</div>
            <div className="mono font-bold text-atmo-deep">{cr.humidity?.toFixed(0) ?? '—'}%</div>
          </div>
          <div className="card-sm px-4 py-2">
            <div className="label text-2xs mb-1">PRESSURE</div>
            <div className="mono font-bold text-atmo-deep">{cr.pressure?.toFixed(0) ?? '—'} hPa</div>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
          </div>
        </div>
      </div>

      {/* Main chart + event stream */}
<<<<<<< HEAD
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-in-up stagger-1">
        <div className="xl:col-span-2">
=======
      <div className="grid grid-cols-4 gap-4 animate-in-up stagger-1">
        <div className="col-span-3">
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
          <TelemetryChart
            data={data}
            anomalies={stationAnomalies}
            mode="live"
<<<<<<< HEAD
            height={460}
=======
            height={400}
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
            title="LIVE TELEMETRY"
            showModeToggle={true}
            showTimeframePicker={true}
            allowMaximize={true}
          />
        </div>
<<<<<<< HEAD
        
        <div className="xl:col-span-1 glass bg-white/70 p-5 rounded-xl flex flex-col h-full border border-white">
          <LiveEventStream
            events={events.filter(e => e.stationId === selectedStation || !e.stationId)}
            maxItems={15}
            className="flex-1"
=======
        <div className="col-span-1">
          <LiveEventStream
            events={events.filter(e => e.stationId === selectedStation || !e.stationId)}
            maxItems={15}
            className="h-full min-h-[460px]"
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
          />
        </div>
      </div>

      {/* Anomaly markers table */}
<<<<<<< HEAD
      <div className="glass bg-white/70 py-5 rounded-xl border border-white animate-in-up stagger-2 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 px-5">
          <Radio className="w-5 h-5 text-[#1e3a8a]" />
          <h2 className="text-sm font-bold tracking-widest text-[#1e3a8a] uppercase">Anomaly Events on Chart</h2>
        </div>
        
        {stationAnomalies.length > 0 ? (
          <div className="flex flex-col">
            {stationAnomalies.slice(0, 5).map((a, index) => (
              <div key={a.id} className={`flex flex-wrap items-center gap-4 py-3.5 px-5 ${index % 2 === 0 ? 'bg-[#f0f7ff]/40' : 'bg-transparent'}`}>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  a.severity === 'HIGH' ? 'bg-critical/15 text-critical' :
                  a.severity === 'MEDIUM' ? 'bg-amber/15 text-amber-dark' : 'bg-sky/15 text-sky-dark'
                }`}>{a.severity}</span>
                <span className="text-sm font-bold text-[#1e3a8a] w-48 uppercase">{a.type?.replace(/_/g, ' ')}</span>
                <div className="flex-1" />
                <span className="text-[11px] font-medium text-[#64748b]">{formatRelative(a.timestamp)}</span>
                <span className="text-sm text-[#1e293b] font-bold ml-6 min-w-[100px] text-right">
=======
      {stationAnomalies.length > 0 && (
        <div className="glass p-4 animate-in-up stagger-2">
          <div className="label mb-3 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-critical" /> ANOMALY EVENTS ON CHART
          </div>
          <div className="divide-y divide-atmo-border/40">
            {stationAnomalies.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-4 py-2.5">
                <span className={`badge ${
                  a.severity === 'HIGH' ? 'badge-high' :
                  a.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'
                }`}>{a.severity}</span>
                <span className="text-sm font-medium">{a.type?.replace(/_/g, ' ')}</span>
                <span className="mono text-2xs text-atmo-muted ml-auto">{formatRelative(a.timestamp)}</span>
                <span className="mono text-xs text-atmo-deep font-semibold">
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                  Score: {a.score?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
<<<<<<< HEAD
        ) : (
          <div className="text-center py-6 text-sm font-medium text-[#64748b]">No anomaly events on chart</div>
        )}
      </div>

      {/* Chart Guide */}
      <div className="glass bg-white/70 p-5 rounded-xl border border-white animate-in-up stagger-3 flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12 text-[#1e3a8a]">
        <div className="flex items-center gap-2 shrink-0 border-r border-[#e2e8f0] pr-6 md:pr-10">
          <BookOpen className="w-5 h-5 text-[#1e3a8a]" />
          <span className="text-sm font-bold tracking-widest uppercase">Chart Guide</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 md:gap-8 lg:gap-12 flex-1 justify-center md:justify-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Temperature (°C)
            </div>
            <span className="text-[10px] font-medium text-[#64748b] ml-4.5">Left axis</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Pressure (hPa)
            </div>
            <span className="text-[10px] font-medium text-[#64748b] ml-4.5">Right axis</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-dark" /> Humidity (%)
            </div>
            <span className="text-[10px] font-medium text-[#64748b] ml-4.5">Right axis</span>
          </div>

          <div className="h-8 w-px bg-atmo-border/40 hidden md:block" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
              <span className="w-[3px] h-3 bg-[#cbd5e1] border-l border-dashed border-[#94a3b8]" /> Latest reading
            </div>
            <span className="text-[10px] font-medium text-[#64748b] ml-3">Vertical marker</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
              <span className="w-2.5 h-2.5 rounded-full border border-[#94a3b8] bg-transparent" /> Data point
            </div>
            <span className="text-[10px] font-medium text-[#64748b] ml-4.5">Hover for details</span>
          </div>
=======
        </div>
      )}

      {/* Overlay toggles info */}
      <div className="glass p-4 animate-in-up stagger-3">
        <div className="label mb-2">CHART GUIDE</div>
        <div className="flex flex-wrap gap-4 text-xs text-atmo-muted">
          <span>🖱 <strong>Drag</strong> on chart to zoom into a window</span>
          <span>🔄 Click <strong>↺ reset</strong> to restore full view</span>
          <span>🔴 <strong>Red markers</strong> indicate anomaly events — click to investigate</span>
          <span>⛶ <strong>Maximize</strong> for fullscreen chart with brush navigator</span>
          <span>📊 Use <strong>Multi</strong> mode to see all sensors simultaneously</span>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
        </div>
      </div>
    </div>
  );
}
