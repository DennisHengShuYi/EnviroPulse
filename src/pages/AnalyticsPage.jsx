import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Layers, AlertTriangle,
  ShieldAlert, Zap, Thermometer, Wind, RefreshCw, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalyticsPage = ({ onBack, selectedDistrictId, districts, data, allDistrictsData }) => {
  const reportRef = React.useRef();
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [prediction, setPrediction] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingRole, setLoadingRole] = useState(false);
  const [exporting, setExporting] = useState(false);
  const activeRole = 'factoryMsme';
  const [histMetric, setHistMetric] = useState('aqi');

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
      pdf.save(`ENVIROPULSE_AUDIT_${selectedDistrict.name.toUpperCase()}_FACTORY_MSME_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const selectedDistrict = selectedDistrictId === 'user_gps' 
    ? { id: 'user_gps', name: data?.name || 'LOCAL_STATION' }
    : (districts?.find(d => d.id === selectedDistrictId) || districts?.[0] || { name: 'KUALA LUMPUR', id: 'klcc' });

  // Sync comparison data from parent prop (avoids duplicate API call)
  useEffect(() => {
    if (allDistrictsData && allDistrictsData.length > 0) {
      setComparison(allDistrictsData);
    }
  }, [allDistrictsData]);

  // Effect 1: Base data fetch on district change
  useEffect(() => {
    if (!data) return;
    if (selectedDistrictId !== 'user_gps' && data.id !== selectedDistrictId) return;

    const fetchBaseAnalytics = async () => {
      setLoading(true);
      try {
        let query = `?id=${selectedDistrictId}`;
        if (selectedDistrictId === 'user_gps' && data) {
          query = `?lat=${data.lat}&lng=${data.lng}`;
        }

        const [histRes, anomRes] = await Promise.all([
          fetch(`/api/analytics/historical${query}`),
          fetch(`/api/analytics/anomalies${query}`)
        ]);

        const [histData, anomData] = await Promise.all([
          histRes.json(),
          anomRes.json()
        ]);

        setHistory(Array.isArray(histData) ? histData : []);
        setAnomalies(Array.isArray(anomData) ? anomData : []);
        setPrediction({}); // Clear prediction cache when switching districts
      } catch (err) {
        console.error('Base analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseAnalytics();
  }, [selectedDistrictId, data?.id]);

  const fetchRolePrediction = async (roleToFetch, forceRefresh = false) => {
    if (!data) return;
    if (selectedDistrictId !== 'user_gps' && data.id !== selectedDistrictId) return;
    
    // If we already fetched this role and not forcing refresh, skip
    if (!forceRefresh && prediction && prediction[roleToFetch]) return;

    setLoadingRole(true);
    try {
      const predRes = await fetch(`/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: data, history, role: roleToFetch })
      });
      const predData = await predRes.json();
      
      // Ensure any fallback indicator returned by backend is retained
      setPrediction(prev => ({
        ...prev,
        isFallback: prev.isFallback || predData.isFallback,
        [roleToFetch]: predData[roleToFetch] || predData
      }));
    } catch (err) {
      console.error(`Role prediction fetch error (${roleToFetch}):`, err);
    } finally {
      setLoadingRole(false);
    }
  };

  // Effect 2: Lazy load per-role prediction when tab clicked
  useEffect(() => {
    if (loading) return;
    fetchRolePrediction(activeRole);
  }, [selectedDistrictId, data?.id, activeRole, loading]);

  // Anomaly polling — re-check every 60 s so breaches after page-open are caught
  useEffect(() => {
    if (!data) return;
    if (selectedDistrictId !== 'user_gps' && data.id !== selectedDistrictId) return;

    const pollAnomalies = async () => {
      try {
        let query = `?id=${selectedDistrictId}`;
        if (selectedDistrictId === 'user_gps' && data) {
          query = `?lat=${data.lat}&lng=${data.lng}`;
        }
        const res = await fetch(`/api/analytics/anomalies${query}`);
        const json = await res.json();
        if (Array.isArray(json)) setAnomalies(json);
      } catch (err) {
        console.error('Anomaly poll error:', err);
      }
    };

    const interval = setInterval(pollAnomalies, 60000); // every 60 s
    return () => clearInterval(interval);
  }, [selectedDistrictId, data?.id]);

  const FACTORY_COLOR = '#00ff88';

  const currentPred = prediction ? prediction[activeRole] : null;

  if (loading) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div className="marker-pulse" style={{ width: 60, height: 60, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
        <div style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '4px' }}>CALCULATING_ANALYTICS...</div>
      </div>
    );
  }

  const histMetrics = [
    { id: 'aqi',  label: 'AQI',    color: '#00f0ff' },
    { id: 'temp', label: 'TEMP',   color: '#ff3e3e' },
    { id: 'pm25', label: 'PM2.5',  color: '#ff9f9f' },
  ];
  const activeHistMetric = histMetrics.find(m => m.id === histMetric);
  const roleLabel = 'FACTORY_MSME';

  return (
    <div className="analytics-container" ref={reportRef} style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>PREDICTIVE_INTELLIGENCE_ENGINE</span>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
              LOCATION: {selectedDistrict.name.toUpperCase()} | 
              SCOPE: 24H_AUDIT | 
              ROLE: <span style={{ color: FACTORY_COLOR, fontWeight: 900 }}>{roleLabel}</span>
            </span>
          </div>
        </div>
        
        {/* PDF Export Status Indicator */}
        {exporting && (
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-cyan)', padding: '4px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="spin" style={{ width: 12, height: 12, border: '2px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>GENERATING_AUDIT_PDF: {roleLabel}...</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Pattern Analysis: 7-Day Trend */}
        <div className="widget" style={{ gridColumn: 'span 12', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} className="cyan" />
              <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>PATTERN_ANALYSIS_HISTORICAL</h2>
            </div>
            {/* Metric toggle for historical chart */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {histMetrics.map(m => (
                <button
                  key={m.id}
                  onClick={() => setHistMetric(m.id)}
                  style={{
                    background: histMetric === m.id ? `${m.color}22` : 'transparent',
                    border: `1px solid ${histMetric === m.id ? m.color : 'var(--border-color)'}`,
                    color: histMetric === m.id ? m.color : 'var(--text-secondary)',
                    padding: '4px 12px',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    borderRadius: '3px',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.5px'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '300px', minHeight: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorHistMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeHistMetric.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeHistMetric.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: `1px solid ${activeHistMetric.color}`, fontSize: '12px' }}
                  itemStyle={{ color: activeHistMetric.color }}
                />
                <Area type="monotone" dataKey={histMetric} stroke={activeHistMetric.color} fillOpacity={1} fill="url(#colorHistMetric)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Engine — Factory MSME */}
        <div className="widget" style={{ gridColumn: 'span 12', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} style={{ color: FACTORY_COLOR }} />
              <h2 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0, letterSpacing: '1px' }}>AI_PREDICTIVE_ENGINE — 6H FACTORY INTELLIGENCE</h2>
            </div>
<<<<<<< HEAD
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentPred?.isFallback && (
                <span style={{ background: 'rgba(255,184,0,0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', fontSize: '0.55rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>OFFLINE_MODE</span>
              )}
              <RefreshCw size={16} className={`cyan pointer ${loadingRole ? 'spin' : ''}`} onClick={() => !loadingRole && fetchRolePrediction(activeRole, true)} style={{ color: 'var(--accent-cyan)' }} />
=======
            
            {/* Two-line tabs container to guarantee DOE Auditor and ESG Officer tabs are on the second line */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {[
                  { id: 'construction', label: 'CONSTRUCTION' },
                  { id: 'government', label: 'GOVERNMENT' },
                  { id: 'msme', label: 'MSME_COMPLIANCE' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveRole(id)}
                    style={{
                      flex: 1,
                      background: activeRole === id ? roleColors[id] : 'transparent',
                      color: activeRole === id ? '#000' : '#888',
                      border: 'none',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      padding: '6px 14px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {[
                  { id: 'esgFirm', label: 'ESG_FIRM' },
                  { id: 'doeAuditor', label: 'DOE_AUDITOR' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveRole(id)}
                    style={{
                      flex: 1,
                      background: activeRole === id ? roleColors[id] : 'transparent',
                      color: activeRole === id ? '#000' : '#888',
                      border: 'none',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      padding: '6px 14px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
            </div>
          </div>

          {currentPred && !loadingRole ? (() => {
            const c = currentPred.computed || {};
            const n = currentPred.narrative || {};
            const bpColor = c.overallBreachProb >= 70 ? '#ff4d4d' : c.overallBreachProb >= 40 ? '#ffb800' : FACTORY_COLOR;

            return (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>

<<<<<<< HEAD
                {/* Row 1: Breach Probability + Peak Risk + Dispersion — 3 KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: `${bpColor}0d`, border: `1px solid ${bpColor}33`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.52rem', color: bpColor, fontWeight: 900, letterSpacing: '1px' }}>BREACH_PROBABILITY (4H)</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: bpColor, lineHeight: 1, fontFamily: 'JetBrains Mono' }}>
                      {c.overallBreachProb ?? '—'}<span style={{ fontSize: '1rem' }}>%</span>
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#aaa', lineHeight: '1.4' }}>
                      PM2.5: {c.pm25BreachProb}% &nbsp;|&nbsp; Heat: {c.hiBreachProb}%
                    </div>
                    {n.complianceVerdict && <p style={{ margin: '6px 0 0', fontSize: '0.6rem', color: '#ccc', lineHeight: '1.4' }}>{n.complianceVerdict}</p>}
                  </div>

                  <div style={{ background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.52rem', color: '#ff4d4d', fontWeight: 900, letterSpacing: '1px' }}>PEAK_RISK_WINDOW</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ff4d4d', fontFamily: 'JetBrains Mono', lineHeight: 1 }}>{c.pm25PeakTime || '—'}</div>
                    <div style={{ fontSize: '0.6rem', color: '#aaa' }}>PM2.5 peak: <span style={{ color: '#ff4d4d', fontWeight: 900 }}>{c.pm25AtPeak} µg/m³</span> {c.pm25AtPeak > c.PM25_LIMIT ? '⚠ BREACH' : '✓ within limit'}</div>
                    {n.peakRiskReason && <p style={{ margin: '6px 0 0', fontSize: '0.6rem', color: '#ccc', lineHeight: '1.4' }}>{n.peakRiskReason}</p>}
                  </div>

                  <div style={{ background: c.dispersionQuality === 'POOR' ? 'rgba(255,77,77,0.06)' : c.dispersionQuality === 'MODERATE' ? 'rgba(255,184,0,0.06)' : 'rgba(0,255,136,0.06)', border: `1px solid ${c.dispersionQuality === 'POOR' ? 'rgba(255,77,77,0.2)' : c.dispersionQuality === 'MODERATE' ? 'rgba(255,184,0,0.2)' : 'rgba(0,255,136,0.2)'}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.52rem', color: 'var(--text-secondary)', fontWeight: 900, letterSpacing: '1px' }}>EMISSION_DISPERSION</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: c.dispersionQuality === 'POOR' ? '#ff4d4d' : c.dispersionQuality === 'MODERATE' ? '#ffb800' : FACTORY_COLOR, lineHeight: 1 }}>{c.dispersionQuality || '—'}</div>
                    <div style={{ fontSize: '0.6rem', color: '#aaa' }}>Wind: <span style={{ fontWeight: 900 }}>{c.windSpeed} km/h</span> &nbsp;|&nbsp; Penalty: ×{(c.windPenalty || 1).toFixed(2)}</div>
                    {n.dispersionNarrative && <p style={{ margin: '6px 0 0', fontSize: '0.6rem', color: '#ccc', lineHeight: '1.4' }}>{n.dispersionNarrative}</p>}
                  </div>
                </div>

                {/* Row 2: PM2.5 6H Forecast Chart */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: FACTORY_COLOR, letterSpacing: '1px' }}>PM2.5_FORECAST — 6H PROJECTION (WHO 15 µg/m³ limit)</span>
                    {n.forecastSummary && (
                      <span style={{ fontSize: '0.62rem', color: '#bbb', maxWidth: '55%', textAlign: 'right', lineHeight: '1.3' }}>{n.forecastSummary}</span>
                    )}
                  </div>
                  <div style={{ height: '180px' }}>
                    <ResponsiveContainer width="99%" height="99%">
                      <LineChart data={c.chartData || []} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#555" fontSize={9} axisLine={false} tickLine={false} dy={6} />
                        <YAxis stroke="#555" fontSize={9} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: '#050a0e', border: '1px solid rgba(0,240,255,0.3)', fontSize: '11px' }} formatter={(v, name) => [v != null ? `${v} µg/m³` : '—', name === 'hist' ? 'Actual' : name === 'proj' ? 'Projected' : 'WHO Limit']} />
                        <ReferenceLine y={15} stroke="#ff4d4d" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'WHO 15', position: 'right', fontSize: 9, fill: '#ff4d4d' }} />
                        <Line type="monotone" dataKey="hist" stroke="#00f0ff" strokeWidth={2.5} dot={{ r: 3, fill: '#00f0ff' }} connectNulls={false} name="hist" />
                        <Line type="monotone" dataKey="proj" stroke={FACTORY_COLOR} strokeWidth={2} strokeDasharray="6 3" dot={(props) => {
                          const d = c.chartData?.[props.index];
                          if (!d || d.hist != null) return null;
                          return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill={d.breach ? '#ff4d4d' : FACTORY_COLOR} />;
                        }} connectNulls={false} name="proj" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {(c.pm25Forecast || []).some(p => p.breach) && (
                    <div style={{ marginTop: '8px', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '4px', padding: '6px 12px', fontSize: '0.58rem', color: '#ff4d4d', fontWeight: 900 }}>
                      {c.pm25BreachTime
                        ? `PROJECTED_BREACH: PM2.5 projected to exceed WHO 15 µg/m³ from ${c.pm25BreachTime} — DOE notification may be required under EQA 1974 Section 22`
                        : `ACTIVE_BREACH: PM2.5 already at ${c.currentPm25} µg/m³ (WHO limit 15 µg/m³) — DOE notification required under EQA 1974 Section 22`}
                    </div>
                  )}
                </div>

                {/* Row 3: Worker Safety Forecast + Pre-Emptive Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '20px' }}>

                  {/* Worker Safety Forecast */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '18px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '1px' }}>WORKER_SAFETY_FORECAST</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.5rem', color: '#888', fontWeight: 800, marginBottom: '4px' }}>HEAT INDEX NOW / PEAK</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>
                          <span style={{ color: c.currentHi >= 38 ? '#ff4d4d' : c.currentHi >= 33 ? '#ffb800' : FACTORY_COLOR }}>{c.currentHi}°C</span>
                          <span style={{ color: '#555', fontWeight: 400 }}> → </span>
                          <span style={{ color: c.hiAtPeak >= 38 ? '#ff4d4d' : c.hiAtPeak >= 33 ? '#ffb800' : FACTORY_COLOR }}>{c.hiAtPeak}°C</span>
                          <span style={{ fontSize: '0.6rem', color: '#666' }}> at {c.hiPeakTime}</span>
=======
                {/* Forecast Narrative */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '8px', borderLeft: `4px solid ${roleColors[activeRole]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: roleColors[activeRole], letterSpacing: '1px' }}>24H_FORECAST_NARRATIVE</span>
                    <span className={`badge ${currentPred.riskLevel === 'LOW' ? 'badge-success' : currentPred.riskLevel === 'MODERATE' ? '' : 'badge-danger'}`}
                      style={{ position: 'static', padding: '3px 10px', fontSize: '0.6rem', background: currentPred.riskLevel === 'MODERATE' ? 'rgba(255,184,0,0.2)' : undefined, color: currentPred.riskLevel === 'MODERATE' ? '#ffb800' : undefined, border: currentPred.riskLevel === 'MODERATE' ? '1px solid #ffb800' : undefined }}>
                      {currentPred.riskLevel}_RISK
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', margin: 0, lineHeight: '1.7', color: 'var(--text-secondary)' }}>{currentPred.forecast48h}</p>
                </div>

                {/* Risk Matrix */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '1px' }}>RISK_MATRIX_SCORES</div>
                  {currentPred.riskMatrix && Object.entries(currentPred.riskMatrix).map(([key, val]) => {
                    const score = Number(val) || 0;
                    const color = score >= 70 ? '#ff4d4d' : score >= 45 ? '#ffb800' : '#00ffcc';
                    return (
                      <div key={key} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, '_$1')}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color }}>{score}</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(score, 100)}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
                        </div>
                      </div>
                      {c.doshCrossingTime ? (
                        <div style={{ padding: '10px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.5rem', color: '#ffb800', fontWeight: 900, marginBottom: '4px' }}>DOSH THRESHOLD CROSSING</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffb800', fontFamily: 'JetBrains Mono' }}>{c.doshCrossingTime}</div>
                        </div>
                      ) : (
                        <div style={{ padding: '10px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.5rem', color: FACTORY_COLOR, fontWeight: 900, marginBottom: '4px' }}>DOSH STATUS</div>
                          <div style={{ fontSize: '0.6rem', color: FACTORY_COLOR }}>No threshold crossing projected</div>
                        </div>
                      )}
                      {n.workerSafetyForecast && (
                        <p style={{ margin: 0, fontSize: '0.62rem', color: '#bbb', lineHeight: '1.5' }}>{n.workerSafetyForecast}</p>
                      )}
                    </div>
                  </div>

<<<<<<< HEAD
                  {/* Pre-Emptive Actions */}
                  <div style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: '8px', padding: '18px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: FACTORY_COLOR, marginBottom: '14px', letterSpacing: '1px' }}>RECOMMENDED_PRE-EMPTIVE_ACTIONS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(n.preEmptiveActions || []).map((act, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(0,255,136,0.08)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <Clock size={11} style={{ color: FACTORY_COLOR }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', fontWeight: 900, color: FACTORY_COLOR, minWidth: '44px' }}>{act.time || '—'}</span>
=======
                {/* Hourly Outlook */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '1px' }}>24H_HOURLY_OUTLOOK</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(currentPred.hourlyOutlook || []).map((h, i) => {
                      const riskColor = h.risk === 'HIGH' ? '#ff4d4d' : h.risk === 'MODERATE' ? '#ffb800' : '#00ffcc';
                      return (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 900, color: riskColor, minWidth: '85px', fontFamily: 'JetBrains Mono' }}>{h.window}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', lineHeight: '1.4' }}>{h.condition}</span>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
                          </div>
                          <span style={{ fontSize: '0.67rem', color: '#ccc', lineHeight: '1.5' }}>{act.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 4: Heat Index 6H mini chart + PM2.5 forecast table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '18px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '1px' }}>HEAT_INDEX_FORECAST — 6H</div>
                    <div style={{ height: '120px' }}>
                      <ResponsiveContainer width="99%" height="99%">
                        <AreaChart data={c.hiForecast || []} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="hiGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ffb800" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="time" stroke="#555" fontSize={8} axisLine={false} tickLine={false} />
                          <YAxis stroke="#555" fontSize={8} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: '#050a0e', border: '1px solid rgba(255,184,0,0.3)', fontSize: '10px' }} formatter={v => [`${v}°C`, 'Heat Index']} />
                          <ReferenceLine y={33} stroke="#ffb800" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'DOSH 33°C', position: 'right', fontSize: 8, fill: '#ffb800' }} />
                          <ReferenceLine y={38} stroke="#ff4d4d" strokeDasharray="3 3" strokeWidth={1} label={{ value: '38°C', position: 'right', fontSize: 8, fill: '#ff4d4d' }} />
                          <Area type="monotone" dataKey="value" stroke="#ffb800" strokeWidth={2} strokeDasharray="5 2" fill="url(#hiGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '18px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '1px' }}>PM2.5_HOURLY_PROJECTION</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(c.pm25Forecast || []).map((p, i) => {
                        const pct = Math.min((p.value / (c.PM25_LIMIT * 2.5)) * 100, 100);
                        const col = p.breach ? '#ff4d4d' : p.value > c.PM25_LIMIT * 0.8 ? '#ffb800' : FACTORY_COLOR;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.58rem', color: '#666', minWidth: '40px' }}>{p.time}</span>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: col, minWidth: '54px', textAlign: 'right' }}>{p.value} µg/m³</span>
                            {p.breach && <span style={{ fontSize: '0.45rem', color: '#ff4d4d', fontWeight: 900 }}>BREACH</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
<<<<<<< HEAD
            );
          })() : (
=======

              {/* Bottom Row: Chain of Thought + Predicted Events + Technical Reasoning */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px' }}>

                {/* Chain of Thought */}
                <div style={{ background: `rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.04)`, padding: '18px', borderRadius: '8px', border: `1px solid rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.15)` }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: roleColors[activeRole], marginBottom: '14px', letterSpacing: '1px' }}>🧠 AI_THINKING_PROCESS — CHAIN OF THOUGHT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(currentPred.chainOfThought || []).map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: roleColors[activeRole], color: '#000', fontSize: '0.58rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted Events */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '1px' }}>CRITICAL_PREDICTED_EVENTS ({currentPred.predictedEvents?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(currentPred.predictedEvents || []).map((event, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', border: `1px solid rgba(${activeRole === 'construction' ? '255,184,0' : activeRole === 'government' ? '0,240,255' : '255,255,255'},0.08)` }}>
                        <Activity size={12} style={{ color: roleColors[activeRole], marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Reasoning */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '1px' }}>PREDICTIVE_TECHNICAL_REASONING</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7' }}>{currentPred.technicalReasoning}</p>
                </div>
              </div>
            </div>
          ) : (
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', gap: '12px' }}>
              <div className="marker-pulse" style={{ width: 32, height: 32, background: 'rgba(0, 255, 136, 0.1)', borderRadius: '50%' }}></div>
              <span style={{ fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
                {loadingRole ? 'COMPUTING_FACTORY_INTELLIGENCE...' : 'INITIALIZING_PREDICTIVE_MODEL...'}
              </span>
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
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} width={100} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-cyan)' }} />
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
              <div key={i} style={{ borderLeft: `3px solid ${anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800'}`, padding: '12px', background: 'var(--bg-secondary)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: anom.severity === 'CRITICAL' ? '#ff4d4d' : '#ffb800' }}>[{anom.severity}] {anom.type}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>{anom.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.7rem', margin: 0, color: 'var(--text-secondary)' }}>
                  VALUE: <b style={{ color: 'var(--text-primary)' }}>{anom.value}</b> | CAUSE: {anom.cause || anom.details}
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

<<<<<<< HEAD
=======
        {/* ── PREDICTIVE COMPLIANCE SCORING ── */}
        {(() => {
          const lastVal = history.length > 0 ? (history[history.length - 1]?.pm25 || 15) : 15;
          const firstVal = history.length > 1 ? (history[0]?.pm25 || 15) : lastVal;
          const WHO_LIMIT = 15;
          const dailyDelta = history.length > 1 ? (lastVal - firstVal) / history.length : 0;
          const proj30 = lastVal + dailyDelta * 30;
          const daysToBreachRaw = dailyDelta > 0 ? Math.ceil((WHO_LIMIT - lastVal) / dailyDelta) : null;
          const daysToBreachCapped = (daysToBreachRaw !== null && daysToBreachRaw > 0 && daysToBreachRaw < 90) ? daysToBreachRaw : null;

          const currentPm25 = data ? parseFloat(data.metrics?.pm25?.value || 15) : lastVal;
          const districtRisk = currentPm25 > 35 ? 'CRITICAL' : currentPm25 > 15 ? 'ELEVATED' : 'LOW';
          const riskColor = districtRisk === 'CRITICAL' ? '#ff4d4d' : districtRisk === 'ELEVATED' ? '#ffb800' : '#00ffcc';

          const projData = Array.from({ length: 6 }, (_, i) => {
            const day = Math.round((i / 5) * 30);
            return { day: `D+${day}`, pm25: parseFloat((lastVal + dailyDelta * day).toFixed(2)), limit: WHO_LIMIT };
          });

          const comparisonWithRisk = (comparison || []).slice(0, 8).map(d => {
            const risk = d.aqi > 150 ? 'CRITICAL' : d.aqi > 100 ? 'ELEVATED' : 'LOW';
            const trend = d.aqi > 80 ? '↑' : d.aqi > 50 ? '→' : '↓';
            return { ...d, risk, trend };
          });

          return (
            <>
              <div className="widget" style={{ gridColumn: 'span 12', padding: '20px', borderLeft: `4px solid ${riskColor}`, background: `rgba(${districtRisk === 'CRITICAL' ? '255,77,77' : districtRisk === 'ELEVATED' ? '255,184,0' : '0,255,204'},0.04)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Thermometer size={18} style={{ color: riskColor }} />
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>PREDICTIVE_COMPLIANCE_SCORING — 30-DAY FORWARD PROJECTION</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>DISTRICT_RISK</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: riskColor, lineHeight: 1 }}>{districtRisk}</div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>CURRENT_PM2.5</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>{currentPm25.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>µg/m³</span></div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>WHO_LIMIT</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00ffcc', lineHeight: 1 }}>15 <span style={{ fontSize: '0.7rem' }}>µg/m³</span></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div style={{ height: '160px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 800 }}>PM2.5_TRAJECTORY — 30-DAY FORWARD MODEL (WHO 15 µg/m³ limit shown)</div>
                    <ResponsiveContainer width="99%" height="90%">
                      <LineChart data={projData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#666" fontSize={9} axisLine={false} tickLine={false} />
                        <YAxis stroke="#666" fontSize={9} axisLine={false} tickLine={false} domain={[0, Math.max(WHO_LIMIT * 1.5, proj30 * 1.1)]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: `1px solid ${riskColor}`, fontSize: '11px' }} />
                        <Line type="monotone" dataKey="pm25" stroke={riskColor} strokeWidth={2} dot={{ r: 3, fill: riskColor }} name="Projected PM2.5" />
                        <Line type="monotone" dataKey="limit" stroke="#00ffcc" strokeWidth={1} strokeDasharray="4 4" dot={false} name="WHO Limit (15)" />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '0.6rem' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {daysToBreachCapped !== null ? (
                      <div style={{ padding: '12px', background: 'rgba(255,77,77,0.08)', borderRadius: '6px', border: '1px solid rgba(255,77,77,0.2)' }}>
                        <div style={{ fontSize: '0.6rem', color: '#ff4d4d', fontWeight: 900, marginBottom: '5px' }}>⚠ BREACH_FORECAST</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 900 }}>At current trajectory, this district will breach WHO PM2.5 limits in <span style={{ color: '#ff4d4d' }}>~{daysToBreachCapped} days</span></div>
                      </div>
                    ) : (
                      <div style={{ padding: '12px', background: 'rgba(0,255,204,0.06)', borderRadius: '6px', border: '1px solid rgba(0,255,204,0.15)' }}>
                        <div style={{ fontSize: '0.6rem', color: '#00ffcc', fontWeight: 900, marginBottom: '5px' }}>✓ TRAJECTORY_STABLE</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 900 }}>No WHO PM2.5 breach projected within 30-day window</div>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '5px' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>D+30 PROJECTION</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: proj30 > WHO_LIMIT ? '#ff4d4d' : '#00ffcc' }}>{proj30.toFixed(1)} µg/m³</div>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '5px' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>DAILY_TREND</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: dailyDelta > 0 ? '#ff4d4d' : '#00ffcc' }}>
                          {dailyDelta > 0 ? '↑' : dailyDelta < 0 ? '↓' : '→'} {Math.abs(dailyDelta).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {comparisonWithRisk.length > 0 && (
                <div className="widget" style={{ gridColumn: 'span 12', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Wind size={18} className="cyan" />
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>COMPLIANCE_RISK_SCORES — DIRECTIONAL (LOW / ELEVATED / CRITICAL)</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {comparisonWithRisk.map((d, i) => {
                      const c = d.risk === 'CRITICAL' ? '#ff4d4d' : d.risk === 'ELEVATED' ? '#ffb800' : '#00ffcc';
                      return (
                        <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', border: `1px solid rgba(${d.risk === 'CRITICAL' ? '255,77,77' : d.risk === 'ELEVATED' ? '255,184,0' : '0,255,204'},0.15)` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{d.name}</span>
                            <span style={{ color: c }}>{d.trend}</span>
                          </div>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: c, padding: '2px 6px', background: `rgba(${d.risk === 'CRITICAL' ? '255,77,77' : d.risk === 'ELEVATED' ? '255,184,0' : '0,255,204'},0.1)`, borderRadius: '3px', display: 'inline-block', marginBottom: '6px' }}>{d.risk}</span>
                          <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>AQI: <span style={{ color: c }}>{d.aqi}</span></div>
                          <div style={{ marginTop: '6px', height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min((d.aqi / 200) * 100, 100)}%`, background: c, borderRadius: '2px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        })()}

>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
      </div>
    </div>
  );
};

export default AnalyticsPage;

