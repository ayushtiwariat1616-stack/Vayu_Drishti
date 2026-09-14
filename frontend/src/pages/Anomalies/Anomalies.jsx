import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
<<<<<<< HEAD
import { AlertTriangle, Filter, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
=======
import { AlertTriangle, Filter, ChevronRight, TrendingUp, Clock } from 'lucide-react';
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
import { formatRelative, formatTime } from '../../utils/formatters';

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, WATCH: 2 };

function SeverityDot({ severity }) {
  if (severity === 'HIGH')   return <span className="status-dot status-dot-critical" />;
  if (severity === 'MEDIUM') return <span className="status-dot status-dot-warning" />;
  return <span className="status-dot bg-sky/60" />;
}

function ScoreBar({ score }) {
  const w = `${Math.round(score * 100)}%`;
  const color = score > 0.75 ? 'bg-critical' : score > 0.5 ? 'bg-amber' : 'bg-sky';
  return (
    <div className="flex items-center gap-2">
<<<<<<< HEAD
      <div className="w-16 h-1.5 bg-atmo-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: w }} />
      </div>
      <span className="mono text-xs font-bold text-atmo-deep">{score.toFixed(2)}</span>
=======
      <div className="w-16 h-1.5 bg-atmo-mid rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: w }} />
      </div>
      <span className="mono text-xs font-semibold">{score.toFixed(2)}</span>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </div>
  );
}

export default function AnomalyList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { anomalies, anomalyStats, stations } = state;

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStation, setFilterStation]   = useState('ALL');
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [sortCol, setSortCol]               = useState('timestamp');
  const [sortAsc, setSortAsc]               = useState(false);

  const filtered = useMemo(() => {
    let list = [...anomalies];
    if (filterSeverity !== 'ALL') list = list.filter(a => a.severity === filterSeverity);
    if (filterStation  !== 'ALL') list = list.filter(a => a.stationId === filterStation);
    if (filterStatus   !== 'ALL') list = list.filter(a => a.status === filterStatus);
    list.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'severity') { va = SEVERITY_ORDER[a.severity] ?? 9; vb = SEVERITY_ORDER[b.severity] ?? 9; }
      if (sortCol === 'timestamp') { va = new Date(a.timestamp).getTime(); vb = new Date(b.timestamp).getTime(); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [anomalies, filterSeverity, filterStation, filterStatus, sortCol, sortAsc]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  };

  return (
<<<<<<< HEAD
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-in-up">
        <h1 className="text-4xl font-bold text-atmo-deep tracking-tight mb-2">Anomaly Intelligence</h1>
        <p className="text-sm text-atmo-muted mt-0.5">Detection events · root causes · AI explanations</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in-up stagger-1">
        {[
          { label: 'TOTAL ANOMALIES', val: anomalyStats.total,  color: 'text-teal' },
          { label: 'HIGH',           val: anomalyStats.high,   color: 'text-critical' },
          { label: 'MEDIUM',         val: anomalyStats.medium, color: 'text-amber' },
          { label: 'WATCH',          val: anomalyStats.watch,  color: 'text-sky' },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass px-5 py-4 flex flex-col justify-between">
            <div className="text-2xs font-bold tracking-widest text-atmo-muted uppercase mb-1">{label}</div>
            <div className={`text-4xl font-bold tabular ${color}`}>{val}</div>
          </div>
=======
    <div className="px-6 py-5 space-y-5">
      {/* Header */}
      <div className="animate-in-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-atmo-deep tracking-tight">Anomaly Intelligence</h1>
          <p className="text-sm text-atmo-muted mt-0.5">Detection events · root causes · AI explanations</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-3 animate-in-up stagger-1">
        {[
          { label: 'TOTAL ANOMALIES', val: anomalyStats.total,  color: 'text-atmo-deep', filter: 'ALL' },
          { label: 'HIGH',           val: anomalyStats.high,   color: 'text-critical',  filter: 'HIGH' },
          { label: 'MEDIUM',         val: anomalyStats.medium, color: 'text-amber',     filter: 'MEDIUM' },
          { label: 'WATCH',          val: anomalyStats.watch,  color: 'text-sky-deep',  filter: 'WATCH' },
        ].map(({ label, val, color, filter }) => (
          <button
            key={label}
            onClick={() => setFilterSeverity(filterSeverity === filter ? 'ALL' : filter)}
            className={`card-sm px-5 py-3 text-left transition-all hover:shadow-glass-md
              ${filterSeverity === filter ? 'ring-1 ring-teal/40' : ''}`}
          >
            <div className="label mb-1">{label}</div>
            <div className={`text-3xl font-bold tabular ${color}`}>{val}</div>
          </button>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
        ))}
      </div>

      {/* Filters */}
<<<<<<< HEAD
      <div className="flex flex-wrap items-center gap-3 animate-in-up stagger-2">
        <div className="flex items-center gap-2 px-1">
          <Filter className="w-4 h-4 text-atmo-deep" />
          <span className="text-sm font-bold tracking-widest text-atmo-deep uppercase">FILTERS</span>
        </div>
=======
      <div className="flex items-center gap-3 animate-in-up stagger-2">
        <Filter className="w-3.5 h-3.5 text-atmo-muted flex-shrink-0" />
        <span className="label">FILTERS</span>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22

        {/* Station */}
        <select
          value={filterStation}
          onChange={e => setFilterStation(e.target.value)}
<<<<<<< HEAD
          className="text-sm font-medium border border-atmo-border/60 rounded-full px-4 py-1.5 bg-white dark:bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50 shadow-sm min-w-[140px]"
        >
          <option value="ALL">All Stations</option>
          {stations.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
=======
          className="text-xs border border-atmo-border rounded-lg px-2.5 py-1.5 bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50"
        >
          <option value="ALL">All Stations</option>
          {stations.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
        </select>

        {/* Severity */}
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
<<<<<<< HEAD
          className="text-sm font-medium border border-atmo-border/60 rounded-full px-4 py-1.5 bg-white dark:bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50 shadow-sm min-w-[140px]"
=======
          className="text-xs border border-atmo-border rounded-lg px-2.5 py-1.5 bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50"
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
        >
          <option value="ALL">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="WATCH">WATCH</option>
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
<<<<<<< HEAD
          className="text-sm font-medium border border-atmo-border/60 rounded-full px-4 py-1.5 bg-white dark:bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50 shadow-sm min-w-[140px]"
=======
          className="text-xs border border-atmo-border rounded-lg px-2.5 py-1.5 bg-atmo-surface text-atmo-deep outline-none focus:border-teal/50"
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
        >
          <option value="ALL">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <div className="flex-1" />
<<<<<<< HEAD
        <span className="text-sm font-medium text-atmo-muted">{filtered.length} results</span>
      </div>

      {/* Anomaly table */}
      <div className="glass overflow-hidden animate-in-up stagger-3 flex flex-col min-h-[400px]">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-atmo-border/40">
=======
        <span className="text-xs text-atmo-muted">{filtered.length} results</span>
      </div>

      {/* Anomaly table */}
      <div className="card overflow-hidden animate-in-up stagger-3">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-atmo-border bg-atmo-mid/30">
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
          {[
            { label: 'TIME',     col: 'timestamp', span: 2 },
            { label: 'STATION',  col: 'stationId', span: 2 },
            { label: 'TYPE',     col: 'type',      span: 3 },
            { label: 'SCORE',    col: 'score',     span: 2 },
            { label: 'SEVERITY', col: 'severity',  span: 1 },
            { label: 'STATUS',   col: 'status',    span: 2 },
          ].map(({ label, col, span }) => (
            <button
              key={col}
              onClick={() => toggleSort(col)}
<<<<<<< HEAD
              className={`col-span-${span} text-xs font-bold tracking-widest uppercase flex items-center gap-1 ${
                sortCol === col ? 'text-teal' : 'text-atmo-muted hover:text-atmo-deep transition-colors'
              }`}
            >
              {label}
              {sortCol === col && <span>{sortAsc ? '↑' : '↓'}</span>}
=======
              className={`col-span-${span} section-title text-left hover:text-teal transition-colors flex items-center gap-1`}
            >
              {label}
              {sortCol === col && <span className="text-teal">{sortAsc ? '↑' : '↓'}</span>}
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
            </button>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
<<<<<<< HEAD
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-atmo-border" />
            <div className="text-atmo-muted text-base font-bold">No anomalies match current filters</div>
            <div className="text-atmo-muted/60 text-sm mt-1">All monitored sensors operating within expected patterns</div>
          </div>
        ) : (
          <div className="divide-y divide-atmo-border/30 flex-1">
=======
          <div className="py-16 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-atmo-border" />
            <div className="text-atmo-muted text-sm font-medium">No anomalies match current filters</div>
            <div className="text-atmo-muted/60 text-xs mt-1">All monitored sensors operating within expected patterns</div>
          </div>
        ) : (
          <div className="divide-y divide-atmo-border/40">
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
            {filtered.map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/anomalies/${a.id}`)}
<<<<<<< HEAD
                className={`w-full grid grid-cols-12 gap-3 px-6 py-4 text-left
                           transition-all duration-200 hover:bg-atmo-mid/40 group items-center`}
              >
                {/* Time */}
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="mono text-sm font-bold text-atmo-deep">
                    {formatTime(a.timestamp)}
                  </div>
                  <div className="text-xs text-atmo-muted">{formatRelative(a.timestamp)}</div>
=======
                className={`w-full grid grid-cols-12 gap-3 px-5 py-3.5 text-left
                           transition-all duration-200 hover:bg-atmo-mid/40 group
                           ${a.severity === 'HIGH' ? 'hover:bg-critical/3' : ''}`}
              >
                {/* Time */}
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="mono text-xs font-medium text-atmo-deep">
                    {formatTime(a.timestamp)}
                  </div>
                  <div className="text-2xs text-atmo-muted">{formatRelative(a.timestamp)}</div>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                </div>

                {/* Station */}
                <div className="col-span-2 flex items-center">
<<<<<<< HEAD
                  <span className="text-sm font-bold text-atmo-deep">{a.stationId}</span>
=======
                  <span className="text-sm font-semibold text-atmo-deep">{a.stationId}</span>
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                </div>

                {/* Type */}
                <div className="col-span-3 flex items-center">
                  <div>
<<<<<<< HEAD
                    <div className="text-sm font-bold text-atmo-deep uppercase">{a.type?.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-atmo-muted mt-0.5 uppercase">
=======
                    <div className="text-sm font-medium text-atmo-deep">{a.type?.replace(/_/g, ' ')}</div>
                    <div className="text-2xs text-atmo-muted mt-0.5">
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                      {a.rootCauses?.slice(0,2).map(r => r.replace(/_/g, ' ')).join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 flex items-center">
                  <ScoreBar score={a.score} />
                </div>

                {/* Severity */}
                <div className="col-span-1 flex items-center">
<<<<<<< HEAD
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 ${
                    a.severity === 'HIGH' ? 'bg-critical/10 text-critical-dark dark:text-critical' :
                    a.severity === 'MEDIUM' ? 'bg-amber/10 text-amber-dark dark:text-amber' : 'bg-sky/10 text-sky-dark dark:text-sky'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.severity === 'HIGH' ? 'bg-critical' : a.severity === 'MEDIUM' ? 'bg-amber' : 'bg-sky'}`} />
=======
                  <span className={`badge ${
                    a.severity === 'HIGH' ? 'badge-high' :
                    a.severity === 'MEDIUM' ? 'badge-medium' : 'badge-watch'
                  }`}>
                    <SeverityDot severity={a.severity} />
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                    {a.severity}
                  </span>
                </div>

                {/* Status + arrow */}
                <div className="col-span-2 flex items-center justify-between">
<<<<<<< HEAD
                  <span className={`text-sm font-bold capitalize ${
=======
                  <span className={`text-xs font-medium capitalize ${
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                    a.status === 'active' ? 'text-critical' :
                    a.status === 'acknowledged' ? 'text-amber' : 'text-mint'
                  }`}>
                    {a.status}
                  </span>
<<<<<<< HEAD
                  <ChevronRight className="w-5 h-5 text-atmo-border group-hover:text-teal transition-colors" />
=======
                  <ChevronRight className="w-4 h-4 text-atmo-border group-hover:text-teal transition-colors" />
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
<<<<<<< HEAD

      {/* AI Triage Summary */}
      <div className="glass px-6 py-4 flex items-center justify-between animate-in-up stagger-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-atmo-deep">
            <Sparkles className="w-5 h-5 text-teal" />
            <span className="font-bold tracking-widest uppercase">AI Triage Summary</span>
          </div>
          <span className="text-sm text-atmo-deep font-medium">
            {anomalyStats.high} high-priority events require review
          </span>
        </div>
        <button 
          onClick={() => navigate('/anomalies')}
          className="btn-primary rounded-full px-5"
        >
          Review queue <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
=======
>>>>>>> 152f2e72e5a34af9c9255e82f9768deb03daee22
    </div>
  );
}
