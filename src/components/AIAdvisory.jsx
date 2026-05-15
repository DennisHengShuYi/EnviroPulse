import { useState, useEffect } from 'react';
import { Brain, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

const AIAdvisory = ({ data, history }) => {
  const [loading, setLoading] = useState(false);
  const [advisoryData, setAdvisoryData] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeRole = 'factoryMsme';

  const fetchAdvisory = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: data, role: activeRole, history: history || [] }),
        signal: controller.signal
      });
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.details || result?.error || 'AI_OFFLINE');
        const roleData = result[activeRole] || result;
        setAdvisoryData(roleData);
      } else {
        throw new Error(response.status === 502 || response.status === 504 ? 'GATEWAY_TIMEOUT' : 'SERVER_ERROR');
      }
    } catch (err) {
      console.error(`Advisor fetch error:`, err);
      setError(err.name === 'AbortError' ? 'REQUEST_TIMEOUT' : err.message);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [data?.id]);

  if (!data) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getStatusColor = (status, type) => {
    const s = status?.toUpperCase();
    if (type === 'worker') {
      if (s === 'DANGER' || s === 'STOP_WORK') return '#ff6400';
      if (s === 'CAUTION') return '#ffb800';
      return '#00ff88';
    } else {
      if (s === 'BREACH' || s === 'ELEVATED') return '#ff4d4d';
      if (s === 'MODERATE') return '#ffb800';
      return '#00ff88';
    }
  };

  const containerStyle = isExpanded ? {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
    background: 'rgba(5, 10, 20, 0.98)', padding: '40px', display: 'flex', flexDirection: 'column',
    backdropFilter: 'blur(10px)', overflowY: 'auto'
  } : {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    height: '100%',
    overflowY: 'auto',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    background: 'rgba(10, 10, 10, 0.6)',
    borderRadius: '4px',
  };

  return (
    <div className="widget" style={containerStyle}>
      {/* Header with Fix for Overlap */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Brain size={14} className="cyan" />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
              FACTORY_ADVISORY
            </span>
          </div>
          {advisoryData?.isFallback && (
            <div style={{ 
              display: 'inline-block',
              background: 'rgba(255, 184, 0, 0.1)', 
              color: 'var(--accent-gold)', 
              border: '1px solid rgba(255, 184, 0, 0.3)', 
              fontSize: '0.45rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '2px',
              width: 'fit-content'
            }}>
              OFFLINE_MODE
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw 
            size={12} 
            className={`cyan pointer ${loading ? 'spin' : ''}`} 
            onClick={fetchAdvisory} 
          />
          <button 
            onClick={toggleExpand}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <div className="marker-pulse" style={{ width: 30, height: 30, background: 'rgba(0, 240, 255, 0.15)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', letterSpacing: '1px', fontWeight: 800 }}>
            SYNTHESIZING...
          </span>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', padding: '8px 0' }}>
          {/* Top: structured pending state */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div className="marker-pulse" style={{ width: 36, height: 36, background: 'rgba(0, 240, 255, 0.08)', borderRadius: '50%', border: '1px solid rgba(0,240,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--accent-cyan)' }}>FACTORY_ADVISORY</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '1px' }}>INFERENCE_PENDING</div>
              <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                Connecting to LLM inference engine...
              </div>
            </div>
          </div>
          {/* Bottom: retry */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={fetchAdvisory} style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.2)',
              color: 'var(--accent-cyan)',
              padding: '4px 16px',
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)'
            }}>↺ RETRY</button>
          </div>
        </div>
      ) : advisoryData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Section 1: Worker Safety */}
          <div style={{ border: `1px solid ${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}33`, borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ background: `${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}10`, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: getStatusColor(advisoryData.workerSafetyStatus, 'worker') }}>WORKER_SAFETY</span>
              <span style={{ 
                background: getStatusColor(advisoryData.workerSafetyStatus, 'worker'), 
                color: '#000', fontSize: '0.45rem', fontWeight: 900, padding: '1px 5px', borderRadius: '2px' 
              }}>
                {advisoryData.workerSafetyStatus}
              </span>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}`, borderRadius: '2px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>
                  {advisoryData.workerProtocolNow}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '0.45rem', color: 'var(--text-secondary)', fontWeight: 800 }}>PPE</div>
                  <div style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>{advisoryData.workerPPESpec}</div>
                </div>
                <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '0.45rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CYCLE</div>
                  <div style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>{advisoryData.workerRestCycle}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Emission Mitigation */}
          <div style={{ border: `1px solid ${getStatusColor(advisoryData.emissionStatus, 'emission')}33`, borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ background: `${getStatusColor(advisoryData.emissionStatus, 'emission')}10`, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: getStatusColor(advisoryData.emissionStatus, 'emission') }}>EMISSION_MITIGATION</span>
              <span style={{ 
                background: getStatusColor(advisoryData.emissionStatus, 'emission'), 
                color: '#000', fontSize: '0.45rem', fontWeight: 900, padding: '1px 5px', borderRadius: '2px' 
              }}>
                {advisoryData.emissionStatus}
              </span>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${getStatusColor(advisoryData.emissionStatus, 'emission')}`, borderRadius: '2px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>
                  {advisoryData.primaryMitigationAction}
                </p>
              </div>
              <div style={{ fontSize: '0.6rem', color: '#ccc', marginBottom: '4px' }}>
                {(advisoryData.emissionMitigationSteps || []).slice(0, 2).map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ color: getStatusColor(advisoryData.emissionStatus, 'emission'), fontWeight: 900 }}>{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Verdict Footer */}
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.1)', borderRadius: '4px', padding: '6px' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 800, textAlign: 'center' }}>
              {advisoryData.plainVerdict}
            </p>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default AIAdvisory;
