import { useState, useEffect } from "react";
<<<<<<< HEAD
import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Bell, ChevronDown, Cloud } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  { to: '/',          label: 'Command Center',       end: true },
  { to: '/live',      label: 'Live Monitor' },
  { to: '/anomalies', label: 'Anomaly Intelligence' },
  { to: '/stations',  label: 'Stations' },
  { to: '/history',   label: 'Historical' },
  { to: '/demo',      label: 'Simulation Lab' },
];
=======
import { useApp } from "../../context/AppContext";
import { Bell, ChevronDown } from "lucide-react";
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
<<<<<<< HEAD
  
  // Format: 21:47:50 20.05.2026
  const formattedTime = time.toLocaleTimeString("en-GB", { hour12: false });
  const formattedDate = time.toLocaleDateString("en-GB").replace(/\//g, '.');
  
  return (
    <span className="mono text-xs text-atmo-muted tabular font-medium">
      {formattedTime} <span className="ml-1 opacity-70">{formattedDate}</span>
=======
  return (
    <span className="mono text-sm text-atmo-muted tabular">
      {time.toLocaleTimeString("en-IN", { hour12: false })}
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </span>
  );
}

export default function Header() {
  const { state, setSelectedStation } = useApp();
<<<<<<< HEAD
  const { stations, selectedStation, connectionStatus } = state;
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const selected = stations.find((s) => s.id === selectedStation);
  const isOperational = connectionStatus === 'CONNECTED';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-atmo-surface/95 border-b border-atmo-border/60 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 w-full max-w-[1920px] mx-auto">
        
        {/* Left: Logo & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <img src="/vayu-logo.png" alt="Vayu Drishti Logo" className="h-9 w-auto dark:hidden" />
            <img src="/vayu-logo-dark.svg" alt="Vayu Drishti Logo" className="h-9 w-auto hidden dark:block" />
          </div>
          
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isOperational ? 'bg-mint/10 border-mint/20 text-mint-dark dark:text-mint' : 'bg-amber/10 border-amber/20 text-amber-dark dark:text-amber'} text-xs font-semibold`}>
            <span className={`status-dot ${isOperational ? 'status-dot-live' : 'status-dot-warning'}`} />
            {isOperational ? 'Operational' : 'Degraded'}
          </div>
        </div>

        {/* Middle: Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ to, label, end }) => {
            const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'text-teal bg-teal/10 dark:bg-teal/20' 
                    : 'text-atmo-muted hover:text-atmo-deep hover:bg-atmo-mid'
                }`}
              >
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          
          {/* Station selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-atmo-deep hover:text-teal transition-colors"
            >
              <span className="text-atmo-muted font-medium mr-1">Station:</span>
              {selected?.name || selected?.id || "Select Station"}
              <ChevronDown className={`w-4 h-4 text-atmo-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute top-full mt-2 right-0 w-64 glass dark:glass-dark py-1 z-50">
                {stations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStation(s.station_id || s.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-atmo-mid transition-colors ${
                      s.id === selectedStation ? "text-teal font-semibold" : "text-atmo-deep"
                    }`}
                  >
                    <span className={`status-dot ${s.status === "healthy" ? "status-dot-live" : s.status === "monitoring" ? "status-dot-warning" : "status-dot-muted"}`} />
                    <div>
                      <div className="font-medium">{s.name || s.id}</div>
                      <div className="text-xs text-atmo-muted">{s.station_id || s.id}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-atmo-border hidden md:block" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            
            <button className="relative p-2 rounded-full hover:bg-atmo-mid text-atmo-muted hover:text-atmo-deep transition-colors">
              <Bell className="w-5 h-5" />
              {state.anomalyStats.high > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-critical border-2 border-white dark:border-atmo-surface animate-pulse" />
              )}
            </button>
          </div>

          <div className="hidden sm:block">
            <LiveClock />
          </div>
        </div>
        
      </div>
=======
  const { stations, selectedStation, connectionStatus, lastUpdate } = state;

  const [open, setOpen] = useState(false);
  const selected = stations.find((s) => s.id === selectedStation);

  const timeSince = lastUpdate
    ? ((Date.now() - new Date(lastUpdate).getTime()) / 1000).toFixed(1) +
      "s ago"
    : "—";

  return (
    <header
      className="fixed top-0 left-56 right-0 h-12 z-30 flex items-center px-5 gap-4
                       bg-atmo-surface/90 backdrop-blur-sm border-b border-atmo-border"
    >
      {/* Station selector */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-atmo-border
                     hover:border-teal/40 hover:bg-atmo-mid transition-all text-sm font-medium text-atmo-deep"
        >
          <span
            className={`status-dot ${
              selected?.status === "healthy"
                ? "status-dot-live"
                : selected?.status === "monitoring"
                  ? "status-dot-warning"
                  : "status-dot-muted"
            }`}
          />
          {selected?.id ?? "Select Station"}
          <ChevronDown className="w-3.5 h-3.5 text-atmo-muted" />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 w-56 card py-1 z-50">
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStation(s.station_id || s.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left
                           hover:bg-atmo-mid transition-colors
                           ${s.id === selectedStation ? "text-teal font-semibold" : "text-atmo-deep"}`}
              >
                <span
                  className={`status-dot ${
                    s.status === "healthy"
                      ? "status-dot-live"
                      : s.status === "monitoring"
                        ? "status-dot-warning"
                        : "status-dot-muted"
                  }`}
                />
                <div className="font-medium">{s.station_id || s.id}</div>
                <div className="text-2xs text-atmo-muted">
                  {s.name ||
                    (s.latitude && s.longitude
                      ? `Lat: ${s.latitude}°, Lon: ${s.longitude}°`
                      : "Location Pending")}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WebSocket status */}
      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={`status-dot ${
            connectionStatus === "CONNECTED"
              ? "status-dot-live"
              : connectionStatus === "POLLING"
                ? "status-dot-warning"
                : "status-dot-muted"
          }`}
        />
        <span className="text-atmo-muted font-medium">
          {connectionStatus === "CONNECTED"
            ? "WebSocket"
            : connectionStatus === "POLLING"
              ? "Polling"
              : connectionStatus}{" "}
          ● <span className="text-mint font-semibold">LIVE</span>
        </span>
      </div>

      {/* Last update */}
      <div className="text-2xs text-atmo-muted">
        Last update: <span className="mono text-atmo-deep">{timeSince}</span>
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <LiveClock />

      {/* Alert bell */}
      <button className="relative p-1.5 rounded-lg hover:bg-atmo-mid transition-colors">
        <Bell className="w-4 h-4 text-atmo-muted" />
        {state.anomalyStats.high > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-critical
                           text-white text-2xs flex items-center justify-center font-bold"
          >
            {state.anomalyStats.high}
          </span>
        )}
      </button>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </header>
  );
}
