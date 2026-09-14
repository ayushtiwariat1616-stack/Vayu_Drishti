import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelative } from '../../utils/formatters';

function EventRow({ event, isNew }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (event.anomalyId) navigate(`/anomalies/${event.anomalyId}`);
  };

  return (
    <div
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
    </div>
  );
}

export default function LiveEventStream({ events = [], maxItems = 12, className = '' }) {
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
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}
