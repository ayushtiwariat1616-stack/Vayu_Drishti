import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Brush,
} from 'recharts';
import {
  Maximize2, Minimize2, X, ZoomIn, ZoomOut, RotateCcw,
  AlertTriangle, TrendingUp, BarChart2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIMEFRAMES = [
  { label: '1m',   ms: 60_000 },
  { label: '5m',   ms: 300_000 },
  { label: '15m',  ms: 900_000 },
  { label: '30m',  ms: 1_800_000 },
  { label: '1H',   ms: 3_600_000 },
  { label: '6H',   ms: 21_600_000 },
  { label: '12H',  ms: 43_200_000 },
  { label: '1D',   ms: 86_400_000 },
  { label: '7D',   ms: 604_800_000 },
];

const SERIES_CONFIG = {
  temperature: { key: 'temperature', label: 'Temperature', unit: '°C', color: '#2a7a7b',  dot: '#2a7a7b' },
  pressure:    { key: 'pressure',    label: 'Pressure',    unit: ' hPa', color: '#5a9db5', dot: '#5a9db5' },
  humidity:    { key: 'humidity',    label: 'Humidity',    unit: '%',  color: '#4caf8a',  dot: '#4caf8a' },
  anomalyScore:{ key: 'anomalyScore',label: 'Anomaly Score', unit: '', color: '#d97706', dot: '#d97706' },
};

const MULTIVARIATE_SERIES = ['temperature', 'pressure', 'humidity'];

function formatTs(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatTsShort(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Custom tooltip
function ChartTooltip({ active, payload, label, anomalyMap }) {
  if (!active || !payload?.length) return null;
  const ts = label ? new Date(label) : null;
  const anomaly = anomalyMap[label];

  return (
    <div className="card p-3 min-w-[180px] text-xs">
      <div className="mono text-atmo-muted mb-2 text-2xs">
        {ts ? ts.toLocaleTimeString('en-IN', { hour12: false }) : ''}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-atmo-muted">{SERIES_CONFIG[p.dataKey]?.label ?? p.dataKey}</span>
          </div>
          <span className="font-semibold tabular text-atmo-deep">
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
            <span className="text-atmo-muted font-normal ml-0.5">
              {SERIES_CONFIG[p.dataKey]?.unit ?? ''}
            </span>
          </span>
        </div>
      ))}
      {anomaly && (
        <div className="mt-2 pt-2 border-t border-atmo-border">
          <div className="flex items-center gap-1.5 text-critical">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">{anomaly.type?.replace(/_/g, ' ')}</span>
          </div>
          <div className="text-atmo-muted mt-0.5">Score: {anomaly.score?.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

// Anomaly dot marker
function AnomalyDot({ cx, cy, anomaly, onClick }) {
  if (!cx || !cy) return null;
  return (
    <g className="cursor-pointer" onClick={() => onClick?.(anomaly.id)}>
      <circle cx={cx} cy={cy - 12} r={7} fill="#c0392b" opacity={0.9} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">!</text>
      <line x1={cx} y1={cy - 5} x2={cx} y2={cy} stroke="#c0392b" strokeWidth={1.5} strokeDasharray="3,2" />
    </g>
  );
}

export default function TelemetryChart({
  data = [],
  anomalies = [],
  mode = 'live',              // live | historical | multivariate | replay
  sensor = 'temperature',    // when mode != multivariate
  showOverlays = true,
  showTimeframePicker = true,
  showModeToggle = true,
  allowMaximize = true,
  height = 320,
  initialTimeframe = '15m',
  onAnomalyClick,
  className = '',
  title = 'LIVE TELEMETRY',
}) {
  const navigate = useNavigate();

  // Chart state
  const [chartMode, setChartMode]           = useState(mode);
  const [activeSensor, setActiveSensor]     = useState(sensor);
  const [activeTimeframe, setActiveTimeframe] = useState(initialTimeframe);
  const [isMaximized, setIsMaximized]       = useState(false);
  const [isLive, setIsLive]                 = useState(true);

  // Overlay toggles
  const [overlays, setOverlays] = useState({
    baseline:     false,
    anomalyScore: false,
    corrected:    false,
  });

  // Multivariate series toggles
  const [mvSeries, setMvSeries] = useState({
    temperature: true,
    pressure:    true,
    humidity:    true,
    anomalyScore: false,
  });

  // Zoom/pan state
  const [zoomLeft, setZoomLeft]   = useState(null);
  const [zoomRight, setZoomRight] = useState(null);
  const [refAreaLeft, setRefAreaLeft]   = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [isSelecting, setIsSelecting]   = useState(false);
  const chartRef = useRef(null);

  // Filter data to active timeframe
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const tf = TIMEFRAMES.find(t => t.label === activeTimeframe);
    if (!tf) return data;
    const cutoff = Date.now() - tf.ms;
    const filtered = data.filter(d => new Date(d.timestamp).getTime() > cutoff);
    return filtered.length > 0 ? filtered : data.slice(-50);
  }, [data, activeTimeframe]);

  // Apply zoom
  const displayData = useMemo(() => {
    if (!zoomLeft || !zoomRight) return filteredData;
    return filteredData.filter(d => {
      const ts = new Date(d.timestamp).getTime();
      return ts >= zoomLeft && ts <= zoomRight;
    });
  }, [filteredData, zoomLeft, zoomRight]);

  // Anomaly lookup by timestamp
  const anomalyMap = useMemo(() => {
    const map = {};
    anomalies.forEach(a => {
      // Find closest data point
      const ts = new Date(a.timestamp).getTime();
      let closest = null;
      let minDiff = Infinity;
      displayData.forEach(d => {
        const diff = Math.abs(new Date(d.timestamp).getTime() - ts);
        if (diff < minDiff) { minDiff = diff; closest = d.timestamp; }
      });
      if (closest && minDiff < 30000) map[closest] = a;
    });
    return map;
  }, [anomalies, displayData]);

  // Anomaly marker component for the chart
  const AnomalyDotRenderer = useCallback((props) => {
    const { cx, cy, payload } = props;
    const anomaly = anomalyMap[payload?.timestamp];
    if (!anomaly) return null;
    return (
      <AnomalyDot
        cx={cx} cy={cy}
        anomaly={anomaly}
        onClick={(id) => {
          onAnomalyClick?.(id);
          navigate(`/anomalies/${id}`);
        }}
      />
    );
  }, [anomalyMap, onAnomalyClick, navigate]);

  // Zoom handlers
  const handleMouseDown = (e) => {
    if (!e || !e.activeLabel) return;
    setIsSelecting(true);
    setRefAreaLeft(new Date(e.activeLabel).getTime());
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !e?.activeLabel) return;
    setRefAreaRight(new Date(e.activeLabel).getTime());
  };

  const handleMouseUp = () => {
    if (!isSelecting || refAreaLeft == null || refAreaRight == null) {
      setIsSelecting(false);
      return;
    }
    const [l, r] = refAreaLeft < refAreaRight
      ? [refAreaLeft, refAreaRight]
      : [refAreaRight, refAreaLeft];
    if (r - l > 5000) {
      setZoomLeft(l);
      setZoomRight(r);
      setIsLive(false);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  };

  const resetZoom = () => {
    setZoomLeft(null);
    setZoomRight(null);
    setIsLive(true);
  };

  // Compute Y-domain with padding
  const yDomain = useMemo(() => {
    if (!displayData.length) return ['auto', 'auto'];
    const key = chartMode === 'multivariate' ? null : activeSensor;
    if (!key) return ['auto', 'auto'];
    const vals = displayData.map(d => d[key]).filter(v => v != null);
    if (!vals.length) return ['auto', 'auto'];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.15 || 2;
    return [parseFloat((min - pad).toFixed(1)), parseFloat((max + pad).toFixed(1))];
  }, [displayData, chartMode, activeSensor]);

  const toggleOverlay = (key) => setOverlays(o => ({ ...o, [key]: !o[key] }));
  const toggleMvSeries = (key) => setMvSeries(s => ({ ...s, [key]: !s[key] }));

  // Build the main chart content
  const renderChart = (h = height) => (
    <div className={`relative ${isMaximized ? 'h-full' : ''}`} style={!isMaximized ? { height: h } : {}}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={displayData}
          margin={{ top: 16, right: 24, left: 0, bottom: 4 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={chartRef}
        >
          <defs>
            <linearGradient id="areaGrad-temp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2a7a7b" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#2a7a7b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGrad-pres" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#5a9db5" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#5a9db5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGrad-hum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4caf8a" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#4caf8a" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="rgba(42,122,123,0.08)" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTsShort}
            tick={{ fontSize: 10, fill: '#5c7a82', fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'rgba(42,122,123,0.15)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />

          {chartMode !== 'multivariate' ? (
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: '#5c7a82', fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={v => v.toFixed(1)}
            />
          ) : (
            <>
              <YAxis yAxisId="left"  tick={{ fontSize: 9, fill: '#5c7a82' }} axisLine={false} tickLine={false} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#5c7a82' }} axisLine={false} tickLine={false} width={40} />
            </>
          )}

          <Tooltip
            content={<ChartTooltip anomalyMap={anomalyMap} />}
            cursor={{ stroke: 'rgba(42,122,123,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />

          {/* Zoom selection area */}
          {refAreaLeft && refAreaRight && (
            <ReferenceArea
              x1={new Date(Math.min(refAreaLeft, refAreaRight)).toISOString()}
              x2={new Date(Math.max(refAreaLeft, refAreaRight)).toISOString()}
              fill="rgba(42,122,123,0.12)"
              stroke="rgba(42,122,123,0.4)"
            />
          )}

          {/* Anomaly reference lines */}
          {Object.entries(anomalyMap).map(([ts, anomaly]) => (
            <ReferenceLine
              key={ts}
              x={ts}
              stroke={anomaly.severity === 'HIGH' ? '#c0392b' : anomaly.severity === 'MEDIUM' ? '#d97706' : '#5a9db5'}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.6}
            />
          ))}

          {/* Main series */}
          {chartMode === 'multivariate' ? (
            <>
              {mvSeries.temperature && (
                <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#2a7a7b" strokeWidth={2}
                  fill="url(#areaGrad-temp)" dot={false} activeDot={{ r: 4, fill: '#2a7a7b' }}
                  animationDuration={400} isAnimationActive name="Temperature" />
              )}
              {mvSeries.pressure && (
                <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#5a9db5" strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3, fill: '#5a9db5' }}
                  animationDuration={400} strokeDasharray="6 3" name="Pressure" />
              )}
              {mvSeries.humidity && (
                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#4caf8a" strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3, fill: '#4caf8a' }}
                  animationDuration={400} strokeDasharray="3 2" name="Humidity" />
              )}
              {mvSeries.anomalyScore && (
                <Line yAxisId="right" type="monotone" dataKey="anomalyScore" stroke="#d97706" strokeWidth={1}
                  dot={false} animationDuration={400} name="Anomaly Score" />
              )}
            </>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey={activeSensor}
                stroke={SERIES_CONFIG[activeSensor]?.color ?? '#2a7a7b'}
                strokeWidth={2.2}
                fill={`url(#areaGrad-temp)`}
                dot={AnomalyDotRenderer}
                activeDot={{ r: 5 }}
                animationDuration={300}
                isAnimationActive
              />
              {overlays.anomalyScore && (
                <Line type="monotone" dataKey="anomalyScore"
                  stroke="#d97706" strokeWidth={1.2} dot={false}
                  strokeDasharray="4 3" animationDuration={300} />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const toolbarContent = (
    <div className="flex items-center flex-wrap gap-2 mb-3">
      {/* Chart mode */}
      {showModeToggle && (
        <div className="flex items-center gap-1 bg-atmo-mid rounded-lg p-0.5">
          {['temperature', 'pressure', 'humidity'].map(s => (
            <button
              key={s}
              onClick={() => { setChartMode('live'); setActiveSensor(s); }}
              className={`chart-mode-btn text-xs px-2.5 py-1 ${chartMode !== 'multivariate' && activeSensor === s ? 'active' : ''}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setChartMode('multivariate')}
            className={`chart-mode-btn text-xs px-2.5 py-1 flex items-center gap-1.5 ${chartMode === 'multivariate' ? 'active' : ''}`}
          >
            <BarChart2 className="w-3 h-3" /> Multi
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Timeframes */}
      {showTimeframePicker && (
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.label}
              onClick={() => { setActiveTimeframe(tf.label); setIsLive(true); resetZoom(); }}
              className={`tf-btn ${activeTimeframe === tf.label ? 'active' : ''}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      )}

      {/* Live indicator */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all
        ${isLive ? 'border-mint/30 bg-mint/10 text-mint' : 'border-atmo-border text-atmo-muted'}`}>
        <span className={`status-dot ${isLive ? 'status-dot-live' : 'status-dot-muted'}`} />
        LIVE
      </div>

      {/* Zoom controls */}
      {zoomLeft && (
        <button onClick={resetZoom} className="btn-ghost text-xs p-1.5" title="Reset Zoom">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Maximize */}
      {allowMaximize && (
        <button
          onClick={() => setIsMaximized(true)}
          className="btn-ghost p-1.5"
          title="Maximize"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  // Multivariate legend / series toggles
  const mvLegend = chartMode === 'multivariate' && (
    <div className="flex items-center gap-3 mt-2 flex-wrap">
      {Object.entries(SERIES_CONFIG).filter(([k]) => k !== 'anomalyScore' || true).map(([key, cfg]) => {
        if (!['temperature','pressure','humidity','anomalyScore'].includes(key)) return null;
        return (
          <button
            key={key}
            onClick={() => toggleMvSeries(key)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all border
              ${mvSeries[key]
                ? 'border-current opacity-100'
                : 'border-atmo-border opacity-40'}`}
            style={{ color: cfg.color }}
          >
            <span className="w-3 h-0.5 rounded" style={{ background: cfg.color }} />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Normal view */}
      <div className={`glass p-4 ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="label flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-teal" />
            {title}
          </div>
          <div className="text-2xs text-atmo-muted mono">
            {displayData.length} pts · drag to zoom
          </div>
        </div>

        {toolbarContent}
        {mvLegend}

        <div className="select-none" style={{ cursor: isSelecting ? 'col-resize' : 'crosshair' }}>
          {renderChart()}
        </div>
      </div>

      {/* Maximized overlay */}
      {isMaximized && (
        <div className="fixed inset-0 z-50 flex flex-col bg-atmo-surface/95 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="label flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-teal" />
              {title} — EXPANDED
            </div>
            <div className="flex items-center gap-2">
              {toolbarContent}
              <button
                onClick={() => setIsMaximized(false)}
                className="btn-ghost p-1.5 ml-2 border border-atmo-border rounded-lg"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {mvLegend && <div className="mb-3">{mvLegend}</div>}
          <div className="flex-1 select-none" style={{ cursor: 'crosshair' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={displayData}
                margin={{ top: 16, right: 32, left: 8, bottom: 8 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <defs>
                  <linearGradient id="areaGrad-temp-max" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2a7a7b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2a7a7b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(42,122,123,0.08)" />
                <XAxis dataKey="timestamp" tickFormatter={formatTs}
                  tick={{ fontSize: 11, fill: '#5c7a82', fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'rgba(42,122,123,0.15)' }} tickLine={false} />
                {chartMode !== 'multivariate' ? (
                  <YAxis domain={yDomain}
                    tick={{ fontSize: 11, fill: '#5c7a82', fontFamily: 'JetBrains Mono' }}
                    axisLine={false} tickLine={false} width={55} />
                ) : (
                  <>
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#5c7a82' }} axisLine={false} tickLine={false} width={45} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#5c7a82' }} axisLine={false} tickLine={false} width={45} />
                  </>
                )}
                <Tooltip content={<ChartTooltip anomalyMap={anomalyMap} />}
                  cursor={{ stroke: 'rgba(42,122,123,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                {Object.entries(anomalyMap).map(([ts, anomaly]) => (
                  <ReferenceLine key={ts} x={ts}
                    stroke={anomaly.severity === 'HIGH' ? '#c0392b' : '#d97706'}
                    strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
                ))}
                {refAreaLeft && refAreaRight && (
                  <ReferenceArea
                    x1={new Date(Math.min(refAreaLeft, refAreaRight)).toISOString()}
                    x2={new Date(Math.max(refAreaLeft, refAreaRight)).toISOString()}
                    fill="rgba(42,122,123,0.12)" stroke="rgba(42,122,123,0.4)" />
                )}
                {chartMode === 'multivariate' ? (
                  <>
                    {mvSeries.temperature && <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#2a7a7b" strokeWidth={2.5} fill="url(#areaGrad-temp-max)" dot={false} activeDot={{ r: 5 }} animationDuration={400} />}
                    {mvSeries.pressure    && <Line yAxisId="right" type="monotone" dataKey="pressure"    stroke="#5a9db5" strokeWidth={2}   dot={false} strokeDasharray="6 3" animationDuration={400} />}
                    {mvSeries.humidity    && <Line yAxisId="left"  type="monotone" dataKey="humidity"    stroke="#4caf8a" strokeWidth={2}   dot={false} strokeDasharray="3 2" animationDuration={400} />}
                    {mvSeries.anomalyScore && <Line yAxisId="right" type="monotone" dataKey="anomalyScore" stroke="#d97706" strokeWidth={1.5} dot={false} animationDuration={400} />}
                  </>
                ) : (
                  <Area type="monotone" dataKey={activeSensor}
                    stroke={SERIES_CONFIG[activeSensor]?.color ?? '#2a7a7b'}
                    strokeWidth={2.5} fill="url(#areaGrad-temp-max)"
                    dot={AnomalyDotRenderer} activeDot={{ r: 6 }} animationDuration={300} />
                )}
                <Brush dataKey="timestamp" height={24} stroke="rgba(42,122,123,0.2)"
                  fill="rgba(238,243,242,0.8)" travellerWidth={6}
                  tickFormatter={formatTsShort} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Esc key handler */}
      {isMaximized && (
        <KeyHandler key="esc" onKey="Escape" action={() => setIsMaximized(false)} />
      )}
    </>
  );
}

function KeyHandler({ onKey, action }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === onKey) action(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey, action]);
  return null;
}
