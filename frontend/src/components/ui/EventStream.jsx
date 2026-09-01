import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function EventIcon({ type }) {
  if (type === 'anomaly') return <AlertTriangle className="w-3.5 h-3.5 text-critical flex-shrink-0" />;
  if (type === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-mint flex-shrink-0" />;
}

function EventRow({ event, isNew }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (event.anomalyId) navigate(`/anomalies/${event.anomalyId}`);
  };

  return (
    <div
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
    </div>
  );
}

export default function EventStream({ events = [], maxItems = 12, className = '' }) {
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
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}
