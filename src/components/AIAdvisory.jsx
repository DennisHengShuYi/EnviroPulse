import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, ArrowRight, Sun, Wind, AlertCircle } from 'lucide-react';

const AIAdvisory = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdvisory = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: data })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || 'AI_OFFLINE');
      setAdvisory(result);
    } catch (err) {
      console.error('Advisor fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [data?.id]); // Refetch when district changes

  if (!data) return null;

  return (
    <div className="widget" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', minHeight: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={14} className="cyan" />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>AI_HEALTH_ADVISORY</span>
        </div>
        <RefreshCw 
          size={12} 
          className={`cyan ${loading ? 'animate-spin' : ''}`} 
          style={{ cursor: 'pointer' }} 
          onClick={fetchAdvisory}
        />
      </div>

      {loading ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <div className="marker-pulse" style={{ width: 24, height: 24, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>ANALYZING_LIVE_DELTA...</span>
        </div>
      ) : error ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{error}</span>
          <button onClick={fetchAdvisory} style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.5rem', padding: '2px 8px', cursor: 'pointer' }}>RETRY</button>
        </div>
      ) : advisory ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          overflowY: 'auto',
          maxHeight: '350px',
          paddingRight: '5px'
        }}>
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '10px', border: '1px solid rgba(0, 240, 255, 0.1)', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span className={`badge ${advisory.riskLevel === 'LOW' ? 'badge-success' : 'badge-warning'}`} style={{ position: 'static', padding: '2px 4px', fontSize: '0.5rem' }}>
                {advisory.riskLevel}_RISK
              </span>
              <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>MODEL: ILMU-GLM-5.1</span>
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', lineHeight: '1.2', margin: 0 }}>
              {advisory.summary}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Sun size={14} className="gold" />
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>HEAT_ADVISORY</div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0 }}>{advisory.heatAdvisory}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Wind size={14} className="cyan" />
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>AQ_ADVISORY</div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0 }}>{advisory.aqAdvisory}</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '5px' }}>ACTIONABLE_STEPS:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {advisory.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem' }}>
                  <ArrowRight size={10} className="cyan" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={fetchAdvisory} style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '5px 15px', fontWeight: 800, fontSize: '0.6rem', cursor: 'pointer' }}>GENERATE_ADVISORY</button>
        </div>
      )}
    </div>
  );
};

export default AIAdvisory;
