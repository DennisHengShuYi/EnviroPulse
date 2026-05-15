import React, { useState, useEffect } from 'react';
import { API_BASE } from './config/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AlertPanel from './components/AlertPanel';
import HeroMetrics from './components/HeroMetrics';
import PollutantGrid from './components/PollutantGrid';
import AIAdvisory from './components/AIAdvisory';
import TrendChart from './components/TrendChart';
import WorkerGrid from './components/WorkerGrid';
import RiskCommandCenter from './components/RiskCommandCenter';
import ComplianceHeatmap from './components/ComplianceHeatmap';

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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DEMO_SUBMISSIONS = [
  {
    id: 'SUB-001',
    company: 'Acme Sdn Bhd',
    zone: 'Cheras Industrial',
    nodeId: 'kajang',
    nodeName: 'CHERAS_NODE_7 (via KAJANG)',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    reportedPm25: 12,
    reportedAqi: 45,
    reportedStatus: 'GOOD',
  },
  {
    id: 'SUB-002',
    company: 'GreenOps Holdings',
    zone: 'Shah Alam Industrial Park',
    nodeId: 'shahalam',
    nodeName: 'SHAHALAM_NODE_2',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    reportedPm25: 10,
    reportedAqi: 40,
    reportedStatus: 'GOOD',
  },
  {
    id: 'SUB-003',
    company: 'Klang Chemical Works Sdn Bhd',
    zone: 'Klang North Industrial Corridor',
    nodeId: 'klang',
    nodeName: 'KLANG_NODE_4 (NORTH_CORRIDOR)',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    reportedPm25: 18,
    reportedAqi: 60,
    reportedStatus: 'MODERATE',
  },
];

const computeThresholdAlerts = (sensorData) => {
  if (!sensorData) return [];
  const now = new Date().toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour12: false });
  const pm25 = parseFloat(sensorData.pollutants?.pm25) || 0;
  const aqi  = parseFloat(sensorData.metrics?.aqi?.value) || 0;
  const hi   = parseFloat(sensorData.metrics?.heatIndex?.value) || 0;
  const no2  = parseFloat(sensorData.pollutants?.no2?.value || sensorData.pollutants?.no2) || 0;
  const results = [];

  if (hi >= 40) {
    results.push({ id: 'hi_stop', type: 'HEAT_INDEX', zone: sensorData.name, value: `${hi}°C`, status: 'STOP_WORK', severity: 'CRITICAL', message: `Heat Index ${hi}°C ≥ 40°C — STOP WORK order. All outdoor work must cease immediately.`, regulation: 'OSH Act 2024 §15(2)', time: now });
  } else if (hi >= 38) {
    results.push({ id: 'hi_danger', type: 'HEAT_INDEX', zone: sensorData.name, value: `${hi}°C`, status: 'DANGER', severity: 'CRITICAL', message: `Heat Index ${hi}°C ≥ 38°C — DANGER. Mandatory 45 min work / 15 min rest cycle.`, regulation: 'OSH Act 2024 §15(2)', time: now });
  } else if (hi >= 33) {
    results.push({ id: 'hi_caution', type: 'HEAT_INDEX', zone: sensorData.name, value: `${hi}°C`, status: 'CAUTION', severity: 'WARNING', message: `Heat Index ${hi}°C ≥ 33°C — DOSH CAUTION. 50 min work / 10 min rest cycle required.`, regulation: 'OSH Act 2024 §15(2)', time: now });
  }

  if (pm25 >= 35) {
    results.push({ id: 'pm25_critical', type: 'PM2.5', zone: sensorData.name, value: `${pm25} µg/m³`, status: 'CRITICAL', severity: 'CRITICAL', message: `PM2.5 ${pm25} µg/m³ ≥ 35 µg/m³ — N100 respirator mandatory. DOE notification required.`, regulation: 'EQA 1974 §22', time: now });
  } else if (pm25 >= 15) {
    results.push({ id: 'pm25_who', type: 'PM2.5', zone: sensorData.name, value: `${pm25} µg/m³`, status: 'WHO_BREACH', severity: 'WARNING', message: `PM2.5 ${pm25} µg/m³ exceeds WHO 15 µg/m³ guideline. N95 respirator mandatory for all workers.`, regulation: 'WHO AQG 2021', time: now });
  }

  if (aqi >= 100) {
    results.push({ id: 'aqi_unhealthy', type: 'AQI', zone: sensorData.name, value: String(aqi), status: 'UNHEALTHY', severity: 'CRITICAL', message: `AQI ${aqi} ≥ 100 — reduce production 20–30% immediately. DOE notification required.`, regulation: 'EQA 1974 §22', time: now });
  } else if (aqi >= 85) {
    // Only warn when within 15 units of the 100 limit — genuinely "almost reached"
    results.push({ id: 'aqi_watch', type: 'AQI', zone: sensorData.name, value: String(aqi), status: 'NEAR_LIMIT', severity: 'WARNING', message: `AQI ${aqi} is ${100 - aqi} units from the DOE 100 notification threshold. Prepare protocols now.`, regulation: 'EQA 1974 §22', time: now });
  }

  if (no2 >= 25) {
    results.push({ id: 'no2_limit', type: 'NO2', zone: sensorData.name, value: `${no2} ppb`, status: 'EXCEEDED', severity: 'WARNING', message: `NO2 ${no2} ppb ≥ 25 ppb DOE guideline. Inspect all leak sources and ventilation systems.`, regulation: 'DOE Guideline', time: now });
  }

  return results;
};

function App() {
  const [data, setData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [serverAlerts, setServerAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [homeDistrictId, setHomeDistrictId] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [showAlerts, setShowAlerts] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [hazeLevel, setHazeLevel] = useState(0); // 0: None, 1: Moderate, 2: Unhealthy, 3: Hazardous
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [submissions, setSubmissions] = useState(DEMO_SUBMISSIONS);
  const [tier, setTier] = useState('premium');

  const addSubmission = (newSub) => {
    setSubmissions(prev => [newSub, ...prev]);
  };

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
        const res = await fetch(`${API_BASE}/api/districts`);
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
          fetch(`${API_BASE}/api/sensors${query}`),
          fetch(`${API_BASE}/api/trends${query}`),
          fetch(`${API_BASE}/api/alerts${query}`)
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
        if (alertJson) setServerAlerts(alertJson);

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

  // Merge server alerts + client-side threshold alerts whenever data or serverAlerts changes
  useEffect(() => {
    const computed = computeThresholdAlerts(data);
    // Deduplicate: computed alerts by id take precedence over server alerts with same type
    const computedIds = new Set(computed.map(a => a.id));
    const serverOnly = serverAlerts
      .filter(a => !computedIds.has(a.id))
      .map(a => ({ ...a, severity: a.status === 'DANGER' ? 'CRITICAL' : 'WARNING', message: `${a.type} at ${a.zone}: ${a.value} — status ${a.status}` }));
    // Sort: CRITICAL first, then WARNING
    const merged = [...computed, ...serverOnly].sort((a, b) => {
      const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
    });
    setActiveAlerts(merged);
  }, [data, serverAlerts]);

  // Separate interval for heavy comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/comparison`);
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
    <div className="dashboard-grid-3col">
      {/* Left Column — Live Conditions */}
      <div className="dashboard-column">
        <HeroMetrics data={data} hazeLevel={hazeLevel} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TrendChart data={trends} hazeLevel={hazeLevel} />
        </div>
      </div>

      {/* Center Column — Risk Assessment */}
      <div className="dashboard-column">
        <RiskCommandCenter data={data} />
        <PollutantGrid pollutants={data.pollutants} hazeLevel={hazeLevel} />
      </div>

      {/* Right Column — AI Intelligence */}
      <div className="dashboard-column" style={{ position: 'relative' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', filter: tier === 'basic' ? 'blur(8px) grayscale(50%)' : 'none', pointerEvents: tier === 'basic' ? 'none' : 'auto', userSelect: tier === 'basic' ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
          <AIAdvisory data={data} history={trends} />
        </div>
        {tier === 'basic' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
             <div style={{ background: 'var(--bg-widget)', padding: '20px 30px', borderRadius: '8px', border: '1px solid var(--accent-gold)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
               <div style={{ color: 'var(--accent-gold)', fontWeight: 900, fontSize: '1rem', letterSpacing: '2px', marginBottom: '8px' }}>PREMIUM FEATURE</div>
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Upgrade to unlock AI advisories</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
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
      case 'reports': return <ReportsPage data={data} districts={districts} headerDistrict={selectedDistrict} addSubmission={addSubmission} />;
      case 'compliance': return <CompliancePage districts={districts} data={allDistrictsData} submissions={submissions} setSubmissions={setSubmissions} />;
      case 'supply': return <SupplyChainPage />;
      case 'workers': return <WorkerGrid hazeLevel={hazeLevel} triggerHazeSimulation={triggerHazeSimulation} />;
      default: return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        tier={tier}
      />

      <main className="main-content">
        <Header
          districtName={selectedDistrict}
          districts={districts}
          onSelectDistrict={setSelectedDistrict}
          onLocateMe={() => handleLocateMe()}
          alertCount={activeAlerts.length}
          onToggleAlerts={() => setShowAlerts(prev => !prev)}
          showAlerts={showAlerts}
          isLive={isLive}
          tier={tier}
          setTier={setTier}
        />

        {showAlerts && (
          <AlertPanel
            alerts={activeAlerts}
            onDismissAll={() => { setActiveAlerts([]); setShowAlerts(false); }}
            onNavigate={() => setActivePage('alerts')}
            onClose={() => setShowAlerts(false)}
          />
        )}

        {renderPage()}
      </main>
    </div>
  );
}

export default App;
