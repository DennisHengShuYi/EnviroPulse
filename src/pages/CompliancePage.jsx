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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', zone: '', nodeId: '', date: '', reportedPm25: '', reportedAqi: '' });
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

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const newSub = { ...form, id: `SUB-${Date.now()}`, nodeName: Array.isArray(districts) ? districts.find(d => d.id === form.nodeId)?.name : form.nodeId, reportedPm25: parseFloat(form.reportedPm25), reportedAqi: parseFloat(form.reportedAqi), reportedStatus: 'PENDING' };
    setSubmissions(prev => [newSub, ...prev]);
    setShowForm(false);
    setForm({ company: '', zone: '', nodeId: '', date: '', reportedPm25: '', reportedAqi: '' });
  };

  const inputStyle = { width: '100%', background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-primary)', padding: '8px 10px', fontSize: '0.7rem', borderRadius: '3px', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '1px' };

  return (
    <div style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
          <button 
            onClick={() => setShowForm(true)}
            style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '8px 16px', fontWeight: 900, fontSize: '0.65rem', cursor: 'pointer', borderRadius: '3px', letterSpacing: '1px' }}
          >
            NEW_SUBMISSION
          </button>
        </div>

        {showForm && (
          <div className="widget animate-in" style={{ padding: '25px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px' }}>COMPANY_COMPLIANCE_SUBMISSION_FORM</div>
            <form onSubmit={handleSubmitForm}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                <div><label style={labelStyle}>COMPANY_NAME</label><input required style={inputStyle} value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} placeholder="Acme Sdn Bhd" /></div>
                <div><label style={labelStyle}>INDUSTRIAL_ZONE</label><input required style={inputStyle} value={form.zone} onChange={e => setForm(p => ({...p, zone: e.target.value}))} placeholder="Cheras Industrial" /></div>
                <div>
                  <label style={labelStyle}>NEAREST_NODE</label>
                  <select required style={inputStyle} value={form.nodeId} onChange={e => setForm(p => ({...p, nodeId: e.target.value}))}>
                    <option value="">Select district node...</option>
                    {districts?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>SUBMISSION_DATE</label><input required type="date" style={inputStyle} value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} /></div>
                <div><label style={labelStyle}>REPORTED_PM2.5 (µg/m³)</label><input required type="number" step="0.1" style={inputStyle} value={form.reportedPm25} onChange={e => setForm(p => ({...p, reportedPm25: e.target.value}))} placeholder="12.0" /></div>
                <div><label style={labelStyle}>REPORTED_AQI</label><input required type="number" style={inputStyle} value={form.reportedAqi} onChange={e => setForm(p => ({...p, reportedAqi: e.target.value}))} placeholder="45" /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px' }}>SUBMIT_FOR_VERIFICATION</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-primary)', padding: '10px 20px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px' }}>CANCEL</button>
              </div>
            </form>
          </div>
        )}

        {/* Submissions Table */}
        <div className="widget" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSearch size={16} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>CORPORATE_SUBMISSIONS_QUEUE ({submissions.length})</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  {['ZONE', 'NODE', 'DATE', 'PM2.5', 'AQI', 'STATUS', 'ACTION'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const res = results[sub.id];
                  const isVerifying = verifying === sub.id;
                  const isDone = res && res.status === 'VERIFIED';
                  return (
                    <tr key={sub.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{sub.zone}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontSize: '0.6rem' }}>{sub.nodeName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{sub.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{sub.reportedPm25}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800 }}>{sub.reportedAqi}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <StatusBadge status={res ? res.status : 'PENDING'} />
                      </td>
                      <td style={{ padding: '8px 12px', width: '120px' }}>
                        <button
                          onClick={() => handleVerify(sub)}
                          disabled={isVerifying || isDone}
                          style={{ 
                            background: isVerifying ? 'rgba(0,240,255,0.1)' : 
                                        isDone ? 'rgba(0,255,130,0.1)' :
                                        'var(--accent-cyan)', 
                            color: isVerifying ? 'var(--accent-cyan)' : 
                                   isDone ? '#00ff82' :
                                   '#000', 
                            border: `1px solid ${isVerifying ? 'var(--accent-cyan)' : 
                                               isDone ? '#00ff82' :
                                               'var(--accent-cyan)'}`, 
                            padding: '6px 12px', 
                            fontSize: '0.55rem', 
                            fontWeight: 900, 
                            cursor: (isVerifying || isDone) ? 'not-allowed' : 'pointer', 
                            borderRadius: '2px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '4px',
                            opacity: isDone ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                            width: '100%',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isVerifying ? (
                            <><div className="animate-spin" style={{ width: 8, height: 8, border: '1px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%' }} /> VERIFYING</>
                          ) : isDone ? (
                            <><ShieldCheck size={10} /> VERIFIED</>
                          ) : (
                            <><ShieldCheck size={10} /> VERIFY</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

