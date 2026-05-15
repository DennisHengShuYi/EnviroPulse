import React from 'react';

const ComplianceHeatmap = ({ history = [] }) => {
  // We want 24 hours. If history has fewer, we pad. 
  // If more, we bucket them. But usually trends are hourly or 15-min.
  // Let's assume history is sorted by ts, we take the last 24 meaningful buckets.
  
  const hours = Array.from({ length: 24 }, (_, i) => {
    // Mocking logic if data is thin, but ideally we process history
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
      case 'red': return 'var(--accent-red)';
      case 'amber': return 'var(--accent-gold)';
      case 'green': return '#00ff82';
      default: return 'rgba(255,255,255,0.05)';
    }
  };

  return (
    <div className="widget" style={{ padding: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>24H_COMPLIANCE_HEATMAP</div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', background: '#00ff82' }} /> SAFE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent-gold)' }} /> CAUTION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent-red)' }} /> BREACH
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
        {hours.map((h, i) => (
          <div 
            key={i}
            title={h.label}
            style={{ 
              flex: 1, 
              aspectRatio: '1/1', 
              background: getColor(h.status),
              borderRadius: '1px',
              border: i === hours.length - 1 ? '1px solid #fff' : 'none',
              cursor: 'help'
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
        <span>24H AGO</span>
        <span>NOW</span>
      </div>
    </div>
  );
};

export default ComplianceHeatmap;
