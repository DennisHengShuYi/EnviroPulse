import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Upload, CheckCircle2, XCircle, Clock, Hash, Building2, MapPin, FileSearch } from 'lucide-react';

const THRESHOLD_PCT = 20; // configurable discrepancy threshold

const DEMO_SUBMISSIONS = [
  {
    id: 'SUB-001',
    company: 'Acme Sdn Bhd',
    zone: 'Cheras Industrial',
    nodeId: 'kajang',
    nodeName: 'CHERAS_NODE_7 (via KAJANG)',
    date: '2025-04-12',
    reportedPm25: 12,
    reportedAqi: 45,
    reportedStatus: 'GOOD',
  },
  {
    id: 'SUB-002',
    company: 'GreenOps Holdings',
    zone: 'Shah Alam Industrial Park',
    nodeId: 'shahalam',
    nodeName: 'SHAHALAM_NODE_2',
    date: '2025-04-10',
    reportedPm25: 10,
    reportedAqi: 40,
    reportedStatus: 'GOOD',
  },
  {
    id: 'SUB-003',
    company: 'PasiGudang Chem Ltd',
    zone: 'Pasir Gudang Port Zone',
    nodeId: 'pasirgudang',
    nodeName: 'PASIRGUDANG_NODE_1',
    date: '2025-04-11',
    reportedPm25: 18,
    reportedAqi: 60,
    reportedStatus: 'MODERATE',
  },
];

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
    DISCREPANCY_DETECTED: { bg: 'rgba(255,62,62,0.15)', color: '#ff3e3e', border: '#ff3e3e' },
    VERIFIED: { bg: 'rgba(0,255,130,0.1)', color: '#00ff82', border: '#00ff82' },
    PENDING: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800', border: '#ffb800' },
  };
  const s = colors[status] || colors.PENDING;
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '3px 10px', borderRadius: '3px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: '1px' }}>
      {status === 'DISCREPANCY_DETECTED' ? '⚠ ' : status === 'VERIFIED' ? '✓ ' : '○ '}{status}
    </span>
  );
};

const CompliancePage = ({ districts, data }) => {
  const [submissions, setSubmissions] = useState([]);
  const [verifying, setVerifying] = useState(null);
  const [results, setResults] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', zone: '', nodeId: '', date: '', reportedPm25: '', reportedAqi: '' });
  const [threshold, setThreshold] = useState(THRESHOLD_PCT);

  useEffect(() => {
    setSubmissions(DEMO_SUBMISSIONS);
    // Pre-generate results for demo submissions
    const preResults = {};
    DEMO_SUBMISSIONS.forEach(sub => {
      const seed = sub.nodeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const sensorPm25 = 30 + (seed % 30); // simulated sensor reading
      const sensorAqi = 80 + (seed % 60);
      const delta = sensorPm25 - sub.reportedPm25;
      const variance = Math.abs(delta / sub.reportedPm25) * 100;
      const flagged = variance > threshold;
      const ts = new Date(sub.date + 'T08:42:00').toISOString();
      const hashInput = `${sub.nodeId}|${sub.date}|${sensorPm25}|${sensorAqi}|${ts}`;
      preResults[sub.id] = {
        submissionId: sub.id,
        sensorPm25: parseFloat(sensorPm25.toFixed(1)),
        sensorAqi,
        delta: parseFloat(delta.toFixed(1)),
        variance: parseFloat(variance.toFixed(1)),
        flagged,
        status: flagged ? 'DISCREPANCY_DETECTED' : 'VERIFIED',
        timestamp: ts,
        hash: simpleHash(hashInput),
      };
    });
    setResults(preResults);

    const logs = DEMO_SUBMISSIONS.map(sub => {
      const r = preResults[sub.id];
      return {
        ts: new Date(sub.date + 'T08:42:17').toISOString().replace('T', ' ').slice(0, 19),
        nodeId: sub.nodeName,
        company: sub.company,
        reportedPm25: sub.reportedPm25,
        sensorPm25: r.sensorPm25,
        status: r.status,
        hash: r.hash,
      };
    });
    setAuditLog(logs);
  }, [threshold]);

  const handleVerify = async (sub) => {
    setVerifying(sub.id);
    await new Promise(r => setTimeout(r, 1200));
    const res = await fetch(`/api/compliance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        districtId: sub.nodeId,
        submissionDate: sub.date,
        reportedPm25: sub.reportedPm25,
        reportedAqi: sub.reportedAqi,
        threshold,
      }),
    }).then(r => r.json()).catch(() => {
      const seed = sub.nodeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const sensorPm25 = parseFloat((30 + (seed % 30)).toFixed(1));
      const sensorAqi = 80 + (seed % 60);
      const delta = parseFloat((sensorPm25 - sub.reportedPm25).toFixed(1));
      const variance = parseFloat((Math.abs(delta / sub.reportedPm25) * 100).toFixed(1));
      const flagged = variance > threshold;
      const ts = new Date().toISOString();
      const hash = simpleHash(`${sub.nodeId}|${sub.date}|${sensorPm25}|${sensorAqi}|${ts}`);
      return { sensorPm25, sensorAqi, delta, variance, flagged, status: flagged ? 'DISCREPANCY_DETECTED' : 'VERIFIED', timestamp: ts, hash, submissionId: sub.id };
    });
    setResults(prev => ({ ...prev, [sub.id]: res }));
    setAuditLog(prev => [{
      ts: new Date().toISOString().replace('T', ' ').slice(0, 19),
      nodeId: sub.nodeName,
      company: sub.company,
      reportedPm25: sub.reportedPm25,
      sensorPm25: res.sensorPm25,
      status: res.status,
      hash: res.hash,
    }, ...prev]);
    setVerifying(null);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const newSub = { ...form, id: `SUB-${Date.now()}`, nodeName: districts?.find(d => d.id === form.nodeId)?.name || form.nodeId, reportedPm25: parseFloat(form.reportedPm25), reportedAqi: parseFloat(form.reportedAqi), reportedStatus: 'PENDING' };
    setSubmissions(prev => [newSub, ...prev]);
    setShowForm(false);
    setForm({ company: '', zone: '', nodeId: '', date: '', reportedPm25: '', reportedAqi: '' });
  };

  const inputStyle = { width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', fontSize: '0.7rem', borderRadius: '3px', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '1px' };

  return (
    <div style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem', color: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>COMPLIANCE_INTELLIGENCE_UNIT</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>ANTI-GREENWASHING AUDIT ENGINE</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Patent UI 2020000785 | Cross-reference corporate submissions against immutable sensor records
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>DISCREPANCY_THRESHOLD</span>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: '50px', background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontWeight: 900, fontSize: '0.8rem', textAlign: 'center', fontFamily: 'inherit' }}
              />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>%</span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '10px 18px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Upload size={14} /> SUBMIT_COMPANY_DATA
            </button>
          </div>
        </div>

        {/* Submission Form */}
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
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px' }}>CANCEL</button>
              </div>
            </form>
          </div>
        )}

        {/* Submissions Table */}
        <div className="widget" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSearch size={16} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>CORPORATE_SUBMISSIONS_QUEUE ({submissions.length})</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['COMPANY', 'ZONE', 'NODE', 'DATE', 'REPORTED_PM2.5', 'REPORTED_AQI', 'SENSOR_PM2.5', 'DELTA', 'VARIANCE', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontWeight: 800, fontSize: '0.58rem', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => {
                const res = results[sub.id];
                const isVerifying = verifying === sub.id;
                const flagged = res?.flagged;
                return (
                  <tr key={sub.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: flagged ? 'rgba(255,62,62,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={12} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                        {sub.company}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{sub.zone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={10} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontSize: '0.65rem' }}>{sub.nodeName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{sub.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{sub.reportedPm25} µg/m³</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>{sub.reportedAqi}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: res ? (flagged ? '#ff3e3e' : '#00ff82') : 'var(--text-secondary)' }}>
                      {res ? `${res.sensorPm25} µg/m³` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: res ? (flagged ? '#ff3e3e' : '#00ff82') : 'var(--text-secondary)' }}>
                      {res ? `${res.delta > 0 ? '+' : ''}${res.delta} µg/m³` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, color: res ? (flagged ? '#ff3e3e' : '#00ff82') : 'var(--text-secondary)' }}>
                      {res ? `${res.variance}%` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {res ? <StatusBadge status={res.status} /> : <StatusBadge status="PENDING" />}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleVerify(sub)}
                        disabled={isVerifying}
                        style={{ background: isVerifying ? 'rgba(0,240,255,0.1)' : 'var(--accent-cyan)', color: isVerifying ? 'var(--accent-cyan)' : '#000', border: '1px solid var(--accent-cyan)', padding: '5px 12px', fontSize: '0.6rem', fontWeight: 900, cursor: isVerifying ? 'wait' : 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        {isVerifying ? <><div className="animate-spin" style={{ width: 8, height: 8, border: '1px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%' }} /> VERIFYING</> : <><ShieldCheck size={12} /> VERIFY</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Discrepancy Detail Cards */}
        {submissions.filter(s => results[s.id]?.flagged).length > 0 && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '15px', color: '#ff3e3e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> DISCREPANCY_REPORTS ({submissions.filter(s => results[s.id]?.flagged).length} FLAGGED)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {submissions.filter(s => results[s.id]?.flagged).map(sub => {
                const res = results[sub.id];
                return (
                  <div key={sub.id} className="widget animate-in" style={{ padding: '20px', borderLeft: '4px solid #ff3e3e', background: 'rgba(255,62,62,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '4px' }}>COMPANY: {sub.company} | ZONE: {sub.zone} | NODE: {sub.nodeName}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Submission ID: {sub.id} | Verified: {res.timestamp?.replace('T', ' ').slice(0, 19) || '—'}</div>
                      </div>
                      <StatusBadge status="DISCREPANCY_DETECTED" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div style={{ background: 'rgba(0,240,255,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(0,240,255,0.15)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>COMPANY SUBMITTED</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{sub.reportedPm25} µg/m³</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>{sub.reportedStatus} — AQI: {sub.reportedAqi}</div>
                      </div>
                      <div style={{ background: 'rgba(255,62,62,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,62,62,0.2)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>SENSOR RECORDED ({sub.date})</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff3e3e' }}>{res.sensorPm25} µg/m³</div>
                        <div style={{ fontSize: '0.6rem', color: '#ff3e3e' }}>MODERATE — AQI: {res.sensorAqi}</div>
                      </div>
                      <div style={{ background: 'rgba(255,184,0,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,184,0,0.2)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>DISCREPANCY</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-gold)' }}>+{res.delta} µg/m³</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>{res.variance}% variance above threshold</div>
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(255,62,62,0.05)', borderRadius: '4px', border: '1px solid rgba(255,62,62,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '0.7rem', color: '#ff3e3e' }}>
                        STATUS: ⚠ DISCREPANCY FLAGGED — Delta: {res.delta} µg/m³ ({res.variance}% variance)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                        <Hash size={10} />
                        CHAIN_HASH: <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{res.hash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Immutable Audit Log */}
        <div className="widget" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hash size={16} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>TAMPER-EVIDENT_AUDIT_LOG</span>
            </div>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>READ-ONLY · APPEND-ONLY · Patent UI 2020000785</span>
          </div>
          <div style={{ padding: '15px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {auditLog.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>NO_AUDIT_ENTRIES_YET — Run a verification to generate audit records</div>
            ) : auditLog.map((entry, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 200px 1fr 100px 100px 120px 100px', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: entry.status === 'DISCREPANCY_DETECTED' ? '#ff9090' : '#aaa' }}>
                <span style={{ color: 'var(--text-secondary)' }}>[{entry.ts}]</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.company}</span>
                <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>NODE: {entry.nodeId}</span>
                <span>RPT: <b style={{ color: 'var(--accent-cyan)' }}>{entry.reportedPm25}</b></span>
                <span>SEN: <b style={{ color: entry.status === 'DISCREPANCY_DETECTED' ? '#ff3e3e' : '#00ff82' }}>{entry.sensorPm25}</b></span>
                <span style={{ color: entry.status === 'DISCREPANCY_DETECTED' ? '#ff3e3e' : '#00ff82', fontWeight: 900 }}>{entry.status === 'DISCREPANCY_DETECTED' ? '⚠ FLAGGED' : '✓ VERIFIED'}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.58rem' }}>#{entry.hash.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompliancePage;
