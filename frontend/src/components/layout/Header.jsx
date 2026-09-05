import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Bell, ChevronDown } from "lucide-react";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="mono text-sm text-atmo-muted tabular">
      {time.toLocaleTimeString("en-IN", { hour12: false })}
    </span>
  );
}

export default function Header() {
  const { state, setSelectedStation } = useApp();
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
    </header>
  );
}
