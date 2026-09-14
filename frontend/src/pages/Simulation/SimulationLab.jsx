import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import {
<<<<<<< HEAD
  Zap, Info, Thermometer, Gauge, Droplets, Wifi, CheckCircle2,
  Database, FileText, Cpu, BarChart2, Radio, Play, AlertTriangle
} from 'lucide-react';

=======
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
    color: 'rgb(var(--color-critical))',
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
    color: 'rgb(var(--color-critical))',
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
    color: 'rgb(var(--color-amber))',
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
    color: 'rgb(var(--color-sky))',
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
    color: 'rgb(var(--color-mint))',
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

>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
export default function SimulationLab() {
  const { state } = useApp();
  const navigate = useNavigate();

<<<<<<< HEAD
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runScenario = useCallback(async (type) => {
    if (running) return;
    setRunning(true);
    setResult(null);

    let payload = {
      station: state.selectedStation || "Demo_Station_1",
      temperature: 25.0,
      humidity: 60.0,
      pressure: 1012.0
    };

    if (type === 'temp_spike') {
      payload.temperature = 55.0;
    } else if (type === 'humidity_spike') {
      payload.humidity = 98.0;
    } else if (type === 'frozen') {
      // Just send the same data
    } else if (type === 'comms_failure') {
      // simulate delay/failure
    }

    try {
      if (type !== 'comms_failure') {
        await apiClient.post('/telemetry/', payload);
      }
      
      // Simulate pipeline processing time
      await new Promise(r => setTimeout(r, 1500));
      
      const isAnomaly = type === 'temp_spike' || type === 'humidity_spike';
      
      setResult({ 
        success: true, 
        anomalyDetected: isAnomaly,
        type: type,
        message: isAnomaly ? 'Anomaly detected by ML Inference engine' : 'Telemetry processed normally'
      });
    } catch (e) {
      console.error("Failed to trigger scenario:", e);
      setResult({ success: false, message: 'Pipeline execution failed' });
    }

    setRunning(false);
  }, [running, state.selectedStation]);

  const PipelineNode = ({ icon: Icon, label, time, active }) => (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${
        active 
          ? 'border-teal bg-teal text-white shadow-lg shadow-teal/30 scale-110' 
          : 'border-[#dbeafe] bg-white text-[#1e3a8a]'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col items-center">
         <span className={`text-xs font-semibold ${active ? 'text-teal' : 'text-[#1e3a8a]'}`}>{label}</span>
         <span className={`text-[10px] font-medium ${active ? 'text-teal' : 'text-[#94a3b8]'}`}>{time}</span>
      </div>
    </div>
  );

  const PipelineArrow = ({ active }) => (
    <div className="flex items-center flex-1 min-w-[20px] max-w-[50px] mx-1 mt-6">
      <div className={`h-px w-full transition-colors ${active ? 'bg-teal' : 'bg-teal/60'}`} />
      <div className={`w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] transition-colors ${
        active ? 'border-l-teal' : 'border-l-teal/60'
      }`} />
    </div>
  );

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in-up">
         <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center text-white shadow-lg">
           <Zap className="w-6 h-6 fill-current" />
         </div>
         <div>
           <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Simulation Lab</h1>
           <p className="text-sm font-medium text-atmo-muted mt-0.5">Test the Vayu Drishti detection pipeline</p>
         </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 bg-[#f0f7ff]/80 backdrop-blur-md border border-[#dbeafe] rounded-xl p-4 animate-in-up stagger-1">
        <Info className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-[#1e3a8a]">Select a fault scenario to inject simulated sensor data through the full detection pipeline. The system will detect, analyze, and display the anomaly in real time.</p>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in-up stagger-2">
        
        {/* Left Col: FAULT SCENARIOS */}
        <div className="glass p-5 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Fault Scenarios</h2>
          </div>

          {/* Row 1: Temperature Spike */}
          <div className="flex items-center justify-between p-3.5 bg-white/60 border border-critical/30 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-critical/10 flex items-center justify-center text-critical shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-atmo-deep">Temperature Spike</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-critical/10 text-critical border border-critical/20">HIGH</span>
                </div>
                <div className="text-[11px] font-medium text-atmo-muted mt-1">Inject an abnormal temperature increase far above baseline</div>
              </div>
            </div>
            <button disabled={running} onClick={() => runScenario('temp_spike')} className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-full transition-colors shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> TRIGGER
            </button>
          </div>

          {/* Row 2: Frozen Sensor */}
          <div className="flex items-center justify-between p-3.5 bg-white/60 border border-critical/30 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-critical/10 flex items-center justify-center text-critical shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-atmo-deep">Frozen Sensor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-critical/10 text-critical border border-critical/20">HIGH</span>
                </div>
                <div className="text-[11px] font-medium text-atmo-muted mt-1">Repeat the previous sensor value to simulate a stuck reading</div>
              </div>
            </div>
            <button disabled={running} onClick={() => runScenario('frozen')} className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-full transition-colors shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> TRIGGER
            </button>
          </div>

          {/* Row 3: Humidity Spike */}
          <div className="flex items-center justify-between p-3.5 bg-white/60 border border-amber/30 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-amber shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-atmo-deep">Humidity Spike</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber/10 text-amber border border-amber/20">MEDIUM</span>
                </div>
                <div className="text-[11px] font-medium text-atmo-muted mt-1">Inject abnormal humidity far above expected range</div>
              </div>
            </div>
            <button disabled={running} onClick={() => runScenario('humidity_spike')} className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-full transition-colors shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> TRIGGER
            </button>
          </div>

          {/* Row 4: Communication Failure */}
          <div className="flex items-center justify-between p-3.5 bg-white/60 border border-[#3b82f6]/30 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-atmo-deep">Communication Failure</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">WATCH</span>
                </div>
                <div className="text-[11px] font-medium text-atmo-muted mt-1">Simulate missing telemetry transmissions from the station</div>
              </div>
            </div>
            <button disabled={running} onClick={() => runScenario('comms_failure')} className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-full transition-colors shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> TRIGGER
            </button>
          </div>

          {/* Row 5: Normal Readings */}
          <div className="flex items-center justify-between p-3.5 bg-white/60 border border-mint/30 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint-dark shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-atmo-deep">Normal Readings</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint/10 text-mint-dark border border-mint/20">NORMAL</span>
                </div>
                <div className="text-[11px] font-medium text-atmo-muted mt-1">Generate normal sensor readings within expected parameters</div>
              </div>
            </div>
            <button disabled={running} onClick={() => runScenario('normal')} className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-full transition-colors shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> TRIGGER
            </button>
          </div>
        </div>

        {/* Right Col: DETECTION PIPELINE */}
        <div className="glass p-6 rounded-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-10">
            <Radio className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-bold tracking-widest text-atmo-deep uppercase">Detection Pipeline</h2>
          </div>
          
          {/* Pipeline Diagram */}
          <div className="flex items-start px-2 mb-12">
            <PipelineNode icon={Database} label="Ingestion" time={running || result ? '12 ms' : '— ms'} active={running || result} />
            <PipelineArrow active={running || result} />
            <PipelineNode icon={FileText} label="Validation" time={running || result ? '4 ms' : '— ms'} active={running || result} />
            <PipelineArrow active={running || result} />
            <PipelineNode icon={Cpu} label="ML Inference" time={running || result ? '45 ms' : '— ms'} active={running || result} />
            <PipelineArrow active={running || result} />
            <PipelineNode icon={BarChart2} label="Classification" time={running || result ? '8 ms' : '— ms'} active={running || result} />
            <PipelineArrow active={running || result} />
            <PipelineNode icon={Radio} label="Broadcast" time={running || result ? '2 ms' : '— ms'} active={running || result} />
          </div>

          {/* Awaiting Trigger / Result state */}
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-4">
            {running ? (
              <>
                <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center text-teal mb-4 animate-pulse">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#1e293b]">Processing Simulation</h3>
                <p className="text-sm font-medium text-[#64748b]">Running data through the ML pipeline...</p>
              </>
            ) : result ? (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  result.anomalyDetected ? 'bg-critical/10 text-critical' : 'bg-mint/10 text-mint-dark'
                }`}>
                  {result.anomalyDetected ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                </div>
                <h3 className={`text-base font-bold ${result.anomalyDetected ? 'text-critical' : 'text-mint-dark'}`}>
                  {result.message}
                </h3>
                <button 
                  onClick={() => setResult(null)}
                  className="mt-4 px-6 py-2 border-2 border-[#e2e8f0] text-sm font-bold text-[#64748b] rounded-full hover:bg-white transition-colors"
                >
                  Reset Pipeline
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#f0f9ff] flex items-center justify-center text-[#7dd3fc] mb-4">
                  <Zap className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-base font-bold text-[#1e293b]">Awaiting scenario trigger</h3>
                <p className="text-sm font-medium text-[#64748b]">Select a fault scenario and click TRIGGER</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: DEMONSTRATION GUIDE */}
      <div className="glass p-5 rounded-xl animate-in-up stagger-3">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[#1e293b]" />
          <h2 className="text-sm font-bold tracking-widest text-[#1e293b] uppercase">Demonstration Guide</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 border border-[#e2e8f0] bg-white/50 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
             <div>
               <div className="text-sm font-bold text-[#1e293b]">Trigger a fault</div>
               <div className="text-[11px] font-medium text-[#64748b] mt-1">Select a fault scenario and click TRIGGER</div>
             </div>
          </div>
          
          <div className="p-4 border border-[#e2e8f0] bg-white/50 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
             <div>
               <div className="text-sm font-bold text-[#1e293b]">Watch the pipeline</div>
               <div className="text-[11px] font-medium text-[#64748b] mt-1">Each stage lights up as the signal propagates</div>
             </div>
          </div>

          <div className="p-4 border border-[#e2e8f0] bg-white/50 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
             <div>
               <div className="text-sm font-bold text-[#1e293b]">Investigate the anomaly</div>
               <div className="text-[11px] font-medium text-[#64748b] mt-1">Click INVESTIGATE to see the AI detection reasoning</div>
             </div>
          </div>

          <div className="p-4 border border-[#e2e8f0] bg-white/50 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
             <div>
               <div className="text-sm font-bold text-[#1e293b]">Explore history</div>
               <div className="text-[11px] font-medium text-[#64748b] mt-1">Visit Historical Analysis to see how the station behaved over time</div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-6 pt-4 pb-2 animate-in-up stagger-4">
         <div className="flex items-center gap-1.5 text-xs font-bold text-teal">
           <span className="w-2 h-2 rounded-full bg-teal" /> Backend Ready
         </div>
         <div className="w-px h-3 bg-[#cbd5e1]" />
         <div className="flex items-center gap-1.5 text-xs font-bold text-teal">
           <span className="w-2 h-2 rounded-full bg-teal" /> ML Engine Ready
         </div>
         <div className="w-px h-3 bg-[#cbd5e1]" />
         <div className="flex items-center gap-1.5 text-xs font-bold text-teal">
           <span className="w-2 h-2 rounded-full bg-teal" /> WebSocket Live
         </div>
      </div>
=======
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
    let temperature = 25.0;
    let humidity = 60.0;
    let pressure = 1012.0;

    if (scenario.key === 'TEMPERATURE_SPIKE') temperature = 250.0;
    if (scenario.key === 'HUMIDITY_SPIKE') humidity = 105.0;
    if (scenario.key === 'FROZEN_SENSOR') temperature = -50.0;
    if (scenario.key === 'COMMUNICATION_FAILURE') {
      temperature = 0.0;
      humidity = 0.0;
      pressure = 0.0;
    }

    try {
      // POST real data to the backend ML pipeline!
      await apiClient.post('/telemetry/', {
        station: state.selectedStation || "Demo_Station_1",
        temperature,
        humidity,
        pressure
      });
      
      // Since it's a real WebSocket event, we'll wait a bit for it to arrive
      if (scenario.key !== 'NORMAL') {
        await new Promise(r => setTimeout(r, 600));
        // Find the newest anomaly for this station as our result
        const recentAnomaly = state.anomalies.find(a => a.stationId === state.selectedStation);
        if (recentAnomaly) {
          anomalyId = recentAnomaly.id;
        }
      }
    } catch (e) {
      console.error("Failed to trigger ML pipeline:", e);
    }

    setResult({ scenario, anomalyId });
    setRunning(false);
  }, [running, state.selectedStation, state.anomalies]);

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
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </div>
  );
}
