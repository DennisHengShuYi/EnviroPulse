import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell
} from 'recharts';
import { 
  TrendingUp, Activity, Layers, AlertTriangle, Download, ChevronLeft, 
  MapPin, Clock, ShieldAlert, Zap, Thermometer, Wind, BrainCircuit
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalyticsPage = ({ onBack, selectedDistrictId, districts, data }) => {
  const reportRef = React.useRef();
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeRole, setActiveRole] = useState('construction');

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ENVIROPULSE_AUDIT_${selectedDistrict.name.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const selectedDistrict = selectedDistrictId === 'user_gps' 
    ? { id: 'user_gps', name: data?.name || 'LOCAL_STATION' }
    : (districts?.find(d => d.id === selectedDistrictId) || districts?.[0] || { name: 'KUALA LUMPUR', id: 'klcc' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let query = `?id=${selectedDistrictId}`;
        if (selectedDistrictId === 'user_gps' && data) {
          query = `?lat=${data.lat}&lng=${data.lng}`;
        }

        const [histRes, compRes, anomRes, predRes] = await Promise.all([
          fetch(`/api/analytics/historical${query}`),
          fetch(`/api/analytics/comparison`),
          fetch(`/api/analytics/anomalies${query}`),
          fetch(`/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sensorData: data, history: [] })
          })
        ]);

        const [histData, compData, anomData, predData] = await Promise.all([
          histRes.json(),
          compRes.json(),
          anomRes.json(),
          predRes.json()
        ]);

        setHistory(Array.isArray(histData) ? histData : []);
        setComparison(Array.isArray(compData) ? compData : []);
        setAnomalies(Array.isArray(anomData) ? anomData : []);
        setPrediction(predData);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedDistrictId]);

  const roleColors = {
    construction: 'var(--accent-gold)',
    government: 'var(--accent-cyan)',
    esgFirm: '#fff'
  };

  const currentPred = prediction ? prediction[activeRole] : null;

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div className="marker-pulse" style={{ width: 60, height: 60, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
        <div style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '4px' }}>CALCULATING_ANALYTICS...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container" ref={reportRef} style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', background: '#000', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '5px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 800 }}>
            <ChevronLeft size={14} /> BACK_TO_TERMINAL
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>PREDICTIVE_INTELLIGENCE_ENGINE</span>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>LOCATION: {selectedDistrict.name.toUpperCase()} | SCOPE: 48H_MULTI_ROLE_PREDICTION</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Pattern Analysis: 7-Day Trend */}
        <div className="widget" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>PATTERN_ANALYSIS_HISTORICAL</h2>
          </div>
          <div style={{ height: '300px', minHeight: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#050505', border: '1px solid var(--accent-cyan)', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--accent-cyan)' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#00f0ff" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Engine */}
        <div className="widget" style={{ gridColumn: 'span 4', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} style={{ color: roleColors[activeRole] }} />
              <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>AI_PREDICTIVE_ENGINE</h2>
            </div>
            <div style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '4px' }}>
              {['construction', 'government', 'esgFirm'].map(role => (
                <button 
                  key={role}
                  onClick={() => setActiveRole(role)}
                  style={{ 
                    background: activeRole === role ? roleColors[role] : 'transparent',
                    color: activeRole === role ? '#000' : '#888',
                    border: 'none',
                    fontSize: '0.5rem',
                    fontWeight: 900,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {currentPred ? (
            <div style={{ flex: 1, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '4px', marginBottom: '15px', borderLeft: `4px solid ${roleColors[activeRole]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: roleColors[activeRole] }}>48H_FORECAST_NARRATIVE:</span>
                  <span className={`badge ${currentPred.riskLevel === 'LOW' ? 'badge-success' : 'badge-danger'}`} style={{ position: 'static', padding: '2px 8px' }}>
                    {currentPred.riskLevel}_RISK
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', margin: 0, lineHeight: '1.5', color: '#eee' }}>{currentPred.forecast48h}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>CRITICAL_PREDICTED_EVENTS:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {currentPred.predictedEvents && currentPred.predictedEvents.map((event, i) => (
                    <div key={i} style={{ fontSize: '0.7rem', color: '#fff', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Activity size={12} style={{ color: roleColors[activeRole] }} />
                      <span>{event}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '5px' }}>PREDICTIVE_LOGIC:</div>
                <p style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#888', margin: 0 }}>"{currentPred.technicalReasoning}"</p>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              <BrainCircuit size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
              INITIALIZING_AI_FORECAST_MODEL...
            </div>
          )}
        </div>

        {/* City Comparison */}
        <div className="widget" style={{ gridColumn: 'span 6', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Layers size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>NATIONWIDE_COMPARISON (AQI)</h2>
          </div>
          <div style={{ height: '300px', minHeight: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison.slice(0, 10)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 10 }} width={100} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#050505', border: '1px solid var(--accent-cyan)' }} />
                <Bar dataKey="aqi" radius={[0, 4, 4, 0]}>
                  {comparison.map((entry, index) => {
                    const color = entry.aqi > 150 ? '#ff4d4d' : // CRITICAL RED
                                entry.aqi > 100 ? '#ff9900' : // UNHEALTHY ORANGE
                                entry.aqi > 50 ? '#ffcc00' :  // MODERATE GOLD
                                '#00ffcc';                    // HEALTHY CYAN
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="widget" style={{ gridColumn: 'span 6', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle size={18} className="gold" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>ANOMALY_DETECTION_LOG</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            {anomalies.length > 0 ? anomalies.map((anom, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800'}`, padding: '12px', background: 'rgba(255,255,255,0.03)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800' }}>[{anom.severity}] {anom.type}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>{anom.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.7rem', margin: 0, color: '#aaa' }}>
                  VALUE: <b style={{ color: '#fff' }}>{anom.value}</b> | CAUSE: {anom.cause || anom.details}
                </p>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                <ShieldAlert size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p>NO_ANOMALIES_DETECTED_IN_PERIOD</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
