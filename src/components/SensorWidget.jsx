import React from 'react';

const SensorWidget = ({ label, value, unit, status, className, extra }) => {
  return (
    <div className={`widget ${className}`}>
      <div className="widget-label">{label}</div>
      <div className="widget-value">
        {value} <span className="widget-unit">{unit}</span>
      </div>
      {extra && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>{extra}</div>}
      {status && (
        <div className={`widget-status ${status.includes('DANGER') ? 'bg-salmon' : 'bg-cyan'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default SensorWidget;
