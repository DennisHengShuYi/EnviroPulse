import React from 'react';

const BulletChart = ({ label, value, limit, unit }) => {
  const percentage = Math.min((value / limit) * 100, 110); // Allow overflow
  
  const getColor = (pct) => {
    if (pct >= 90) return 'var(--accent-red)';
    if (pct >= 70) return 'var(--accent-gold)';
    return 'var(--accent-cyan)';
  };

  const color = getColor(percentage);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
      <div style={{ width: '60px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
        {label}
      </div>
      
      <div style={{ flex: 1, position: 'relative', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
        {/* Limit Marker (Thin line at 100%) */}
        <div style={{ 
          position: 'absolute', 
          right: '0%', 
          top: '-2px', 
          bottom: '-2px', 
          width: '2px', 
          background: 'rgba(255,255,255,0.2)',
          zIndex: 1
        }} />
        
        {/* Value Bar */}
        <div style={{ 
          height: '100%', 
          width: `${Math.min(percentage, 100)}%`, 
          background: color,
          borderRadius: '2px',
          boxShadow: percentage >= 100 ? `0 0 10px ${color}` : 'none',
          transition: 'width 1s ease-in-out'
        }} />

        {/* Overflow Bar */}
        {percentage > 100 && (
          <div style={{ 
            position: 'absolute',
            left: '100%',
            height: '100%',
            width: `${percentage - 100}%`,
            background: 'var(--accent-red)',
            opacity: 0.6,
            borderRadius: '0 2px 2px 0'
          }} />
        )}
      </div>

      <div style={{ width: '80px', textAlign: 'right' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{value}<span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>{unit}</span></div>
      </div>
      
      <div style={{ 
        width: '45px', 
        fontSize: '0.6rem', 
        fontWeight: 900, 
        padding: '2px 4px', 
        textAlign: 'center',
        background: `${color}15`, 
        color: color,
        border: `1px solid ${color}30`,
        borderRadius: '2px'
      }}>
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
};

export default BulletChart;
