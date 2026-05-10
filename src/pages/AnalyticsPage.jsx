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
    // Wait for the parent component to fetch and provide the updated data for this district
    if (!data) return;
    if (selectedDistrictId !== 'user_gps' && data.id !== selectedDistrictId) return;

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
  }, [selectedDistrictId, data?.id]);

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
        <div className="widget" style={{ gridColumn: 'span 12', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>PATTERN_ANALYSIS_HISTORICAL</h2>
          </div>
          <div style={{ height: '300px', minHeight: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="99%" height="99%">
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

        {/* Predictive Engine — Full Detail Panel */}
        <div className="widget" style={{ gridColumn: 'span 12', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} style={{ color: roleColors[activeRole] }} />
              <h2 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0, letterSpacing: '1px' }}>AI_PREDICTIVE_ENGINE — 48H MULTI-ROLE INTELLIGENCE</h2>
            </div>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {['construction', 'government', 'esgFirm'].map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  style={{
                    background: activeRole === role ? roleColors[role] : 'transparent',
                    color: activeRole === role ? '#000' : '#888',
                    border: 'none',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px'
                  }}
                >
                  {role === 'esgFirm' ? 'ESG_FIRM' : role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {currentPred ? (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* Top Row: Forecast + Risk Matrix + Hourly Outlook */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '20px', marginBottom: '20px' }}>

                {/* Forecast Narrative */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', borderLeft: `4px solid ${roleColors[activeRole]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: roleColors[activeRole], letterSpacing: '1px' }}>48H_FORECAST_NARRATIVE</span>
                    <span className={`badge ${currentPred.riskLevel === 'LOW' ? 'badge-success' : currentPred.riskLevel === 'MODERATE' ? '' : 'badge-danger'}`}
                      style={{ position: 'static', padding: '3px 10px', fontSize: '0.6rem', background: currentPred.riskLevel === 'MODERATE' ? 'rgba(255,184,0,0.2)' : undefined, color: currentPred.riskLevel === 'MODERATE' ? '#ffb800' : undefined, border: currentPred.riskLevel === 'MODERATE' ? '1px solid #ffb800' : undefined }}>
                      {currentPred.riskLevel}_RISK
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', margin: 0, lineHeight: '1.7', color: '#ddd' }}>{currentPred.forecast48h}</p>
                </div>

                {/* Risk Matrix */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>RISK_MATRIX_SCORES</div>
                  {currentPred.riskMatrix && Object.entries(currentPred.riskMatrix).map(([key, val]) => {
                    const score = Number(val) || 0;
                    const color = score >= 70 ? '#ff4d4d' : score >= 45 ? '#ffb800' : '#00ffcc';
                    return (
                      <div key={key} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, '_$1')}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color }}>{score}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(score, 100)}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hourly Outlook */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '1px' }}>48H_HOURLY_OUTLOOK</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(currentPred.hourlyOutlook || []).map((h, i) => {
                      const riskColor = h.risk === 'HIGH' ? '#ff4d4d' : h.risk === 'MODERATE' ? '#ffb800' : '#00ffcc';
                      return (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 900, color: riskColor, minWidth: '85px', fontFamily: 'JetBrains Mono' }}>{h.window}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.62rem', color: '#bbb', display: 'block', lineHeight: '1.4' }}>{h.condition}</span>
                          </div>
                          <span style={{ fontSize: '0.5rem', fontWeight: 900, color: riskColor, border: `1px solid ${riskColor}`, padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>{h.risk}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Chain of Thought + Predicted Events + Technical Reasoning */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px' }}>

                {/* Chain of Thought */}
                <div style={{ background: `rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.04)`, padding: '18px', borderRadius: '8px', border: `1px solid rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.15)` }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: roleColors[activeRole], marginBottom: '14px', letterSpacing: '1px' }}>🧠 AI_THINKING_PROCESS — CHAIN OF THOUGHT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(currentPred.chainOfThought || []).map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: roleColors[activeRole], color: '#000', fontSize: '0.58rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: '0.7rem', color: '#ddd', lineHeight: '1.55' }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted Events */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '1px' }}>CRITICAL_PREDICTED_EVENTS ({currentPred.predictedEvents?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(currentPred.predictedEvents || []).map((event, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '5px', border: `1px solid rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.08)` }}>
                        <Activity size={12} style={{ color: roleColors[activeRole], marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: '#ccc', lineHeight: '1.5' }}>{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Reasoning */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '1px' }}>PREDICTIVE_TECHNICAL_REASONING</div>
                  <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0, lineHeight: '1.7' }}>{currentPred.technicalReasoning}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', gap: '12px' }}>
              <BrainCircuit size={40} style={{ opacity: 0.3 }} />
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
            <ResponsiveContainer width="99%" height="99%">
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
