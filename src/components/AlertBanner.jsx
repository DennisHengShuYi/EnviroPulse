import React from 'react';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

const AlertBanner = ({ alerts, onDismiss, onNavigate }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <ShieldAlert size={20} />
        <div>
          <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>THRESHOLD_BREACH_DETECTED: </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {alerts[0].type} at {alerts[0].zone} exceeded limit ({alerts[0].value}). Status: {alerts[0].status}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={onNavigate}
          style={{ 
            background: 'var(--accent-red)', 
            color: 'var(--text-primary)', 
            border: 'none', 
            padding: '4px 12px', 
            borderRadius: '2px', 
            fontSize: '0.7rem', 
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          VIEW PROTOCOLS <ArrowRight size={12} />
        </button>
        <X size={18} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={onDismiss} />
      </div>
    </div>
  );
};

export default AlertBanner;

