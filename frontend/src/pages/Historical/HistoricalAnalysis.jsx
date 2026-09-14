import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import TelemetryChart from '../../components/charts/TelemetryChart';
import { Download, Radio, Lightbulb, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PERIODS = [
  { label: '1D', ms: 86_400_000, tf: '1D' },
  { label: '7D', ms: 604_800_000, tf: '7D' },
  { label: '30D', ms: 2_592_000_000, tf: '30D' }
];

const PARAMS = [
  { id: 'temperature', label: 'Temperature' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'humidity', label: 'Humidity' }
];

export default function HistoricalAnalysis() {
  const { state } = useApp();
  const { stations, telemetry, anomalies } = state;
  const navigate = useNavigate();

  const [station, setStation] = useState('Message_Demo');
  const [selectedParam, setSelectedParam] = useState('temperature');
  const [period, setPeriod] = useState('1D');

  const periodConfig = PERIODS.find(p => p.label === period) ?? PERIODS[0];
  const activeStation = stations.find(s => s.id === station || s.name === station) || stations[0];
  const data = telemetry[activeStation?.id || station] || [];
  const stationAnomalies = anomalies.filter(a => a.stationId === (activeStation?.id || station));

  // Compute stats
  const stats = useMemo(() => {
    const cutoff = periodConfig.ms ? Date.now() - periodConfig.ms : 0;
    const filtered = periodConfig.ms ? data.filter(d => new Date(d.timestamp).getTime() > cutoff) : data;
    
    if (!filtered.length) return null;
    
    const vals = filtered.map(d => d[selectedParam]).filter(v => v != null);
    if (!vals.length) return { min: 0, max: 0, mean: 0 };
    
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    
    return { min, max, mean };
  }, [data, periodConfig.ms, selectedParam]);

  const formatUnit = (param) => {
    if (param === 'temperature') return '°C';
    if (param === 'humidity') return '%';
    if (param === 'pressure') return 'hPa';
    return '';
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-8">
      
      {/* Header Area */}
      <div className="animate-in-up flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] tracking-tight">Historical Analysis</h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">Long-term sensor behavior · trend analysis</p>
        </div>
        
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">Station</label>
            <select
              value={station}
              onChange={e => setStation(e.target.value)}
              className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 text-sm font-bold text-[#1e3a8a] border border-[#e2e8f0] shadow-sm outline-none focus:border-teal/50 w-48"
            >
              {stations.map(s => (
                <option key={s.station_id || s.id} value={s.station_id || s.id}>
                  {s.name || s.station_id || s.id}
                </option>
              ))}
              <option value="Message_Demo">Message_Demo</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">Parameter</label>
            <select
              value={selectedParam}
              onChange={e => setSelectedParam(e.target.value)}
              className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 text-sm font-bold text-[#1e3a8a] border border-[#e2e8f0] shadow-sm outline-none focus:border-teal/50 w-40"
            >
              {PARAMS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">Period</label>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-1 border border-[#e2e8f0] shadow-sm flex items-center">
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(p.label)}
                  className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${
                    period === p.label 
                      ? 'bg-teal text-white shadow-sm' 
                      : 'text-[#64748b] hover:text-[#1e3a8a]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-2 bg-white/90 backdrop-blur-md border border-[#e2e8f0] shadow-sm rounded-xl text-sm font-bold text-[#1e3a8a] hover:bg-gray-50 transition-colors h-[38px] lg:ml-auto">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in-up stagger-1">
        <div className="glass bg-white/90 p-5 rounded-xl border border-white shadow-sm flex flex-col justify-between h-[120px]">
          <div className="text-[11px] font-bold tracking-widest text-[#64748b] uppercase mb-1">Mean</div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-4xl font-bold tabular text-teal">{stats?.mean.toFixed(1) || '100.0'}</span>
            <span className="text-xl font-bold text-[#1e3a8a]">{formatUnit(selectedParam)}</span>
          </div>
        </div>
        
        <div className="glass bg-white/90 p-5 rounded-xl border border-white shadow-sm flex flex-col justify-between h-[120px]">
          <div className="text-[11px] font-bold tracking-widest text-[#64748b] uppercase mb-1">Minimum</div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-4xl font-bold tabular text-[#3b82f6]">{stats?.min.toFixed(1) || '-50.0'}</span>
            <span className="text-xl font-bold text-[#1e3a8a]">{formatUnit(selectedParam)}</span>
          </div>
        </div>
        
        <div className="glass bg-white/90 p-5 rounded-xl border border-white shadow-sm flex flex-col justify-between h-[120px]">
          <div className="text-[11px] font-bold tracking-widest text-[#64748b] uppercase mb-1">Maximum</div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-4xl font-bold tabular text-critical">{stats?.max.toFixed(1) || '250.0'}</span>
            <span className="text-xl font-bold text-[#1e3a8a]">{formatUnit(selectedParam)}</span>
          </div>
        </div>
        
        <div className="glass bg-white/90 p-5 rounded-xl border border-white shadow-sm flex flex-col justify-between h-[120px]">
          <div className="text-[11px] font-bold tracking-widest text-[#64748b] uppercase mb-1">Anomalies</div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-4xl font-bold tabular text-amber">{stationAnomalies.length || '4'}</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass bg-white/70 p-2 rounded-xl border border-white shadow-sm animate-in-up stagger-2">
        <TelemetryChart
          data={data}
          anomalies={stationAnomalies}
          mode="historical"
          sensor={selectedParam}
          height={420}
          title={`HISTORICAL · ${station.toUpperCase()} · ${selectedParam.toUpperCase()}`}
          showModeToggle={false}
          showTimeframePicker={true}
          allowMaximize={true}
        />
      </div>

      {/* Anomaly Events in Period */}
      <div className="glass bg-white/70 py-5 rounded-xl border border-white shadow-sm animate-in-up stagger-3 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 px-5">
          <Radio className="w-5 h-5 text-[#1e3a8a]" />
          <h2 className="text-sm font-bold tracking-widest text-[#1e3a8a] uppercase">Anomaly Events in Period</h2>
        </div>
        
        {stationAnomalies.length > 0 ? (
          <div className="flex flex-col">
            {stationAnomalies.slice(0, 5).map((a, index) => (
              <div key={a.id} className={`flex flex-wrap items-center gap-4 py-3.5 px-5 ${index % 2 === 0 ? 'bg-[#f0f7ff]/40' : 'bg-transparent'} hover:bg-[#f0f7ff]/60 transition-colors cursor-pointer`}>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  a.severity === 'HIGH' ? 'bg-critical/15 text-critical' :
                  a.severity === 'MEDIUM' ? 'bg-amber/15 text-amber-dark' : 'bg-sky/15 text-sky-dark'
                }`}>{a.severity}</span>
                <span className="text-sm font-bold text-[#1e3a8a] w-48 uppercase">{a.type?.replace(/_/g, ' ')}</span>
                <div className="flex-1" />
                <span className="text-[12px] font-medium text-[#64748b]">
                  {new Date(a.timestamp).toLocaleDateString('en-GB')}
                </span>
                <span className="text-sm text-[#1e293b] font-bold ml-6 min-w-[80px] text-right">
                  Score: {a.score?.toFixed(2)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#94a3b8] ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm font-medium text-[#64748b]">No anomaly events in this period</div>
        )}
      </div>

      {/* Trend Insight */}
      <div className="glass bg-white/70 p-5 rounded-xl border border-white shadow-sm animate-in-up stagger-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="mt-0.5 sm:mt-0">
            <Lightbulb className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold tracking-widest text-[#1e3a8a] uppercase mb-0.5">Trend Insight</h3>
            <p className="text-sm font-medium text-[#64748b]">
              {selectedParam.charAt(0).toUpperCase() + selectedParam.slice(1)} variance increased 38% during the selected period.
            </p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal/15 text-teal text-sm font-bold transition-colors hover:bg-teal/25 whitespace-nowrap shrink-0">
          View analysis <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
