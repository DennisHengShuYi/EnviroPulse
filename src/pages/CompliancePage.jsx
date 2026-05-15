import { useState } from 'react';
import { ShieldCheck, Hash, FileSearch, MapPin } from 'lucide-react';

const simpleHash = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

const StatusBadge = ({ status }) => {
  const colors = {
    VERIFIED: { bg: 'rgba(0,255,130,0.1)', color: '#00ff82', border: '#00ff82' },
    PENDING: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800', border: '#ffb800' },
  };
  const s = colors[status] || colors.PENDING;
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px', 
      fontSize: '0.6rem', 
      fontWeight: 900, 
      padding: '4px 8px', 
      borderRadius: '3px', 
      background: s.bg, 
      color: s.color, 
      border: `1px solid ${s.border}`, 
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
      width: 'fit-content'
    }}>
      {status === 'VERIFIED' ? '✓' : '○'} <span>{status}</span>
    </span>
  );
};

const CompliancePage = ({ districts, submissions, setSubmissions }) => {
  const [verifying, setVerifying] = useState(null);
  const [results, setResults] = useState({});
  const [toast, setToast] = useState(null);

  const handleVerify = async (sub) => {
    setVerifying(sub.id);
    
    // Simulate a brief processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const ts = new Date().toISOString();
    const hash = simpleHash(`${sub.nodeId}|${sub.date}|${sub.reportedPm25}|${ts}`);
    
    const res = { 
      status: 'VERIFIED', 
      timestamp: ts, 
      hash, 
      submissionId: sub.id 
    };

    setResults(prev => ({ ...prev, [sub.id]: res }));
    setVerifying(null);
    
    setToast({ type: 'success', message: `Submission for ${sub.company} verified and logged to audit chain.` });
    setTimeout(() => setToast(null), 3000);
  };
  const inputStyle = { width: '100%', background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-primary)', padding: '8px 10px', fontSize: '0.7rem', borderRadius: '3px', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '1px' };

  return (
    <div className="analytics-container" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

        {/* Header */}
        <div className="flex-row-responsive" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
              <ShieldCheck size={24} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>COMPLIANCE_INTELLIGENCE_UNIT</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>ANTI-GREENWASHING AUDIT ENGINE</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Audit Protocol v4.0.1 | Decentralized ledger verification for corporate environmental reports
            </p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="widget" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSearch size={16} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>CORPORATE_SUBMISSIONS_QUEUE ({submissions.length})</span>
          </div>
          {/* Desktop table */}
          <div className="compliance-table-desktop">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>ZONE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>NODE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>DATE</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>PM2.5</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>AQI</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const res = results[sub.id];
                  const isVerifying = verifying === sub.id;
                  const isDone = res && res.status === 'VERIFIED';
                  return (
                    <tr key={sub.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{sub.zone}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontSize: '0.6rem' }}>{sub.nodeName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{sub.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{sub.reportedPm25}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800 }}>{sub.reportedAqi}</td>
                      <td style={{ padding: '8px 12px' }}><StatusBadge status={res ? res.status : 'PENDING'} /></td>
                      <td style={{ padding: '8px 12px', width: '120px' }}>
                        <button onClick={() => handleVerify(sub)} disabled={isVerifying || isDone} style={{ background: isVerifying ? 'rgba(0,240,255,0.1)' : isDone ? 'rgba(0,255,130,0.1)' : 'var(--accent-cyan)', color: isVerifying ? 'var(--accent-cyan)' : isDone ? '#00ff82' : '#000', border: `1px solid ${isVerifying ? 'var(--accent-cyan)' : isDone ? '#00ff82' : 'var(--accent-cyan)'}`, padding: '6px 12px', fontSize: '0.55rem', fontWeight: 900, cursor: (isVerifying || isDone) ? 'not-allowed' : 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: isDone ? 0.7 : 1, transition: 'all 0.2s ease', width: '100%', whiteSpace: 'nowrap' }}>
                          {isVerifying ? (<><div className="animate-spin" style={{ width: 8, height: 8, border: '1px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%' }} /> VERIFYING</>) : isDone ? (<><ShieldCheck size={10} /> VERIFIED</>) : (<><ShieldCheck size={10} /> VERIFY</>)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — shows all data without horizontal scroll */}
          <div className="compliance-cards-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            {submissions.map((sub) => {
              const res = results[sub.id];
              const isVerifying = verifying === sub.id;
              const isDone = res && res.status === 'VERIFIED';
              return (
                <div key={sub.id} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-primary)' }}>{sub.zone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <MapPin size={9} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>{sub.nodeName}</span>
                      </div>
                    </div>
                    <StatusBadge status={res ? res.status : 'PENDING'} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.62rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span>DATE: <strong style={{ color: 'var(--text-primary)' }}>{sub.date}</strong></span>
                    <span>PM2.5: <strong style={{ color: 'var(--accent-cyan)' }}>{sub.reportedPm25}</strong></span>
                    <span>AQI: <strong style={{ color: 'var(--text-primary)' }}>{sub.reportedAqi}</strong></span>
                  </div>
                  <button
                    onClick={() => handleVerify(sub)}
                    disabled={isVerifying || isDone}
                    style={{ background: isVerifying ? 'rgba(0,240,255,0.1)' : isDone ? 'rgba(0,255,130,0.1)' : 'var(--accent-cyan)', color: isVerifying ? 'var(--accent-cyan)' : isDone ? '#00ff82' : '#000', border: `1px solid ${isVerifying ? 'var(--accent-cyan)' : isDone ? '#00ff82' : 'var(--accent-cyan)'}`, padding: '8px 14px', fontSize: '0.6rem', fontWeight: 900, cursor: (isVerifying || isDone) ? 'not-allowed' : 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px', opacity: isDone ? 0.7 : 1, transition: 'all 0.2s ease', width: '100%', justifyContent: 'center' }}
                  >
                    {isVerifying ? (<><div className="animate-spin" style={{ width: 8, height: 8, border: '1px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%' }} /> VERIFYING</>) : isDone ? (<><ShieldCheck size={10} /> VERIFIED</>) : (<><ShieldCheck size={10} /> VERIFY</>)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {toast && (
          <div style={{
            position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
            background: 'rgba(0,255,130,0.1)',
            border: '1px solid #00ff82',
            color: '#00ff82',
            padding: '16px 20px', borderRadius: '6px', maxWidth: '420px',
            fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            {toast.message}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompliancePage;

