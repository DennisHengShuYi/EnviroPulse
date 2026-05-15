import React from 'react';

const ComplianceHeatmap = ({ history = [] }) => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const entry = history[history.length - 24 + i];
    if (!entry) return { status: 'none', label: `${i}:00` };

    const pm25 = parseFloat(entry.pm25);
    const aqi = parseFloat(entry.aqi);

    let status = 'green';
    if (pm25 > 15 || aqi > 100) status = 'red';
    else if (aqi > 50) status = 'amber';

    return { status, label: entry.ts ? entry.ts.split(' ')[1].slice(0, 5) : `${i}:00` };
  });

  const getColor = (status) => {
    switch (status) {
      case 'red':   return 'var(--accent-red)';
      case 'amber': return 'var(--accent-gold)';
      case 'green': return '#00ff82';
      default:      return 'rgba(255,255,255,0.05)';
    }
  };

  return (
    <div className="widget" style={{ padding: '14px 16px' }}>
      {/* Header — legend on LEFT, title on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        {/* Legend first (left side) */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.55rem', fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', background: '#00ff82', borderRadius: '2px' }} /> SAFE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--accent-gold)', borderRadius: '2px' }} /> CAUTION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--accent-red)', borderRadius: '2px' }} /> BREACH
          </div>
        </div>
        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1px' }}>
          24H_COMPLIANCE_HEATMAP
        </div>
      </div>

      {/* Hour cells — taller for readability */}
      <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
        {hours.map((h, i) => (
          <div
            key={i}
            title={`Hour ${i}:00 — ${h.status.toUpperCase()}`}
            style={{
              flex: 1,
              height: '28px',
              background: getColor(h.status),
              borderRadius: '2px',
              border: i === hours.length - 1 ? '1px solid rgba(255,255,255,0.5)' : 'none',
              cursor: 'help',
              transition: 'opacity 0.3s',
              opacity: h.status === 'none' ? 0.15 : 1
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
        <span>← 24H AGO</span>
        <span>NOW →</span>
      </div>
    </div>
  );
};

export default ComplianceHeatmap;
