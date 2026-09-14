import { useState, useRef, useEffect } from 'react';
import { Activity, Server, Cpu, Database, Wifi, WifiOff, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SystemStatusDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useApp();
  const drawerRef = useRef(null);

  const wsOk = state.connectionStatus === 'CONNECTED';
  // Mock backend, db, ml status to true for now as it was in the original sidebar
  // if actual status is in state, it should be used instead
  const systemOk = [true, true, true, wsOk]; // backend, ml, db, ws
  
  const statusItems = [
    { key: 'backend',   label: 'Backend',   icon: Server },
    { key: 'ml',        label: 'ML Engine', icon: Cpu },
    { key: 'database',  label: 'Database',  icon: Database },
    { key: 'websocket', label: 'WebSocket', icon: Wifi },
  ];

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 p-2 rounded-full glass hover:bg-atmo-mid transition-all shadow-glass group"
        aria-label="Toggle System Status"
      >
        <div className={`status-dot ${wsOk ? 'status-dot-live' : 'status-dot-critical'}`} />
        <Activity size={18} className="text-atmo-muted group-hover:text-atmo-deep hidden md:block" />
        <span className="text-xs font-medium hidden md:block text-atmo-deep pr-1">System Status</span>
      </button>

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed bottom-16 left-4 z-50 w-64 glass rounded-xl overflow-hidden shadow-glass-md transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-atmo-border/60 bg-atmo-surface/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-atmo-deep uppercase tracking-wide">
            <Activity size={16} className="text-teal" />
            System Status
          </div>
          <button onClick={() => setIsOpen(false)} className="text-atmo-muted hover:text-atmo-deep">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 space-y-3 bg-atmo-surface/80 backdrop-blur-md">
          {statusItems.map(({ key, label, icon: Icon }, i) => {
            const ok = systemOk[i];
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className={`status-dot flex-shrink-0 ${
                    ok ? 'status-dot-live' : 'status-dot-critical'
                  }`}
                />
                <Icon size={14} className="text-atmo-muted" />
                <span className="text-xs font-medium text-atmo-muted flex-1">{label}</span>
                <span className={`text-xs font-bold ${ok ? 'text-mint' : 'text-critical'}`}>
                  {ok ? 'Ready' : 'Offline'}
                </span>
              </div>
            );
          })}
          
          <div className="pt-3 mt-1 border-t border-atmo-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-atmo-muted font-medium">Connection</span>
              <div className="flex items-center gap-1.5">
                {wsOk ? (
                  <Wifi className="w-3.5 h-3.5 text-mint" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber" />
                )}
                <span className={`font-bold tracking-wide ${
                  wsOk ? 'text-mint' :
                  state.connectionStatus === 'POLLING' ? 'text-amber' : 'text-atmo-muted'
                }`}>
                  {state.connectionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
