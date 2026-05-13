import React, { useState, useEffect } from 'react';
import { Radio, Database, Cloud, Layout, CheckCircle2, Battery, Signal, Hash, Lock, Download, RefreshCw } from 'lucide-react';

const SensorsPage = ({ districts }) => {
  const [auditLog, setAuditLog] = useState([]);
  const [selectedNode, setSelectedNode] = useState('klcc');
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAuditLog = async (nodeId) => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/audit/log/${nodeId}?limit=20`);
      const json = await res.json();
      if (json.entries) setAuditLog(json.entries);
    } catch (err) {
      console.error('Audit log fetch error:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchAuditLog(selectedNode);
  }, [selectedNode]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchAuditLog(selectedNode), 8000);
    return () => clearInterval(interval);
  }, [selectedNode, autoRefresh]);

  const handleExportLog = () => {
    if (!auditLog.length) return;
    const lines = [`AUDIT_LOG — NODE: ${selectedNode.toUpperCase()} | Patent UI 2020000785 | EnviroPulse Node Network`];
    lines.push('─'.repeat(80));
    auditLog.forEach(e => {
      lines.push(`[${e.ts}] PM2.5: ${e.pm25} | AQI: ${e.aqi} | Heat: ${e.heat}°C | HASH: ${e.hash} | PREV: ${e.prevHash}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${selectedNode}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', padding: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>STATION_NETWORK_OPERATIONS</h2>
          <div style={{ padding: '8px 15px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0,240,255,0.2)' }}>
            ACTIVE_NODES: <span style={{ fontWeight: 800 }}>{districts?.length || 0}</span>
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div className="widget" style={{ padding: '40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, #00f0ff 0%, rgba(0,240,255,0.1) 100%)', zIndex: 0 }} />
            {[
              { icon: Radio, label: 'SENSOR_ARRAY', status: 'TRANSMITTING' },
              { icon: Database, label: 'EDGE_COMPUTE', status: 'PROCESSING' },
              { icon: Cloud, label: 'CLOUD_HUB', status: 'SYNCED' },
              { icon: Layout, label: 'DASHBOARD', status: 'ACTIVE' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 1, background: '#000', padding: '10px' }}>
                <div style={{ padding: '20px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '50%', border: '1px solid var(--accent-cyan)' }}>
                  <node.icon size={30} className="cyan" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{node.label}</div>
                  <div style={{ fontSize: '0.6rem', color: '#00ff82' }}>{node.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station List */}
        <div className="widget" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 800, fontSize: '0.7rem' }}>STATION_DIAGNOSTICS_MATRIX</div>
          <div style={{ overflowY: 'visible' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 2 }}>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '15px 20px' }}>STATION_ID</th>
                  <th style={{ padding: '15px 20px' }}>LOCATION</th>
                  <th style={{ padding: '15px 20px' }}>STATUS</th>
                  <th style={{ padding: '15px 20px' }}>BATTERY</th>
                  <th style={{ padding: '15px 20px' }}>SIGNAL</th>
                  <th style={{ padding: '15px 20px' }}>LAST_PING</th>
                  <th style={{ padding: '15px 20px' }}>AUDIT_LOG</th>
                </tr>
              </thead>
              <tbody>
                {districts?.map((d, i) => {
                  const seed = d.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                  const batt = 78 + (seed % 18);
                  const sig = 45 + (seed % 30);
                  const ping = 1 + (seed % 8);
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.02)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '15px 20px', fontWeight: 800 }}>STN_{d.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}</td>
                      <td style={{ padding: '15px 20px' }}>{d.name}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={14} style={{ color: '#00ff82' }} />
                          <span style={{ color: '#00ff82' }}>ONLINE</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Battery size={14} style={{ color: batt < 80 ? 'var(--accent-gold)' : 'var(--accent-cyan)' }} />
                          <span>{batt}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Signal size={14} className="cyan" />
                          <span>-{sig} dBm</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', color: 'var(--text-secondary)' }}>{ping}s AGO</td>
                      <td style={{ padding: '15px 20px' }}>
                        <button
                          onClick={() => setSelectedNode(d.id)}
                          style={{
                            background: selectedNode === d.id ? 'rgba(0,240,255,0.15)' : 'transparent',
                            border: `1px solid ${selectedNode === d.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`,
                            color: selectedNode === d.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            padding: '4px 10px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px',
                            display: 'flex', alignItems: 'center', gap: '5px'
                          }}
                        >
                          <Hash size={10} /> VIEW_LOG
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Immutable Audit Trail */}
        <div className="widget" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={14} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>
                AUDIT_LOG — NODE: <span style={{ color: 'var(--accent-cyan)' }}>{selectedNode.toUpperCase()}</span>
              </span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>READ-ONLY · APPEND-ONLY · Patent UI 2020000785</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{ background: autoRefresh ? 'rgba(0,240,255,0.1)' : 'transparent', border: `1px solid ${autoRefresh ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`, color: autoRefresh ? 'var(--accent-cyan)' : 'var(--text-secondary)', padding: '4px 10px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RefreshCw size={10} /> {autoRefresh ? 'LIVE' : 'PAUSED'}
              </button>
              <button
                onClick={handleExportLog}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '4px 10px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Download size={10} /> EXPORT_DOE
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loadingAudit && auditLog.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>FETCHING_AUDIT_CHAIN...</div>
            ) : auditLog.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>NO_ENTRIES — Select a node to view its audit chain</div>
            ) : auditLog.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', color: i === 0 ? '#fff' : '#888', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, minWidth: '145px' }}>[{entry.ts}]</span>
                <span>PM2.5: <b style={{ color: '#00f0ff' }}>{entry.pm25}</b></span>
                <span>|</span>
                <span>AQI: <b style={{ color: entry.aqi > 100 ? '#ff3e3e' : entry.aqi > 50 ? '#ffb800' : '#00ff82' }}>{entry.aqi}</b></span>
                <span>|</span>
                <span>Heat: <b style={{ color: entry.heat > 40 ? '#ff3e3e' : 'var(--accent-gold)' }}>{entry.heat}°C</b></span>
                <span>|</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.58rem' }}>HASH: <span style={{ color: 'var(--accent-cyan)' }}>{entry.hash}</span></span>
                {i === 0 && <span style={{ fontSize: '0.55rem', background: 'rgba(0,255,130,0.1)', color: '#00ff82', padding: '1px 6px', borderRadius: '2px', border: '1px solid rgba(0,255,130,0.2)' }}>LATEST</span>}
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Verified by: EnviroPulse Node Network | Patent UI 2020000785</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{auditLog.length} entries displayed</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SensorsPage;
