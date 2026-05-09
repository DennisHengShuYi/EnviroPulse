import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import HeroMetrics from './components/HeroMetrics';
import PollutantGrid from './components/PollutantGrid';
import MapHero from './components/MapHero';
import AIAdvisory from './components/AIAdvisory';
import TrendChart from './components/TrendChart';
import City3DView from './components/City3DView';

// Pages
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import SensorsPage from './pages/SensorsPage';
import ReportsPage from './pages/ReportsPage';

// Helper to calculate distance between two coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

function App() {
  const [data, setData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDistrict, setSelectedDistrict] = useState('klcc');
  const [userCoords, setUserCoords] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [showAlerts, setShowAlerts] = useState(false);

  // Initial Fetch and Geolocation
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/districts');
        const list = await res.json();
        setDistricts(list);

        // Geolocation logic
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserCoords({ lat: latitude, lng: longitude });
              let nearest = list[0];
              let minDist = Infinity;

              list.forEach(d => {
                const dist = getDistance(latitude, longitude, d.lat, d.lng);
                if (dist < minDist) {
                  minDist = dist;
                  nearest = d;
                }
              });

              console.log(`Detected location near: ${nearest.name}`);
              setSelectedDistrict(nearest.id);
            },
            (error) => {
              console.warn("Geolocation denied or failed, defaulting to KLCC.");
              setSelectedDistrict('klcc');
            }
          );
        }
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  // Periodic Data Fetching (Scoped to Selected District)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, trendRes, alertRes] = await Promise.all([
          fetch(`http://localhost:3001/api/sensors?id=${selectedDistrict}`),
          fetch(`http://localhost:3001/api/trends?id=${selectedDistrict}`),
          fetch(`http://localhost:3001/api/alerts?id=${selectedDistrict}`) // Filtered to current district
        ]);
        
        const [dataJson, trendJson, alertJson] = await Promise.all([
          dataRes.json(),
          trendRes.json(),
          alertRes.json()
        ]);
        
        setData(dataJson);
        setTrends(trendJson);
        setAlerts(alertJson);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [selectedDistrict]);

  if (loading || !data) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div className="marker-pulse" style={{ width: 60, height: 60, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
        <div style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '4px' }}>CALIBRATING_LOCAL_STATION...</div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="dashboard-grid">
      <div className="dashboard-column">
        <HeroMetrics data={data} layout="vertical" />
        <TrendChart data={trends} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden', height: '100%' }}>
        <div className="widget" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'absolute', top: '20px', right: '120px', zIndex: 2000, display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
              style={{ 
                background: 'var(--accent-cyan)', 
                color: '#000',
                border: '1px solid var(--accent-cyan)',
                padding: '8px 20px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: '2px',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {viewMode === '2d' ? 'VIEW_3D_TWIN' : 'VIEW_2D_SATELLITE'}
            </button>
          </div>
          
          {viewMode === '2d' ? (
            <MapHero onSelectDistrict={setSelectedDistrict} selectedId={selectedDistrict} userCoords={userCoords} />
          ) : (
            <City3DView data={data} />
          )}
        </div>
      </div>

      <div className="dashboard-column">
        <AIAdvisory data={data} />
        <PollutantGrid pollutants={data.pollutants} />
      </div>
    </div>
  );

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return renderDashboard();
      case 'analytics': return (
        <AnalyticsPage 
          onBack={() => setActivePage('dashboard')} 
          selectedDistrictId={selectedDistrict}
          districts={districts}
          data={data}
        />
      );
      case 'alerts': return <AlertsPage />;
      case 'sensors': return <SensorsPage districts={districts} />;
      case 'reports': return <ReportsPage data={data} districts={districts} />;
      default: return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="main-content">
        <Header 
          districtName={selectedDistrict} 
          districts={districts} 
          onSelectDistrict={setSelectedDistrict}
          alertCount={alerts.length}
          onToggleAlerts={() => setShowAlerts(!showAlerts)}
          showAlerts={showAlerts}
        />
        
        {showAlerts && <AlertBanner alerts={alerts} onDismiss={() => setShowAlerts(false)} />}
        
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
