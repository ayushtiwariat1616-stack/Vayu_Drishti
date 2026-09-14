import { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelative } from '../../utils/formatters';
=======
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function EventIcon({ type }) {
  if (type === 'anomaly') return <AlertTriangle className="w-3.5 h-3.5 text-critical flex-shrink-0" />;
  if (type === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-mint flex-shrink-0" />;
}
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22

function EventRow({ event, isNew }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (event.anomalyId) navigate(`/anomalies/${event.anomalyId}`);
  };

  return (
    <div
<<<<<<< HEAD
      className={`flex items-start gap-4 py-3.5 px-2 transition-all duration-300 group
        ${isNew ? 'animate-slide-right' : ''}
        ${event.anomalyId ? 'cursor-pointer hover:bg-[#f0f7ff]/40 rounded-lg' : ''}`}
      onClick={handleClick}
    >
      <div className="mt-0.5 shrink-0">
        {event.type === 'anomaly' ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-critical/15 text-critical">HIGH</span>
        ) : event.type === 'warning' ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber/15 text-amber-dark">MED</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky/15 text-sky-dark">INFO</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex items-center">
        <div className="text-sm font-bold text-[#1e3a8a] leading-tight truncate">
          {event.text}
        </div>
      </div>
      <span className="text-[11px] font-medium text-[#64748b] whitespace-nowrap mt-0.5 shrink-0">
        {formatRelative(event.ts)}
      </span>
=======
      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 group
        ${isNew ? 'animate-slide-right' : ''}
        ${event.anomalyId ? 'cursor-pointer hover:bg-critical/5' : ''}
        ${event.type === 'anomaly' ? 'bg-critical/5 border border-critical/10' :
          event.type === 'warning' ? 'bg-amber/5' : ''}`}
      onClick={handleClick}
    >
      <EventIcon type={event.type} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium leading-tight truncate
          ${event.type === 'anomaly' ? 'text-critical' :
            event.type === 'warning' ? 'text-amber' : 'text-atmo-deep'}`}>
          {event.text}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="mono text-2xs text-atmo-muted">
            {new Date(event.ts).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          {event.stationId && (
            <span className="text-2xs text-atmo-muted">{event.stationId}</span>
          )}
        </div>
      </div>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </div>
  );
}

<<<<<<< HEAD
export default function LiveEventStream({ events = [], maxItems = 12, className = '' }) {
=======
export default function LiveLiveEventStream({ events = [], maxItems = 12, className = '' }) {
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
  const [prevLength, setPrevLength] = useState(events.length);
  const [newIds, setNewIds] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    if (events.length > prevLength) {
      const ids = new Set(events.slice(0, events.length - prevLength).map(e => e.id));
      setNewIds(ids);
      setTimeout(() => setNewIds(new Set()), 600);
    }
    setPrevLength(events.length);
  }, [events.length]);

  const displayed = events.slice(0, maxItems);

  return (
<<<<<<< HEAD
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1e3a8a]" />
          <h2 className="text-sm font-bold tracking-widest text-[#1e3a8a] uppercase">Live Events</h2>
        </div>
        <div className="px-2 py-1 rounded-full bg-mint/15 text-mint-dark text-[10px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          {events.length} recent
        </div>
      </div>
      <div ref={containerRef} className="space-y-0.5 overflow-hidden">
        {displayed.map((event, index) => (
          <div key={event.id}>
            <EventRow event={event} isNew={newIds.has(event.id)} />
            {index < displayed.length - 1 && <div className="h-px w-full bg-[#e2e8f0]/60 mx-2" />}
          </div>
        ))}
        {displayed.length === 0 && (
          <div className="text-center py-6 text-[#64748b] text-sm font-medium">
=======
    <div className={`glass p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="label flex items-center gap-1.5">
          <span className="status-dot status-dot-live" />
          LIVE EVENTS
        </div>
        <span className="text-2xs text-atmo-muted">{events.length} total</span>
      </div>
      <div ref={containerRef} className="space-y-1 overflow-hidden">
        {displayed.map(event => (
          <EventRow key={event.id} event={event} isNew={newIds.has(event.id)} />
        ))}
        {displayed.length === 0 && (
          <div className="text-center py-6 text-atmo-muted text-xs">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-mint/50" />
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}
