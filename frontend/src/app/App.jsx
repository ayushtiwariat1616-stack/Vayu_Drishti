import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import Sidebar from '../components/layout/Sidebar';
import Header  from '../components/layout/Header';
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
    <div className="flex min-h-screen bg-atmo-bg bg-dot-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        <Header />
        <main className="flex-1 pt-12 overflow-y-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  // 1. FORGE THE WEAPON FIRST (Declare State)
  const [stations, setStations] = useState([]);

  // 2. FIRE THE WEAPON (Execute Effect using the cloud-configured apiClient)
  useEffect(() => {
    apiClient.get('/sensors/')
      .then(response => {
        // Axios stores the payload in response.data
        const payload = response.data || response;
        console.log("Radar Data Received:", payload); 
        setStations(payload); 
      })
      .catch(error => console.error("Strike Failed:", error));
  }, []); 

  // 3. RENDER THE BATTLEFIELD
  return (
    <BrowserRouter>
      <AppProvider stations={stations}>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}