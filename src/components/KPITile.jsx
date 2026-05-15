import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPITile = ({ icon: Icon, label, value, unit, delta = 0 }) => {
  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: '1px solid rgba(255,255,255,0.05)',
      padding: '12px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ 
        padding: '8px', 
        background: 'rgba(0,240,255,0.05)', 
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={16} className="cyan" />
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{value}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', color: isUp ? 'var(--accent-red)' : isDown ? '#00ff82' : 'var(--text-secondary)' }}>
        {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
      </div>
    </div>
  );
};

export default KPITile;
