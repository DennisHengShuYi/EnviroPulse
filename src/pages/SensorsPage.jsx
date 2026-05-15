import React, { useState, useEffect } from 'react';
import {
  Radio, Database, Cloud, Layout, CheckCircle2,
  Battery, Signal, Hash, Lock, Download,
  RefreshCw, X
} from 'lucide-react';

const SensorsPage = ({ districts }) => {
  const [auditLog, setAuditLog] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAuditLog = async (nodeId) => {
    if (!nodeId) return;
    setLoadingAudit(true);
    try {
      // Trigger a sensor data refresh
      fetch(`/api/sensors?id=${nodeId}`).catch(() => { });

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
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      fetchAuditLog(selectedNode);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!autoRefresh || !selectedNode || !isModalOpen) return;
    const interval = setInterval(() => fetchAuditLog(selectedNode), 8000);
    return () => clearInterval(interval);
  }, [selectedNode, autoRefresh, isModalOpen]);

  const handleExportLog = () => {
    if (!auditLog.length || !selectedNode) return;
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

  const openLog = (nodeId) => {
    setSelectedNode(nodeId);
    setIsModalOpen(true);
  };

  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      overflowY: 'auto',
      padding: '2rem',
      background: '#f8fafc', // Light gray background for the page
      color: '#1e293b'      // Dark slate text
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px', color: '#0f172a' }}>
            STATION_NETWORK_OPERATIONS
          </h2>
          <div style={{
            padding: '8px 15px',
            background: '#e0f2fe',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            fontWeight: 700
          }}>
            ACTIVE_NODES: <span>{districts?.length || 0}</span>
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div style={{
          padding: '40px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative' }}>
            {/* Connector Line */}
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '10%',
              right: '10%',
              height: '2px',
              background: '#e2e8f0',
              zIndex: 0
            }} />

            {[
              { icon: Radio, label: 'SENSOR_ARRAY', status: 'TRANSMITTING', color: '#0ea5e9' },
              { icon: Database, label: 'EDGE_COMPUTE', status: 'PROCESSING', color: '#8b5cf6' },
              { icon: Cloud, label: 'CLOUD_HUB', status: 'SYNCED', color: '#10b981' },
              { icon: Layout, label: 'DASHBOARD', status: 'ACTIVE', color: '#f59e0b' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 1, background: '#fff', padding: '0 15px' }}>
                <div style={{
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  border: `2px solid ${node.color}`,
                  boxShadow: `0 0 15px ${node.color}20`
                }}>
                  <node.icon size={30} color={node.color} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>{node.label}</div>
                  <div style={{ fontSize: '0.65rem', color: node.color, fontWeight: 700 }}>{node.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station List Table */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #f1f5f9',
            fontWeight: 800,
            fontSize: '0.75rem',
            color: '#64748b',
            background: '#f8fafc'
          }}>
            STATION_DIAGNOSTICS_MATRIX
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
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
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 800, color: '#0f172a' }}>STN_{d.id.toUpperCase()}</td>
                    <td style={{ padding: '15px 20px', color: '#475569' }}>{d.name}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                        <CheckCircle2 size={14} /> ONLINE
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Battery size={14} color={batt < 80 ? '#f59e0b' : '#0ea5e9'} />
                        <span>{batt}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Signal size={14} color="#0ea5e9" />
                        <span>-{sig} dBm</span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#94a3b8' }}>{ping}s AGO</td>
                    <td style={{ padding: '15px 20px' }}>
                      <button
                        onClick={() => openLog(d.id)}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          color: '#64748b',
                          padding: '6px 12px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                        onMouseOut={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
                      >
                        <Hash size={12} /> VIEW_LOG
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Audit Log Modal */}
        {isModalOpen && selectedNode && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', // Darker overlay for focus
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
          }} onClick={() => setIsModalOpen(false)}>
            <div
              style={{
                width: '90%', maxWidth: '900px', maxHeight: '85vh',
                background: '#fff', borderRadius: '16px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                    AUDIT_LOG — <span style={{ color: '#0ea5e9' }}>{selectedNode.toUpperCase()}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ background: autoRefresh ? '#f0f9ff' : 'transparent', border: '1px solid #e2e8f0', color: autoRefresh ? '#0ea5e9' : '#64748b', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={12} /> {autoRefresh ? 'LIVE' : 'PAUSED'}
                  </button>
                  <button onClick={handleExportLog} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={12} /> EXPORT
                  </button>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', cursor: 'pointer', borderRadius: '6px' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '20px', background: '#f8fafc', overflowY: 'auto', flex: 1, fontFamily: 'monospace' }}>
                {auditLog.map((entry, i) => (
                  <div key={i} style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', display: 'flex', gap: '15px', color: '#475569' }}>
                    <span style={{ color: '#94a3b8', minWidth: '150px' }}>[{entry.ts}]</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 700 }}>PM2.5: {entry.pm25}</span>
                    <span style={{ fontWeight: 700, color: entry.aqi > 100 ? '#ef4444' : '#10b981' }}>AQI: {entry.aqi}</span>
                    <span style={{ color: '#64748b' }}>HASH: {entry.hash.substring(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorsPage;