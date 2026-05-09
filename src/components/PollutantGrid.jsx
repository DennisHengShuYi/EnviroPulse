import React from 'react';

const Sparkline = ({ color }) => {
  // Generate random points for sparkline
  const points = Array.from({ length: 10 }, (_, i) => `${i * 10},${20 + Math.random() * 20}`).join(' ');
  return (
    <svg width="100%" height="40" style={{ opacity: 0.5 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

const PollutantCard = ({ label, value, unit, limit, color, accentClass }) => {
  return (
    <div className="widget" style={{ padding: '8px 12px', borderLeft: `2px solid ${color}`, minHeight: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{label}</span>
        <span className={accentClass} style={{ fontSize: '0.75rem', fontWeight: 800 }}>{value} <small style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{unit}</small></span>
      </div>
      
      <div style={{ margin: '4px 0' }}>
        <svg width="100%" height="20" style={{ opacity: 0.3 }}>
           <polyline fill="none" stroke={color} strokeWidth="1" points={Array.from({ length: 10 }, (_, i) => `${i * 10},${10 + Math.random() * 10}`).join(' ')} />
        </svg>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
          <span>LIM: {limit}</span>
          <span>84%</span>
        </div>
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ width: '84%', height: '100%', background: color, opacity: 0.6 }}></div>
        </div>
      </div>
    </div>
  );
};

const PollutantGrid = ({ pollutants }) => {
  if (!pollutants) return null;

  const config = [
    { label: 'PM2.5', value: pollutants.pm25, unit: 'µg/m³', limit: '15', color: 'var(--accent-salmon)', accentClass: 'salmon' },
    { label: 'PM10', value: pollutants.pm10, unit: 'µg/m³', limit: '45', color: 'var(--accent-gold)', accentClass: 'gold' },
    { label: 'NO₂', value: pollutants.no2, unit: 'ppb', limit: '21', color: 'var(--accent-cyan)', accentClass: 'cyan' },
    { label: 'SO₂', value: pollutants.so2, unit: 'ppb', limit: '15', color: 'var(--accent-red)', accentClass: 'red' },
    { label: 'CO', value: pollutants.co, unit: 'mg/m³', limit: '4', color: '#fff', accentClass: '' },
    { label: 'O₃', value: pollutants.o3, unit: 'ppb', limit: '51', color: '#b19cd9', accentClass: '' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {config.map((p, idx) => (
        <PollutantCard key={idx} {...p} />
      ))}
    </div>
  );
};

export default PollutantGrid;
