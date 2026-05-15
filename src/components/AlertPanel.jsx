import React, { useEffect, useRef } from 'react';
import { ShieldAlert, Bell, X, ArrowRight, CheckCircle, Clock, Thermometer, Wind, Activity } from 'lucide-react';

const SEVERITY = {
  CRITICAL: { color: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.18)', badge: '#dc2626' },
  WARNING:  { color: '#d97706', bg: 'rgba(217,119,6,0.06)',  border: 'rgba(217,119,6,0.18)',  badge: '#d97706' },
  INFO:     { color: '#0891b2', bg: 'rgba(8,145,178,0.06)',  border: 'rgba(8,145,178,0.18)',  badge: '#0891b2' },
};

const TYPE_ICON = {
  'HEAT_INDEX': Thermometer,
  'PM2.5':      Wind,
  'AQI':        Activity,
  'NO2':        Wind,
  'HEAT':       Thermometer,
};

const AlertPanel = ({ alerts, onDismissAll, onNavigate, onClose }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Defer adding the listener so the button click that opened the panel
    // doesn't immediately fire the outside-click handler and close it.
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handle);
    };
  }, [onClose]);

  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '64px',
        right: '16px',
        width: '380px',
        maxHeight: '500px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeSlideDown 0.15s ease',
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: alerts.length > 0 ? 'rgba(220,38,38,0.03)' : '#fcfcfc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {alerts.length > 0
            ? <ShieldAlert size={15} color="#dc2626" />
            : <Bell size={15} color="#0891b2" />
          }
          <span style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.8px', color: '#000' }}>
            THRESHOLD_ALERTS
          </span>
          {alerts.length > 0 && (
            <span style={{
              background: '#dc2626', color: '#fff',
              fontSize: '0.55rem', fontWeight: 900,
              padding: '2px 7px', borderRadius: '10px',
            }}>
              {alerts.length}
            </span>
          )}
          {critical > 0 && (
            <span style={{
              background: 'transparent', color: '#dc2626',
              fontSize: '0.55rem', fontWeight: 800,
              border: '1px solid #dc2626', padding: '1px 5px', borderRadius: '3px',
            }}>
              {critical} CRITICAL
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px', display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Alerts list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: alerts.length > 0 ? '8px' : '0' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center' }}>
            <CheckCircle size={28} color="#059669" style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#059669', marginBottom: '4px' }}>
              ALL_PARAMETERS_NOMINAL
            </div>
            <div style={{ fontSize: '0.58rem', color: '#999' }}>
              No threshold breaches detected at current station
            </div>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const cfg = SEVERITY[alert.severity] || SEVERITY.INFO;
            const Icon = TYPE_ICON[alert.type] || ShieldAlert;
            return (
              <div
                key={alert.id || i}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: i < alerts.length - 1 ? '6px' : '0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={12} color={cfg.color} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: cfg.color, letterSpacing: '0.5px' }}>
                      {alert.type}
                    </span>
                    <span style={{
                      fontSize: '0.5rem', fontWeight: 900,
                      background: cfg.color, color: '#fff',
                      padding: '1px 5px', borderRadius: '3px',
                    }}>
                      {alert.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.5rem', color: '#999', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={9} /> {alert.time}
                  </span>
                </div>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.62rem', color: '#111', lineHeight: '1.45' }}>
                  {alert.message}
                </p>
                <div style={{ fontSize: '0.55rem', color: '#666', fontWeight: 700 }}>
                  {alert.zone}
                  {alert.value && (
                    <span style={{ marginLeft: '6px', color: cfg.color, fontWeight: 900 }}>{alert.value}</span>
                  )}
                  {alert.regulation && (
                    <span style={{ marginLeft: '6px', color: '#999' }}>· {alert.regulation}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: '8px',
      }}>
        {alerts.length > 0 && (
          <button
            onClick={onDismissAll}
            style={{
              flex: 1,
              background: '#dc2626',
              border: 'none',
              color: '#fff',
              padding: '7px',
              fontSize: '0.58rem',
              fontWeight: 900,
              cursor: 'pointer',
              borderRadius: '6px',
              letterSpacing: '0.5px',
            }}
          >
            DISMISS_ALL_ALERTS
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
