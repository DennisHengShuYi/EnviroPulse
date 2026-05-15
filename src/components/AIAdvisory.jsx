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

<<<<<<< HEAD
  const normalizeWorkerStatus = (raw) => {
    const s = (raw || '').toUpperCase();
    if (s === 'STOP_WORK' || s.includes('STOP') || s.includes('HENTIKAN')) return 'STOP_WORK';
    if (s === 'DANGER' || s.includes('DANGER') || s.includes('BAHAYA') || s.includes('HIGH RISK')) return 'DANGER';
    if (s === 'CAUTION' || s.includes('CAUTION') || s.includes('AWAS')) return 'CAUTION';
    return 'SAFE';
  };

  const normalizeEmissionStatus = (raw) => {
    const s = (raw || '').toUpperCase();
    if (s === 'BREACH' || s.includes('BREACH') || s.includes('CRITICAL')) return 'BREACH';
    if (s === 'ELEVATED' || s.includes('ELEVATED')) return 'ELEVATED';
    if (s === 'MODERATE' || s.includes('MODERATE')) return 'MODERATE';
    return 'CONTROLLED';
  };

=======
  // Status colors updated for better visibility on white backgrounds
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
  const getStatusColor = (status, type) => {
    const s = (status || '').toUpperCase();
    if (type === 'worker') {
      if (s === 'DANGER' || s === 'STOP_WORK') return '#e11d48'; // Richer Red
      if (s === 'CAUTION') return '#d97706'; // Darker Amber
      return '#059669'; // Emerald Green
    } else {
      if (s === 'BREACH' || s === 'ELEVATED') return '#e11d48';
      if (s === 'MODERATE') return '#d97706';
      return '#059669';
    }
  };

  const workerStatus = normalizeWorkerStatus(advisoryData?.workerSafetyStatus);
  const emissionStatus = normalizeEmissionStatus(advisoryData?.emissionStatus);

  const containerStyle = isExpanded ? {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
    background: '#ffffff', padding: '40px', display: 'flex', flexDirection: 'column',
    overflowY: 'auto'
  } : {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    height: '100%',
    overflowY: 'auto',
    border: '1px solid #e2e8f0', // Standard light border
    background: '#ffffff', // White background
    borderRadius: '16px', // Matches your ArcGauge
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Soft shadow
  };

  return (
<<<<<<< HEAD
    <div className="widget" style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Brain size={14} className="cyan" />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
              FACTORY ADVISOR
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
=======
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Brain size={16} color="#0891b2" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', color: '#0f172a' }}>
              FACTORY_ADVISORY
            </span>
          </div>
          {advisoryData?.isFallback && (
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
              OFFLINE_MODE
            </span>
          )}
        </div>
<<<<<<< HEAD
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw
            size={12}
            className={`cyan pointer ${loading ? 'spin' : ''}`}
=======
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <RefreshCw
            size={14}
            style={{ cursor: 'pointer', color: '#64748b' }}
            className={loading ? 'spin' : ''}
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
            onClick={fetchAdvisory}
          />
          <button
            onClick={toggleExpand}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {loading ? (
<<<<<<< HEAD
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <div className="marker-pulse" style={{ width: 30, height: 30, background: 'rgba(0, 240, 255, 0.15)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', letterSpacing: '1px', fontWeight: 800 }}>
            ANALYZING...
          </span>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', padding: '8px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div className="marker-pulse" style={{ width: 36, height: 36, background: 'rgba(0, 240, 255, 0.08)', borderRadius: '50%', border: '1px solid rgba(0,240,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--accent-cyan)' }}>FACTORY ADVISOR</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '1px' }}>CONNECTING...</div>
              <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                Connecting to AI inference engine...
              </div>
            </div>
          </div>
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
          <div style={{ border: `1px solid ${getStatusColor(workerStatus, 'worker')}33`, borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ background: `${getStatusColor(workerStatus, 'worker')}10`, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: getStatusColor(workerStatus, 'worker') }}>WORKER SAFETY</span>
              <span style={{
                background: getStatusColor(workerStatus, 'worker'),
                color: '#000', fontSize: '0.45rem', fontWeight: 900, padding: '1px 5px', borderRadius: '2px'
=======
        <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <div className="marker-pulse" style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: '50%', border: '2px solid #e2e8f0' }}></div>
          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>SYNTHESIZING_ADVICE...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '20px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '10px' }}>INFERENCE_PENDING</div>
          <button onClick={fetchAdvisory} style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#475569',
            padding: '6px 16px',
            fontSize: '0.6rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderRadius: '6px'
          }}>↺ RETRY_CONNECTION</button>
        </div>
      ) : advisoryData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Section 1: Worker Safety */}
          <div style={{ border: `1px solid ${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}22`, borderRadius: '12px', overflow: 'hidden', background: '#fcfcfc' }}>
            <div style={{ background: `${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}10`, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: getStatusColor(advisoryData.workerSafetyStatus, 'worker') }}>WORKER_SAFETY</span>
              <span style={{
                background: getStatusColor(advisoryData.workerSafetyStatus, 'worker'),
                color: '#fff', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px'
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
              }}>
                {workerStatus}
              </span>
            </div>
<<<<<<< HEAD
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${getStatusColor(workerStatus, 'worker')}`, borderRadius: '2px' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#fff', lineHeight: '1.5' }}>
                  {advisoryData.workerProtocolNow}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '0.42rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '2px' }}>PPE REQUIRED</div>
                  <div style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600, lineHeight: '1.4' }}>{advisoryData.workerPPESpec}</div>
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '0.42rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '2px' }}>WORK SCHEDULE</div>
                  <div style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600, lineHeight: '1.4' }}>{advisoryData.workerRestCycle}</div>
=======
            <div style={{ padding: '12px' }}>
              <div style={{ padding: '10px', background: '#fff', borderLeft: `4px solid ${getStatusColor(advisoryData.workerSafetyStatus, 'worker')}`, borderRadius: '4px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', lineHeight: '1.4' }}>
                  {advisoryData.workerProtocolNow}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>PPE_Required</div>
                  <div style={{ fontSize: '0.65rem', color: '#334155', fontWeight: 700 }}>{advisoryData.workerPPESpec}</div>
                </div>
                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Rest_Cycle</div>
                  <div style={{ fontSize: '0.65rem', color: '#334155', fontWeight: 700 }}>{advisoryData.workerRestCycle}</div>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
                </div>
              </div>
              {(advisoryData.workerActions || []).length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  <div style={{ fontSize: '0.42rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '4px' }}>SAFETY ACTIONS</div>
                  {advisoryData.workerActions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start' }}>
                      <span style={{ color: getStatusColor(workerStatus, 'worker'), fontWeight: 900, fontSize: '0.6rem', flexShrink: 0, minWidth: '12px' }}>{i + 1}</span>
                      <span style={{ fontSize: '0.6rem', color: '#ddd', lineHeight: '1.4' }}>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

<<<<<<< HEAD
          {/* Section 2: Emission Reduction */}
          <div style={{ border: `1px solid ${getStatusColor(emissionStatus, 'emission')}33`, borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ background: `${getStatusColor(emissionStatus, 'emission')}10`, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: getStatusColor(emissionStatus, 'emission') }}>EMISSION CONTROL</span>
              <span style={{
                background: getStatusColor(emissionStatus, 'emission'),
                color: '#000', fontSize: '0.45rem', fontWeight: 900, padding: '1px 5px', borderRadius: '2px'
=======
          {/* Section 2: Emission Mitigation */}
          <div style={{ border: `1px solid ${getStatusColor(advisoryData.emissionStatus, 'emission')}22`, borderRadius: '12px', overflow: 'hidden', background: '#fcfcfc' }}>
            <div style={{ background: `${getStatusColor(advisoryData.emissionStatus, 'emission')}10`, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: getStatusColor(advisoryData.emissionStatus, 'emission') }}>EMISSION_MITIGATION</span>
              <span style={{
                background: getStatusColor(advisoryData.emissionStatus, 'emission'),
                color: '#fff', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px'
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
              }}>
                {emissionStatus}
              </span>
            </div>
<<<<<<< HEAD
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${getStatusColor(emissionStatus, 'emission')}`, borderRadius: '2px' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#fff', lineHeight: '1.5' }}>
                  {advisoryData.primaryMitigationAction}
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.42rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '4px' }}>REDUCTION STEPS</div>
                {(advisoryData.emissionMitigationSteps || []).map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start' }}>
                    <span style={{ color: getStatusColor(emissionStatus, 'emission'), fontWeight: 900, fontSize: '0.6rem', flexShrink: 0, minWidth: '12px' }}>{i + 1}</span>
                    <span style={{ fontSize: '0.6rem', color: '#ddd', lineHeight: '1.4' }}>{step}</span>
=======
            <div style={{ padding: '12px' }}>
              <div style={{ padding: '10px', background: '#fff', borderLeft: `4px solid ${getStatusColor(advisoryData.emissionStatus, 'emission')}`, borderRadius: '4px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', lineHeight: '1.4' }}>
                  {advisoryData.primaryMitigationAction}
                </p>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(advisoryData.emissionMitigationSteps || []).slice(0, 2).map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      background: getStatusColor(advisoryData.emissionStatus, 'emission'),
                      color: '#fff', width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.5rem', fontWeight: 900, flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ lineHeight: '1.4' }}>{step}</span>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
                  </div>
                ))}
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Verdict Footer */}
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.1)', borderRadius: '4px', padding: '6px' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 800, textAlign: 'center' }}>
=======
          {/* Compact Verdict Footer */}
          <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px', padding: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#0369a1', fontWeight: 800, textAlign: 'center', letterSpacing: '0.3px' }}>
>>>>>>> 67164171d71fb9adb9fb4372967e16d31403cf6a
              {advisoryData.plainVerdict}
            </p>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default AIAdvisory;