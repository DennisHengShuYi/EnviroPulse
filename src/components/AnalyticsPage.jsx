import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Activity, Layers, AlertTriangle, Download, ChevronLeft, 
  MapPin, Clock, ShieldAlert, Zap, Thermometer, Wind 
} from 'lucide-react';

const AnalyticsPage = ({ onBack, selectedDistrictId, districts }) => {
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedDistrict = districts.find(d => d.id === selectedDistrictId) || districts[0];

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [histRes, compRes, anomRes] = await Promise.all([
          fetch(`http://localhost:3001/api/analytics/historical?id=${selectedDistrictId}`),
          fetch(`http://localhost:3001/api/analytics/comparison`),
          fetch(`http://localhost:3001/api/analytics/anomalies?id=${selectedDistrictId}`)
        ]);

        const [histData, compData, anomData] = await Promise.all([
          histRes.json(),
          compRes.json(),
          anomRes.json()
        ]);

        setHistory(histData);
        setComparison(compData);
        setAnomalies(anomData);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedDistrictId]);

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="marker-pulse" style={{ width: 40, height: 40, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
        <span className="cyan" style={{ marginLeft: '15px', fontWeight: 800, letterSpacing: '2px' }}>CALCULATING_ANALYTICS...</span>
      </div>
    );
  }

  return (
    <div className="analytics-container" style={{ height: '100vh', overflowY: 'auto', padding: '20px', background: '#000', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ChevronLeft size={14} /> BACK_TO_TERMINAL
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px' }}>📊 ANALYTICS_ENGINE_V5.1</h1>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>LOCATION: {selectedDistrict.name} | SCOPE: 7_DAY_HISTORICAL</span>
          </div>
        </div>
        <button style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '8px 15px', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Download size={14} /> EXPORT_REPORT_PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Pattern Analysis: 7-Day Trend */}
        <div className="widget" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>PATTERN_ANALYSIS_7D</h2>
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--accent-cyan)' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#00f0ff" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={2} />
                <Area type="monotone" dataKey="temp" stroke="#ffb800" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Comparison */}
        <div className="widget" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Layers size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>NATIONWIDE_COMPARISON (AQI)</h2>
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={8} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)', fontSize: '12px' }}
                />
                <Bar dataKey="aqi" fill="rgba(0, 240, 255, 0.6)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="widget" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle size={18} className="gold" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>ANOMALY_DETECTION_LOG</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomalies.length > 0 ? anomalies.map((anom, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800'}`, padding: '10px', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800' }}>[{anom.severity}] {anom.type}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>{new Date(anom.timestamp).toLocaleTimeString()}</span>
                </div>
                <p style={{ fontSize: '0.7rem', margin: 0 }}>Detected value: <b className="cyan">{anom.value}</b>. Suspected Cause: {anom.cause}</p>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                <ShieldAlert size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p>NO_ANOMALIES_DETECTED_IN_PERIOD</p>
              </div>
            )}
          </div>
        </div>

        {/* Predictive Analysis */}
        <div className="widget" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Zap size={18} className="gold" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>AI_PREDICTIVE_FORECAST (24H)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.05)', padding: '15px', border: '1px solid rgba(255, 184, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Thermometer size={14} className="gold" />
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>TEMP_PREDICTION</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>+2.4°C <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-secondary)' }}>EXPECTED_RISE</span></div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Mid-day heat island peak expected around 14:00.</p>
            </div>
            <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '15px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Wind size={14} className="cyan" />
                <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>AQI_STABILITY</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>STABLE <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-secondary)' }}>85%_CONFIDENCE</span></div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Offshore winds likely to maintain moderate AQI levels.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Threshold Exceedance Log */}
      <div className="widget" style={{ marginTop: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Activity size={18} className="cyan" />
          <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>THRESHOLD_EXCEEDANCE_LOG (WHO/DOE_STANDARDS)</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>DATE_TIME</th>
              <th>POLLUTANT</th>
              <th>RECORDED</th>
              <th>LIMIT</th>
              <th>EXCEEDANCE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '10px' }}>2026-05-09 12:45</td>
              <td className="cyan">PM2.5</td>
              <td>16.07 µg/m³</td>
              <td>15.00 µg/m³</td>
              <td style={{ color: '#ffb800' }}>+7.1%</td>
              <td><span className="badge badge-warning" style={{ position: 'static' }}>BREACH</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '10px' }}>2026-05-09 09:20</td>
              <td className="cyan">HEAT_INDEX</td>
              <td>42.1°C</td>
              <td>40.0°C</td>
              <td style={{ color: '#ff4d4d' }}>+5.2%</td>
              <td><span className="badge badge-danger" style={{ position: 'static' }}>CRITICAL</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '10px' }}>2026-05-08 18:15</td>
              <td className="cyan">NO2</td>
              <td>24 ppb</td>
              <td>21 ppb</td>
              <td style={{ color: '#ffb800' }}>+14.2%</td>
              <td><span className="badge badge-warning" style={{ position: 'static' }}>BREACH</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPage;
