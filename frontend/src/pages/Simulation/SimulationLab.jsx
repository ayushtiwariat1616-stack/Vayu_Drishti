import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Zap, Thermometer, Wifi, Droplets, Gauge, CheckCircle2,
  Radio, Server, Database, Cpu, MonitorSmartphone, ArrowDown,
  AlertTriangle, Play, RotateCcw,
} from 'lucide-react';

const SCENARIOS = [
  {
    key: 'TEMPERATURE_SPIKE',
    label: 'Temperature Spike',
    desc: 'Inject an abnormal temperature increase far above baseline',
    icon: Thermometer,
    color: '#c0392b',
    bg:   'bg-critical/5',
    border: 'border-critical/20',
    badgeClass: 'badge-high',
    severity: 'HIGH',
  },
  {
    key: 'FROZEN_SENSOR',
    label: 'Frozen Sensor',
    desc: 'Repeat the previous sensor value to simulate a stuck reading',
    icon: Gauge,
    color: '#c0392b',
    bg:   'bg-critical/5',
    border: 'border-critical/20',
    badgeClass: 'badge-high',
    severity: 'HIGH',
  },
  {
    key: 'HUMIDITY_SPIKE',
    label: 'Humidity Spike',
    desc: 'Inject abnormal humidity far above expected range',
    icon: Droplets,
    color: '#d97706',
    bg:   'bg-amber/5',
    border: 'border-amber/20',
    badgeClass: 'badge-medium',
    severity: 'MEDIUM',
  },
  {
    key: 'COMMUNICATION_FAILURE',
    label: 'Communication Failure',
    desc: 'Simulate missing telemetry transmissions from the station',
    icon: Wifi,
    color: '#5a9db5',
    bg:   'bg-sky/5',
    border: 'border-sky/20',
    badgeClass: 'badge-watch',
    severity: 'WATCH',
  },
  {
    key: 'NORMAL',
    label: 'Normal Readings',
    desc: 'Generate normal sensor readings within expected parameters',
    icon: CheckCircle2,
    color: '#4caf8a',
    bg:   'bg-mint/5',
    border: 'border-mint/20',
    badgeClass: 'badge-healthy',
    severity: null,
  },
];

const PIPELINE_STEPS = [
  { key: 'esp32',    label: 'ESP32 Sensor', sublabel: 'Hardware telemetry',    icon: Radio },
  { key: 'backend',  label: 'Backend API',  sublabel: 'Data ingestion',        icon: Server },
  { key: 'ml',       label: 'ML Engine',    sublabel: 'Anomaly detection',     icon: Cpu },
  { key: 'database', label: 'Database',     sublabel: 'Persistent storage',    icon: Database },
  { key: 'ws',       label: 'WebSocket',    sublabel: 'Real-time broadcast',   icon: Wifi },
  { key: 'vayu',     label: 'Vayu Drishti', sublabel: 'Frontend visualization',icon: MonitorSmartphone },
];

function PipelineStep({ step, state: stepState, isLast }) {
  const Icon = step.icon;
  return (
    <div className="flex flex-col items-center">
      <div className={`pipeline-node ${stepState}`}>
        <div className={`pipeline-node-dot w-14 h-14 ${
          stepState === 'active'  ? 'border-teal bg-teal/10' :
          stepState === 'success' ? 'border-mint bg-mint/10' :
          stepState === 'error'   ? 'border-critical bg-critical/10' : ''
        }`}>
          <Icon className={`w-6 h-6 ${
            stepState === 'active'  ? 'text-teal' :
            stepState === 'success' ? 'text-mint' :
            stepState === 'error'   ? 'text-critical' : 'text-atmo-border'
          }`} />
        </div>
        <div className="text-center mt-1.5">
          <div className={`text-xs font-semibold ${
            stepState === 'active'  ? 'text-teal' :
            stepState === 'success' ? 'text-mint' :
            stepState === 'error'   ? 'text-critical' : 'text-atmo-muted'
          }`}>{step.label}</div>
          <div className="text-2xs text-atmo-muted/60">{step.sublabel}</div>
        </div>
      </div>
      {!isLast && (
        <div className={`w-px flex-1 min-h-[28px] mt-1 transition-all duration-300 ${
          stepState === 'success' ? 'bg-mint/40' : 'bg-atmo-border/40'
        }`} />
      )}
    </div>
  );
}

export default function SimulationLab() {
  const { injectMockAnomaly } = useApp();
  const navigate = useNavigate();

  const [running, setRunning]             = useState(false);
  const [pipelineStates, setPipelineStates] = useState({});
  const [result, setResult]               = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [triggered, setTriggered]         = useState(false);

  const triggerScenario = useCallback(async (scenario) => {
    if (running) return;
    setRunning(true);
    setTriggered(true);
    setActiveScenario(scenario.key);
    setPipelineStates({});
    setResult(null);

    const steps = PIPELINE_STEPS.map(s => s.key);

    // Animate pipeline steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 420));
      setPipelineStates(prev => ({ ...prev, [steps[i]]: 'active' }));
      await new Promise(r => setTimeout(r, 380));
      setPipelineStates(prev => ({ ...prev, [steps[i]]: 'success' }));
    }

    // Inject anomaly after pipeline
    let anomalyId = null;
    if (scenario.key !== 'NORMAL') {
      await new Promise(r => setTimeout(r, 300));
      anomalyId = injectMockAnomaly(scenario.key);
    }

    setResult({ scenario, anomalyId });
    setRunning(false);
  }, [running, injectMockAnomaly]);

  const reset = () => {
    setPipelineStates({});
    setResult(null);
    setActiveScenario(null);
    setTriggered(false);
  };

  return (
    <div className="px-6 py-5 space-y-6">
      {/* Header */}
      <div className="animate-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-sky-deep flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Simulation Lab</h1>
            <p className="text-sm text-atmo-muted">Test the Vayu Drishti detection pipeline</p>
          </div>
        </div>
        <div className="mt-3 px-4 py-2.5 bg-atmo-mid/40 border border-atmo-border rounded-xl text-sm text-atmo-muted">
          Select a fault scenario to inject simulated sensor data through the full detection pipeline.
          The system will detect, analyze, and display the anomaly in real time.
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 animate-in-up stagger-1">
        {/* Scenarios */}
        <div className="col-span-3 space-y-3">
          <div className="label flex items-center gap-1.5 mb-3">
            <Play className="w-3.5 h-3.5 text-teal" /> FAULT SCENARIOS
          </div>
          {SCENARIOS.map((sc, i) => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.key;
            const isRunning = running && isActive;
            return (
              <div
                key={sc.key}
                className={`glass p-4 transition-all duration-300 border ${sc.border}
                  ${isActive ? 'shadow-glass-md ring-1 ring-teal/30' : ''}
                  stagger-${i + 1} animate-in-up`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
                    <Icon className="w-5 h-5" style={{ color: sc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-atmo-deep text-sm">{sc.label}</span>
                      {sc.severity && (
                        <span className={`badge ${sc.badgeClass}`}>{sc.severity}</span>
                      )}
                    </div>
                    <div className="text-xs text-atmo-muted mt-0.5">{sc.desc}</div>
                  </div>
                  <button
                    onClick={() => triggerScenario(sc)}
                    disabled={running}
                    className={`btn flex-shrink-0 flex items-center gap-2 px-4 py-2 ${
                      isRunning ? 'bg-teal/20 text-teal border border-teal/30' :
                      running ? 'opacity-40 cursor-not-allowed bg-atmo-mid text-atmo-muted' :
                      'btn-primary'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <span className="status-dot status-dot-live" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        TRIGGER
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline visualization + result */}
        <div className="col-span-2 space-y-4">
          <div className="label flex items-center gap-1.5 mb-3">
            <Radio className="w-3.5 h-3.5 text-teal" /> DETECTION PIPELINE
          </div>

          {/* Pipeline */}
          <div className="glass p-5">
            {!triggered ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-atmo-mid/60 flex items-center justify-center mb-3">
                  <Zap className="w-8 h-8 text-atmo-border" />
                </div>
                <div className="text-atmo-muted text-sm font-medium">Awaiting scenario trigger</div>
                <div className="text-atmo-muted/60 text-xs mt-1">Select a fault scenario and click TRIGGER</div>
              </div>
            ) : (
              <div className="flex flex-col">
                {PIPELINE_STEPS.map((step, i) => (
                  <PipelineStep
                    key={step.key}
                    step={step}
                    state={pipelineStates[step.key] ?? 'idle'}
                    isLast={i === PIPELINE_STEPS.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Result card */}
          {result && (
            <div className="glass p-4 border border-mint/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                <span className="label text-mint">SCENARIO COMPLETE</span>
              </div>
              <div className="text-sm font-semibold text-atmo-deep">{result.scenario.label}</div>
              {result.anomalyId ? (
                <>
                  <div className="text-xs text-atmo-muted mt-1 mb-3">
                    Anomaly detected and recorded by ML engine
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => navigate(`/anomalies/${result.anomalyId}`)}
                      className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      INVESTIGATE ANOMALY
                    </button>
                    <button
                      onClick={() => navigate('/anomalies')}
                      className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                    >
                      VIEW ALL ANOMALIES
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-xs text-mint mt-1">Normal readings — no anomaly detected ✓</div>
              )}
              <button onClick={reset} className="w-full btn-ghost text-xs mt-2 flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Judge journey guide */}
      <div className="glass p-5 animate-in-up stagger-6">
        <div className="label mb-3 flex items-center gap-1.5">
          <MonitorSmartphone className="w-3.5 h-3.5 text-teal" /> DEMONSTRATION GUIDE
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Trigger a fault', desc: 'Select Temperature Spike or Frozen Sensor and click TRIGGER' },
            { step: '2', label: 'Watch the pipeline', desc: 'Each stage lights up as the signal propagates through the system' },
            { step: '3', label: 'Investigate the anomaly', desc: 'Click INVESTIGATE to see the AI detection reasoning and corrected value' },
            { step: '4', label: 'Explore history', desc: 'Visit Historical Analysis to see how the station behaved over time' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="bg-atmo-mid/40 rounded-xl p-3">
              <div className="w-6 h-6 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold flex items-center justify-center mb-2">
                {step}
              </div>
              <div className="text-xs font-semibold text-atmo-deep mb-1">{label}</div>
              <div className="text-2xs text-atmo-muted leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
