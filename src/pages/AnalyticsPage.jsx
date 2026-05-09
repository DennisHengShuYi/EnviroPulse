import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell
} from 'recharts';
import { 
  TrendingUp, Activity, Layers, AlertTriangle, Download, ChevronLeft, 
  MapPin, Clock, ShieldAlert, Zap, Thermometer, Wind, BrainCircuit
} from 'lucide-react';

const AnalyticsPage = ({ onBack, selectedDistrictId, districts, data }) => {
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const selectedDistrict = districts?.find(d => d.id === selectedDistrictId) || districts?.[0] || { name: 'KUALA LUMPUR', id: 'klcc' };

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

  const handlePredict = async () => {
    setPredicting(true);
    setPrediction(null);
    try {
      const response = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sensorData: data, 
          history: history 
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || 'PREDICTION_ENGINE_OFFLINE');
      setPrediction(result);
    } catch (err) {
      console.error('Prediction error:', err);
      setPrediction({ error: err.message });
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
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
    <div className="analytics-container" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', background: '#000', color: '#fff' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
            <Activity size={16} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px' }}>ENVIRONMENTAL_INTELLIGENCE_REPORT</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px' }}>{selectedDistrict.name}_ANALYTICS</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={handlePredict} disabled={predicting} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '10px 20px', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={16} className={predicting ? 'animate-spin' : ''} />
            {predicting ? 'RUNNING_MODELS...' : 'RUN_PREDICTIVE_SIM'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Pattern Analysis: 7-Day Trend */}
        <div className="widget" style={{ gridColumn: 'span 8', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} className="cyan" />
              <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>7-DAY_HISTORICAL_TREND_ANALYSIS</h2>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 8, height: 8, background: '#00f0ff' }}></div><span style={{ fontSize: '0.6rem' }}>AQI</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 8, height: 8, background: '#ffb800' }}></div><span style={{ fontSize: '0.6rem' }}>TEMP</span></div>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#050505', border: '1px solid var(--accent-cyan)', color: '#fff' }} />
                <Area type="monotone" dataKey="aqi" stroke="#00f0ff" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={3} />
                <Line type="monotone" dataKey="temp" stroke="#ffb800" strokeWidth={2} dot={{ fill: '#ffb800' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Panel */}
        <div className="widget" style={{ gridColumn: 'span 4', padding: '20px', background: 'rgba(0, 240, 255, 0.02)', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Zap size={18} className="gold" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>AI_PREDICTIVE_ENGINE</h2>
          </div>
          {prediction ? (
            prediction.error ? (
              <div style={{ padding: '20px', border: '1px solid var(--accent-red)', background: 'rgba(255, 77, 77, 0.05)', color: 'var(--accent-red)', fontSize: '0.7rem' }}>
                <div style={{ fontWeight: 800, marginBottom: '5px' }}>SIMULATION_FAILED</div>
                <p style={{ margin: 0 }}>{prediction.error}</p>
                <button onClick={handlePredict} style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '5px 10px', cursor: 'pointer' }}>RETRY_SIM</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ padding: '15px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>FUTURE_RISK_LEVEL</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: prediction.riskLevel === 'HIGH' ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>{prediction.riskLevel}</div>
                </div>
                <p style={{ fontSize: '0.75rem', lineHeight: '1.4', margin: 0 }}>{prediction.summary}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PREDICTED_ENVIRONMENTAL_EVENTS:</span>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '15px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {prediction.predictedEvents && prediction.predictedEvents.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px', opacity: 0.5 }}>
              <BrainCircuit size={40} style={{ marginBottom: '15px' }} />
              <p style={{ fontSize: '0.7rem' }}>RUN PREDICTIVE SIMULATION TO GENERATE FUTURE TRENDS FOR {selectedDistrict.name}</p>
            </div>
          )}
        </div>

        {/* City Ranking Comparison */}
        <div className="widget" style={{ gridColumn: 'span 6', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Layers size={18} className="cyan" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>DISTRICT_RANKING (AQI_LEVELS)</h2>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison.slice(0, 10)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 10 }} width={100} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#050505', border: '1px solid var(--accent-cyan)' }} />
                <Bar dataKey="aqi" radius={[0, 4, 4, 0]}>
                  {comparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.aqi > 100 ? 'var(--accent-red)' : entry.aqi > 50 ? 'var(--accent-gold)' : 'var(--accent-cyan)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threshold Log */}
        <div className="widget" style={{ gridColumn: 'span 6', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ShieldAlert size={18} className="red" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>THRESHOLD_EXCEEDANCE_LOG (WHO/DOE)</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#111' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>POLLUTANT</th>
                  <th>RECORDED</th>
                  <th>LIMIT</th>
                  <th>DEVIATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: 'PM2.5', v: '16.07', l: '15.0', d: '+7.1%', s: 'BREACH' },
                  { p: 'HEAT', v: '42.1', l: '40.0', d: '+5.2%', s: 'CRITICAL' },
                  { p: 'NO2', v: '24.0', l: '21.0', d: '+14.2%', s: 'BREACH' },
                  { p: 'SO2', v: '18.2', l: '15.0', d: '+21.3%', s: 'CRITICAL' },
                  { p: 'O3', v: '52.1', l: '51.0', d: '+2.1%', s: 'BREACH' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 800 }} className="cyan">{row.p}</td>
                    <td>{row.v}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.l}</td>
                    <td style={{ color: row.s === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)' }}>{row.d}</td>
                    <td><span className={`badge ${row.s === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ position: 'static' }}>{row.s}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Detection Highlights */}
        <div className="widget" style={{ gridColumn: 'span 12', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle size={18} className="gold" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, margin: 0 }}>ANOMALY_DETECTION_MATRIX</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {anomalies.length > 0 ? anomalies.map((anom, i) => (
              <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${anom.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)'}` }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: anom.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)', marginBottom: '5px' }}>[{anom.severity}] {anom.type}</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '5px' }}>VALUE: {anom.value}</div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}><b>CAUSE:</b> {anom.cause}</p>
              </div>
            )) : (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>NO_ANOMALIES_DETECTED_FOR_CURRENT_BASELINE</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
