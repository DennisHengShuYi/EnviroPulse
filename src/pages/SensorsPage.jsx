import React from 'react';
import { Radio, Database, Cloud, Layout, CheckCircle2, XCircle, Battery, Signal } from 'lucide-react';

const SensorsPage = ({ districts }) => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>STATION_NETWORK_OPERATIONS</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 15px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0,240,255,0.2)' }}>
            ACTIVE_NODES: <span style={{ fontWeight: 800 }}>{districts?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Data Flow Visualization */}
      <div className="widget" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative' }}>
          {/* Animated Line connecting them */}
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, #00f0ff 0%, rgba(0,240,255,0.1) 100%)', zIndex: 0 }}></div>
          
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
      <div className="widget" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 800, fontSize: '0.7rem' }}>STATION_DIAGNOSTICS_MATRIX</div>
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 2 }}>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '15px 20px' }}>STATION_ID</th>
                <th style={{ padding: '15px 20px' }}>LOCATION</th>
                <th style={{ padding: '15px 20px' }}>STATUS</th>
                <th style={{ padding: '15px 20px' }}>BATTERY</th>
                <th style={{ padding: '15px 20px' }}>SIGNAL</th>
                <th style={{ padding: '15px 20px' }}>LAST_PING</th>
              </tr>
            </thead>
            <tbody>
              {districts?.map((d, i) => {
                const seed = d.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                const batt = 78 + (seed % 18);        // 78–95%, stable per station
                const sig = 45 + (seed % 30);         // 45 to 74 dBm, realistic IoT range
                const ping = 1 + (seed % 8);          // 1–8s ago
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SensorsPage;
