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
import WorkerGrid from './components/WorkerGrid';

// Pages
import AnalyticsPage from './pages/AnalyticsPage';
import SensorsPage from './pages/SensorsPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import CompliancePage from './pages/CompliancePage';
import SupplyChainPage from './pages/SupplyChainPage';

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
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [homeDistrictId, setHomeDistrictId] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [showAlerts, setShowAlerts] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [hazeLevel, setHazeLevel] = useState(0); // 0: None, 1: Moderate, 2: Unhealthy, 3: Hazardous

  const triggerHazeSimulation = () => {
    setHazeLevel(prev => (prev + 1) % 4);
  };

  const handleLocateMe = (districtList) => {
    console.log('[GPS_SYNC] LocateMe triggered...');
    const listToUse = (districtList && districtList.length > 0) ? districtList : districts;
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setSelectedDistrict('klcc');
      return;
    }

    if (listToUse.length === 0) {
      console.warn("Districts list not ready, retrying with KLCC default");
      setSelectedDistrict('klcc');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[GPS_SYNC] Real GPS: ${latitude}, ${longitude}`);
        setUserCoords({ lat: latitude, lng: longitude });
        
        let nearest = listToUse[0];
        let minDist = Infinity;

        listToUse.forEach(d => {
          const dist = getDistance(latitude, longitude, d.lat, d.lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        });

        console.log(`[GPS_SYNC] Auto-selecting nearest: ${nearest.name}`);
        setHomeDistrictId(nearest.id);
        setSelectedDistrict('user_gps'); // Force hyper-local mode for real-time user GPS
      },
      (error) => {
        console.warn("Geolocation failed or denied:", error);
        setSelectedDistrict('klcc');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/districts');
        const list = await res.json();
        setDistricts(list);
        handleLocateMe(list);
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  const [allDistrictsData, setAllDistrictsData] = useState([]);

  // Periodic Data Fetching
  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchData = async () => {
      try {
        let query = `?id=${selectedDistrict}`;
        if (selectedDistrict === 'user_gps' && userCoords) {
          query = `?lat=${userCoords.lat}&lng=${userCoords.lng}`;
        }

        const [dataRes, trendRes, alertRes] = await Promise.all([
          fetch(`/api/sensors${query}`),
          fetch(`/api/trends${query}`),
          fetch(`/api/alerts${query}`)
        ]);

        const parseJson = async (res) => {
          const ct = res.headers.get("content-type");
          if (ct && ct.includes("application/json")) {
            setIsLive(true);
            return res.json();
          }
          setIsLive(false);
          return null;
        };
        
        const [dataJson, trendJson, alertJson] = await Promise.all([
          parseJson(dataRes),
          parseJson(trendRes),
          parseJson(alertRes)
        ]);
        
        if (dataJson) setData(dataJson);
        if (trendJson) setTrends(trendJson);
        if (alertJson) setAlerts(alertJson);
        
        if (dataJson) setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setIsLive(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000); 
    return () => clearInterval(interval);
  }, [selectedDistrict]);

  // Separate interval for heavy comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch('/api/analytics/comparison');
        const json = await res.json();
        if (json) setAllDistrictsData(json);
      } catch (e) { console.error('Comparison fetch error:', e); }
    };
    fetchComparison();
    const interval = setInterval(fetchComparison, 180000); // 3 min
    return () => clearInterval(interval);
  }, []);

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
        <HeroMetrics data={data} layout="vertical" hazeLevel={hazeLevel} />
        <TrendChart data={trends} hazeLevel={hazeLevel} />
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
            <City3DView 
              data={data} 
              allDistricts={allDistrictsData} 
              userCoords={userCoords} 
              homeDistrictId={homeDistrictId}
              hazeLevel={hazeLevel}
            />
          )}
        </div>
      </div>

      <div className="dashboard-column">
        <AIAdvisory data={data} />
        <PollutantGrid pollutants={data.pollutants} hazeLevel={hazeLevel} />
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
          allDistrictsData={allDistrictsData}
        />
      );
      case 'sensors': return <SensorsPage districts={districts} />;
      case 'alerts': return <AlertsPage selectedDistrictId={selectedDistrict} />;
      case 'reports': return <ReportsPage data={data} districts={districts} headerDistrict={selectedDistrict} />;
      case 'compliance': return <CompliancePage districts={districts} data={data} />;
      case 'supply': return <SupplyChainPage />;
      case 'workers': return <WorkerGrid hazeLevel={hazeLevel} triggerHazeSimulation={triggerHazeSimulation} />;
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
          onLocateMe={() => handleLocateMe()}
          alertCount={alerts.length}
          onToggleAlerts={() => setShowAlerts(!showAlerts)}
          showAlerts={showAlerts}
          isLive={isLive}
        />
        
        {showAlerts && <AlertBanner alerts={alerts} onDismiss={() => setShowAlerts(false)} onNavigate={() => setActivePage('alerts')} />}
        
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
