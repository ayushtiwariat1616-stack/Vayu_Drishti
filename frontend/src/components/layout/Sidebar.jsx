import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Activity, AlertTriangle, Radio, Clock3, Zap,
  Cloud, Wifi, WifiOff, Database, Cpu, Server,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/',          icon: Home,          label: 'Command Center',       end: true },
  { to: '/live',      icon: Activity,      label: 'Live Monitor' },
  { to: '/anomalies', icon: AlertTriangle, label: 'Anomaly Intelligence' },
  { to: '/stations',  icon: Radio,         label: 'Stations' },
  { to: '/history',   icon: Clock3,        label: 'Historical Analysis' },
  { to: '/demo',      icon: Zap,           label: 'Simulation Lab' },
];

const statusItems = [
  { key: 'backend',   label: 'Backend',   icon: Server },
  { key: 'ml',        label: 'ML Engine', icon: Cpu },
  { key: 'database',  label: 'Database',  icon: Database },
  { key: 'websocket', label: 'WebSocket', icon: Wifi },
];

export default function Sidebar() {
  const { state } = useApp();
  const wsOk = state.connectionStatus === 'CONNECTED';

  const systemOk = [true, true, true, wsOk]; // backend, ml, db, ws

  return (
    <aside className="fixed top-0 left-0 h-full w-56 z-40 flex flex-col border-r border-atmo-border bg-atmo-surface">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-atmo-border">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center flex-shrink-0">
          <Cloud className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-atmo-deep uppercase leading-none">Vayu Drishti</div>
          <div className="text-2xs text-atmo-muted mt-0.5 leading-none">AWS Monitoring</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-teal' : 'text-atmo-muted group-hover:text-atmo-deep'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="text-sm truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="px-3 py-3 border-t border-atmo-border">
        <div className="label mb-2.5">System Status</div>
        <div className="space-y-1.5">
          {statusItems.map(({ key, label, icon: Icon }, i) => {
            const ok = systemOk[i];
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={`status-dot flex-shrink-0 ${
                    ok ? 'status-dot-live' : 'status-dot-critical'
                  }`}
                />
                <span className="text-xs text-atmo-muted">{label}</span>
                <span className={`ml-auto text-2xs font-semibold ${ok ? 'text-mint' : 'text-critical'}`}>
                  {ok ? 'OK' : 'ERR'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connection mode */}
        <div className="mt-3 pt-2.5 border-t border-atmo-border/50">
          <div className="flex items-center gap-1.5">
            {state.connectionStatus === 'CONNECTED' ? (
              <Wifi className="w-3 h-3 text-mint" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber" />
            )}
            <span className={`text-2xs font-semibold tracking-wider ${
              state.connectionStatus === 'CONNECTED' ? 'text-mint' :
              state.connectionStatus === 'POLLING'   ? 'text-amber' : 'text-atmo-muted'
            }`}>
              {state.connectionStatus}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
