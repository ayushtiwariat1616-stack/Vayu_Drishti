import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import Header  from '../components/layout/Header';
import OpeningAnimation from '../components/layout/OpeningAnimation';
import SystemStatusDrawer from '../components/system/SystemStatusDrawer';
import CommandCenter from '../pages/CommandCenter/CommandCenter';
import LiveMonitor from '../pages/LiveMonitor/LiveMonitor';
import Anomalies from '../pages/Anomalies/Anomalies';
import AnomalyInvestigation from '../pages/Anomalies/AnomalyInvestigation';
import Stations from '../pages/Stations/Stations';
import StationDetail from '../pages/Stations/StationDetail';
import HistoricalAnalysis from '../pages/Historical/HistoricalAnalysis';
import SimulationLab from '../pages/Simulation/SimulationLab';
import { useEffect, useRef, useState } from 'react';

// 🔥 THE MASTER WEAPON (Import your API Client!)
import { apiClient } from '../api/client'; 

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
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/anomalies/:id" element={<AnomalyInvestigation />} />
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
    <div className="flex flex-col min-h-screen bg-atmo-wave relative">
      <OpeningAnimation />
      <Header />
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 pb-12 w-full max-w-[1920px] mx-auto">
        <AnimatedRoutes />
      </main>
      <SystemStatusDrawer />
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