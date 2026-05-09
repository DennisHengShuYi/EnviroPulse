import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Settings, Clock, CheckCircle2, Save, Activity } from 'lucide-react';

const AlertsPage = () => {
  const [config, setConfig] = useState({
    AQI_CRITICAL: 100,
    HEAT_INDEX_MAX: 40.0,
    PM2_5_EXCEEDANCE: 35.0,
    NO2_PEAK_LIMIT: 25.0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetch('/api/config/thresholds')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveStatus('SUCCESS');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('ERROR');
    } finally {
      setSaving(false);
    }
  };

  const alertHistory = [
    { id: 1, type: 'CRITICAL', metric: 'HEAT_INDEX', zone: 'KLCC', value: '42.8°C', time: '04:12 AM', date: '2026-05-09' },
    { id: 2, type: 'WARNING', metric: 'AQI_LEVEL', zone: 'SHAH_ALAM', value: '112', time: '02:45 AM', date: '2026-05-09' },
    { id: 3, type: 'CRITICAL', metric: 'PM2.5', zone: 'KLANG', value: '45.2µg/m³', time: '11:30 PM', date: '2026-05-08' },
    { id: 4, type: 'WARNING', metric: 'AQI_LEVEL', zone: 'CHOW_KIT', value: '98', time: '09:15 PM', date: '2026-05-08' },
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>ALERT_COMMAND_CENTER</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 15px', background: 'rgba(0, 255, 130, 0.1)', borderRadius: '4px', fontSize: '0.7rem', color: '#00ff82', border: '1px solid rgba(0,255,130,0.2)' }}>
            EWS_STATUS: <span style={{ fontWeight: 800 }}>READY</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* History Feed */}
        <div className="widget" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Clock size={18} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>ALERT_HISTORY_FEED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {alertHistory.map((alert) => (
              <div key={alert.id} style={{ 
                padding: '15px', 
                background: 'rgba(255,255,255,0.02)', 
                borderLeft: `3px solid ${alert.type === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)'}`,
                borderRadius: '0 4px 4px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: alert.type === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)' }}>{alert.type}_ALERT</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{alert.date} {alert.time}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  {alert.metric} breached at {alert.zone}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                  RECORDED_VALUE: <span className="white">{alert.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
