import { useState } from 'react';
import { useApp } from '../context/AppContext';
import TelemetryChart from '../components/charts/TelemetryChart';
import EventStream from '../components/ui/EventStream';
import { Activity, Radio, Maximize2 } from 'lucide-react';
import { formatRelative } from '../components/utils/time';

export default function LiveMonitor() {
  const { state } = useApp();
  const { stations, telemetry, anomalies, events, selectedStation, currentReadings } = state;

  const selected = stations.find(s => s.id === selectedStation) || stations[0];
  const data   = telemetry[selectedStation] || [];
  const cr     = currentReadings[selectedStation] || {};
  const stationAnomalies = anomalies.filter(a => a.stationId === selectedStation);

  return (
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
          </div>
        </div>
      </div>

      {/* Main chart + event stream */}
      <div className="grid grid-cols-4 gap-4 animate-in-up stagger-1">
        <div className="col-span-3">
          <TelemetryChart
            data={data}
            anomalies={stationAnomalies}
            mode="live"
            height={400}
            title="LIVE TELEMETRY"
            showModeToggle={true}
            showTimeframePicker={true}
            allowMaximize={true}
          />
        </div>
        <div className="col-span-1">
          <EventStream
            events={events.filter(e => e.stationId === selectedStation || !e.stationId)}
            maxItems={15}
            className="h-full min-h-[460px]"
          />
        </div>
      </div>

      {/* Anomaly markers table */}
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
                  Score: {a.score?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
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
        </div>
      </div>
    </div>
  );
}
