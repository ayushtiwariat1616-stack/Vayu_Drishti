import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, AlertTriangle, Brain, Target, Thermometer, Droplets, Gauge, ChevronRight } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';
import TelemetryChart from '../../components/charts/TelemetryChart';
import { useState, useEffect } from 'react';

// Animated score arc
function ScoreArc({ score }) {
  const pct     = Math.round(score * 100);
  const radius  = 52;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ - (circ * pct) / 100;
  const color   = pct >= 75 ? '#c0392b' : pct >= 50 ? '#d97706' : '#5a9db5';
  const [anim, setAnim] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setAnim(offset), 100);
    return () => clearTimeout(t);
  }, [offset]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(42,122,123,0.1)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={anim}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular" style={{ color }}>{pct}%</span>
          <span className="text-2xs text-atmo-muted tracking-widest uppercase mt-1">Score</span>
        </div>
      </div>
    </div>
  );
}

// Detection layer bar
function DetectionBar({ label, value, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value * 100), delay + 200);
    return () => clearTimeout(t);
  }, [value, delay]);
  const color = value >= 0.75 ? '#c0392b' : value >= 0.5 ? '#d97706' : '#5a9db5';

  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-xs text-atmo-muted text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-atmo-mid rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${w}%`, background: color, transitionDelay: `${delay}ms` }}
        />
      </div>
      <span className="mono text-xs font-semibold w-10 text-right" style={{ color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

// Value transition visualization
function ValueTransition({ label, fromLabel, fromVal, toLabel, toVal, unit, delta, up }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4 text-center">
      <div className="label text-2xs">{label}</div>
      <div className="w-px h-12 bg-atmo-border relative flex flex-col items-center">
        <div className="absolute top-0 -translate-y-full pb-1 text-center">
          <div className="text-2xs text-atmo-muted mb-1 uppercase tracking-wider">{fromLabel}</div>
          <div className="text-2xl font-bold text-atmo-deep tabular">{fromVal}<span className="text-base font-normal ml-0.5 text-atmo-muted">{unit}</span></div>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2">
          <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${up ? 'text-critical bg-critical/10' : 'text-sky bg-sky/10'}`}>
            {up ? '+' : ''}{delta}{unit}
          </div>
        </div>
        <div className="absolute bottom-0 translate-y-full pt-1 text-center">
          <div className="text-2xs text-atmo-muted mb-1 uppercase tracking-wider">{toLabel}</div>
          <div className={`text-2xl font-bold tabular ${up ? 'text-critical' : 'text-mint'}`}>
            {toVal}<span className="text-base font-normal ml-0.5 text-atmo-muted">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const LAYER_LABELS = {
  ruleEngine:        'Rule Engine',
  temporalAnalysis:  'Temporal Analysis',
  multivariate:      'Multivariate',
  isolationForest:   'Isolation Forest',
};

export default function AnomalyDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const { anomalies, telemetry } = state;

  const anomaly = anomalies.find(a => a.id === id);

  if (!anomaly) {
    return (
      <div className="px-6 py-5">
        <Link to="/anomalies" className="btn-ghost text-sm flex items-center gap-2 mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Anomalies
        </Link>
        <div className="glass p-12 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-atmo-border" />
          <div className="text-atmo-deep font-semibold">Anomaly not found</div>
          <div className="text-atmo-muted text-sm mt-1">ID: {id}</div>
        </div>
      </div>
    );
  }

  const chartData = telemetry[anomaly.stationId] || [];
  const stationAnomalies = anomalies.filter(a => a.stationId === anomaly.stationId);

  const rawTemp    = anomaly.rawReading?.temperature;
  const corrTemp   = anomaly.correctedReading?.temperature;
  const normTemp   = anomaly.normalReading?.temperature;
  const tempDelta  = rawTemp != null && normTemp != null ? (rawTemp - normTemp).toFixed(1) : null;

  const ensembleScore = anomaly.score;
  const layers = Object.entries(anomaly.detectionLayers || {});

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Back + Header */}
      <div className="animate-in-up">
        <Link to="/anomalies" className="btn-ghost text-sm flex items-center gap-2 mb-4 w-fit -ml-1">
          <ArrowLeft className="w-4 h-4" /> ANOMALIES
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">
              {anomaly.type?.replace(/_/g, ' ')}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm text-atmo-muted">{anomaly.stationId}</span>
              <span className="text-atmo-border">·</span>
              <span className="mono text-sm text-atmo-muted">{formatTimestamp(anomaly.timestamp)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge text-sm px-3 py-1 ${
              anomaly.severity === 'HIGH' ? 'badge-high' :
              anomaly.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'
            }`}>
              <span className={`status-dot ${
                anomaly.severity === 'HIGH' ? 'status-dot-critical' :
                anomaly.severity === 'MEDIUM' ? 'status-dot-warning' : ''
              } mr-1`} />
              {anomaly.severity}
            </span>
            <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-lg border ${
              anomaly.status === 'active' ? 'text-critical border-critical/20 bg-critical/5' :
              anomaly.status === 'acknowledged' ? 'text-amber border-amber/20 bg-amber/5' :
              'text-mint border-mint/20 bg-mint/5'
            }`}>
              {anomaly.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 animate-in-up stagger-1">

        {/* Score arc */}
        <div className="glass p-5 flex flex-col items-center justify-center gap-2">
          <div className="label mb-2">ANOMALY SCORE</div>
          <ScoreArc score={anomaly.score} />
          <div className="text-center mt-1">
            <div className="text-xs text-atmo-muted">Confidence</div>
            <div className="mono font-semibold text-atmo-deep">{Math.round(anomaly.confidence * 100)}%</div>
          </div>
          <div className={`badge mt-1 ${
            anomaly.severity === 'HIGH' ? 'badge-high' :
            anomaly.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'
          }`}>{anomaly.severity}</div>
        </div>

        {/* What happened */}
        <div className="glass p-5">
          <div className="label mb-4 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-critical" /> WHAT HAPPENED
          </div>
          {rawTemp != null && normTemp != null ? (
            <div className="flex flex-col items-center gap-6 py-2">
              <div className="text-center">
                <div className="text-2xs text-atmo-muted uppercase tracking-wider mb-1">Normal</div>
                <div className="text-3xl font-bold text-mint tabular">{normTemp.toFixed(1)}°C</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-critical/30" />
                <div className="text-xs font-bold text-critical bg-critical/10 px-2 py-0.5 rounded">
                  +{tempDelta}°C
                </div>
                <div className="w-px h-8 bg-critical/30" />
              </div>
              <div className="text-center">
                <div className="text-2xs text-atmo-muted uppercase tracking-wider mb-1">Anomalous</div>
                <div className="text-3xl font-bold text-critical tabular">{rawTemp.toFixed(1)}°C</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-atmo-muted text-sm">No raw reading available</div>
          )}
        </div>

        {/* Root cause */}
        <div className="glass p-5">
          <div className="label mb-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber" /> ROOT CAUSE
          </div>
          <div className="space-y-2 mb-5">
            {anomaly.rootCauses?.map(rc => (
              <div key={rc} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber/8 border border-amber/20">
                <span className="status-dot bg-amber" />
                <span className="text-xs font-semibold text-amber-dark tracking-wide">{rc.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
          <div className="label mb-2">AFFECTED SENSORS</div>
          <div className="flex flex-wrap gap-1.5">
            {anomaly.affectedSensors?.map(s => (
              <span key={s} className="badge badge-medium">{s.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Detection layers + AI explanation */}
      <div className="grid grid-cols-2 gap-4 animate-in-up stagger-2">

        {/* Detection layers */}
        <div className="glass p-5">
          <div className="label mb-4 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-teal" /> DETECTION LAYERS
          </div>
          <div className="space-y-4">
            {layers.map(([key, val], i) => (
              <DetectionBar
                key={key}
                label={LAYER_LABELS[key] ?? key}
                value={val}
                delay={i * 120}
              />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-atmo-border">
            <div className="flex items-center justify-between">
              <span className="label">ENSEMBLE SCORE</span>
              <span className="mono font-bold text-lg"
                style={{ color: ensembleScore >= 0.75 ? '#c0392b' : ensembleScore >= 0.5 ? '#d97706' : '#5a9db5' }}>
                {Math.round(ensembleScore * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2.5 bg-atmo-mid rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.round(ensembleScore * 100)}%`,
                  background: ensembleScore >= 0.75 ? '#c0392b' : '#d97706',
                  transitionDelay: '800ms',
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="glass p-5">
          <div className="label mb-4 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-sky" /> AI EXPLANATION
          </div>
          <div className="text-sm text-atmo-deep leading-relaxed font-light">
            {anomaly.explanation}
          </div>

          {/* Raw reading summary */}
          {anomaly.rawReading && (
            <div className="mt-4 pt-4 border-t border-atmo-border">
              <div className="label mb-2">READING AT EVENT</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'TEMP', val: anomaly.rawReading.temperature?.toFixed(1), unit: '°C', icon: Thermometer },
                  { label: 'PRESS', val: anomaly.rawReading.pressure?.toFixed(0), unit: ' hPa', icon: Gauge },
                  { label: 'HUMID', val: anomaly.rawReading.humidity?.toFixed(0), unit: '%', icon: Droplets },
                ].map(({ label, val, unit, icon: Icon }) => (
                  <div key={label} className="bg-atmo-mid/40 rounded-lg px-3 py-2 text-center">
                    <div className="text-2xs text-atmo-muted mb-1">{label}</div>
                    <div className="mono text-sm font-semibold text-atmo-deep">{val}{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corrected value */}
      {anomaly.correctedReading && anomaly.rawReading && (
        <div className="glass p-5 animate-in-up stagger-3">
          <div className="label mb-4">CORRECTED ESTIMATE</div>
          <div className="flex items-stretch gap-8">
            {/* Raw */}
            <div className="flex-1 text-center px-4 py-3 bg-critical/5 border border-critical/15 rounded-xl">
              <div className="label text-2xs text-critical mb-2">RAW READING</div>
              <div className="text-4xl font-bold text-critical tabular">{anomaly.rawReading.temperature?.toFixed(1)}°C</div>
              <div className="text-2xs text-atmo-muted mt-1">Preserved · not replaced</div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-1 text-atmo-muted">
              <div className="w-16 h-px bg-atmo-border relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-atmo-border">▶</div>
              </div>
              <div className="text-2xs">estimated</div>
            </div>

            {/* Corrected */}
            <div className="flex-1 text-center px-4 py-3 bg-mint/5 border border-mint/20 rounded-xl">
              <div className="label text-2xs text-mint-dark mb-2">ESTIMATED VALUE</div>
              <div className="text-4xl font-bold text-mint-dark tabular">{anomaly.correctedReading.temperature?.toFixed(1)}°C</div>
              <div className="text-2xs text-atmo-muted mt-1">
                Confidence: <span className="font-semibold">{Math.round(anomaly.correctedReading.confidence * 100)}%</span>
              </div>
            </div>

            {/* Normal context */}
            {anomaly.normalReading?.temperature && (
              <>
                <div className="flex flex-col items-center justify-center gap-1 text-atmo-muted">
                  <div className="w-16 h-px bg-atmo-border relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-atmo-border">▶</div>
                  </div>
                  <div className="text-2xs">baseline</div>
                </div>
                <div className="flex-1 text-center px-4 py-3 bg-teal/5 border border-teal/20 rounded-xl">
                  <div className="label text-2xs text-teal mb-2">BASELINE</div>
                  <div className="text-4xl font-bold text-teal tabular">{anomaly.normalReading.temperature.toFixed(1)}°C</div>
                  <div className="text-2xs text-atmo-muted mt-1">30-min moving average</div>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 text-2xs text-atmo-muted italic">
            ⚠ The estimated value is a model prediction only. The original raw reading is preserved in the database and shown above.
          </div>
        </div>
      )}

      {/* Embedded telemetry chart */}
      <div className="animate-in-up stagger-4">
        <TelemetryChart
          data={chartData}
          anomalies={stationAnomalies}
          mode="historical"
          height={260}
          initialTimeframe="1H"
          showModeToggle={false}
          showTimeframePicker={true}
          allowMaximize={true}
          title={`TELEMETRY · ${anomaly.stationId}`}
        />
      </div>

      {/* Navigate to station */}
      <div className="flex justify-end animate-in-up stagger-5">
        <button
          onClick={() => navigate(`/stations/${anomaly.stationId}`)}
          className="btn-teal-outline flex items-center gap-2"
        >
          View Station {anomaly.stationId}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
