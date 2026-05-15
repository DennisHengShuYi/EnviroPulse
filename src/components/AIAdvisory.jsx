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
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Brain size={16} color="#0891b2" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', color: '#000000' }}>
              FACTORY_ADVISORY
            </span>
          </div>
          {advisoryData?.isFallback && (
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
              OFFLINE_MODE
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <RefreshCw
            size={14}
            style={{ cursor: 'pointer', color: '#333333' }}
            className={loading ? 'spin' : ''}
            onClick={fetchAdvisory}
          />
          <button
            onClick={toggleExpand}
            style={{ background: 'none', border: 'none', color: '#333333', cursor: 'pointer', padding: 0 }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <div className="marker-pulse" style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: '50%', border: '2px solid #e2e8f0' }}></div>
          <span style={{ fontSize: '0.6rem', color: '#000000', fontWeight: 700 }}>SYNTHESIZING_ADVICE...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '20px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#000000', marginBottom: '10px' }}>INFERENCE_PENDING</div>
          <button onClick={fetchAdvisory} style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#000000',
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
          <div style={{ border: `1px solid ${getStatusColor(workerStatus, 'worker')}22`, borderRadius: '12px', overflow: 'hidden', background: '#fcfcfc' }}>
            <div style={{ background: `${getStatusColor(workerStatus, 'worker')}10`, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: getStatusColor(workerStatus, 'worker') }}>WORKER_SAFETY</span>
              <span style={{
                background: getStatusColor(workerStatus, 'worker'),
                color: '#fff', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px'
              }}>
                {workerStatus}
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ padding: '10px', background: '#fff', borderLeft: `4px solid ${getStatusColor(workerStatus, 'worker')}`, borderRadius: '4px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#000000', lineHeight: '1.4' }}>
                  {advisoryData.workerProtocolNow}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.5rem', color: '#333333', fontWeight: 800, textTransform: 'uppercase' }}>PPE_Required</div>
                  <div style={{ fontSize: '0.65rem', color: '#000000', fontWeight: 700 }}>{advisoryData.workerPPESpec}</div>
                </div>
                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.5rem', color: '#333333', fontWeight: 800, textTransform: 'uppercase' }}>Rest_Cycle</div>
                  <div style={{ fontSize: '0.65rem', color: '#000000', fontWeight: 700 }}>{advisoryData.workerRestCycle}</div>
                </div>
              </div>
              {(advisoryData.workerActions || []).length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.5rem', color: '#333333', fontWeight: 800, marginBottom: '6px' }}>SAFETY_ACTIONS</div>
                  {advisoryData.workerActions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start' }}>
                      <span style={{ color: getStatusColor(workerStatus, 'worker'), fontWeight: 900, fontSize: '0.65rem', flexShrink: 0, minWidth: '12px' }}>{i + 1}</span>
                      <span style={{ fontSize: '0.65rem', color: '#000000', lineHeight: '1.4' }}>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Emission Mitigation */}
          <div style={{ border: `1px solid ${getStatusColor(emissionStatus, 'emission')}22`, borderRadius: '12px', overflow: 'hidden', background: '#fcfcfc' }}>
            <div style={{ background: `${getStatusColor(emissionStatus, 'emission')}10`, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: getStatusColor(emissionStatus, 'emission') }}>EMISSION_MITIGATION</span>
              <span style={{
                background: getStatusColor(emissionStatus, 'emission'),
                color: '#fff', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px'
              }}>
                {emissionStatus}
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ padding: '10px', background: '#fff', borderLeft: `4px solid ${getStatusColor(emissionStatus, 'emission')}`, borderRadius: '4px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#000000', lineHeight: '1.4' }}>
                  {advisoryData.primaryMitigationAction}
                </p>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#000000', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(advisoryData.emissionMitigationSteps || []).slice(0, 3).map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      background: getStatusColor(emissionStatus, 'emission'),
                      color: '#fff', width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.5rem', fontWeight: 900, flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ lineHeight: '1.4' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Verdict Footer */}
          <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px', padding: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#0369a1', fontWeight: 800, textAlign: 'center', letterSpacing: '0.3px' }}>
              {advisoryData.plainVerdict}
            </p>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default AIAdvisory;