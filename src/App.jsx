import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar  from './components/layout/TopBar';
import CommandCenter     from './pages/CommandCenter';
import LiveMonitor       from './pages/LiveMonitor';
import AnomalyList       from './pages/AnomalyList';
import AnomalyDetail     from './pages/AnomalyDetail';
import Stations          from './pages/Stations';
import StationDetail     from './pages/StationDetail';
import HistoricalAnalysis from './pages/HistoricalAnalysis';
import SimulationLab     from './pages/SimulationLab';
import { useEffect, useRef, useState } from 'react';

// Page transition wrapper
function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transClass, setTransClass]           = useState('page-enter-active');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransClass('page-exit-active');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransClass('page-enter');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setTransClass('page-enter-active'));
        });
      }, 180);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [location, displayLocation]);

  return (
    <div className={transClass} style={{ minHeight: '100%' }}>
      <Routes location={displayLocation}>
        <Route path="/"          element={<CommandCenter />} />
        <Route path="/live"      element={<LiveMonitor />} />
        <Route path="/anomalies" element={<AnomalyList />} />
        <Route path="/anomalies/:id" element={<AnomalyDetail />} />
        <Route path="/stations"  element={<Stations />} />
        <Route path="/stations/:id" element={<StationDetail />} />
        <Route path="/history"   element={<HistoricalAnalysis />} />
        <Route path="/demo"      element={<SimulationLab />} />
      </Routes>
    </div>
  );
}

function AppShell() {
  return (
    <div className="flex min-h-screen bg-atmo-bg bg-dot-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        <TopBar />
        <main className="flex-1 pt-12 overflow-y-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
