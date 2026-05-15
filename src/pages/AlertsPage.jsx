import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { Bell, ShieldAlert, Settings, Clock, CheckCircle2, Save, Activity, Trash2 } from 'lucide-react';

const AlertsPage = ({ selectedDistrictId }) => {
  const [config, setConfig] = useState({
    AQI_CRITICAL: 100,
    HEAT_INDEX_MAX: 40.0,
    PM2_5_EXCEEDANCE: 35.0,
    NO2_PEAK_LIMIT: 25.0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    const districtQuery = `?id=${selectedDistrictId || 'klcc'}`;
    
    // 1. Fetch Config
    fetch(`${API_BASE}/api/config/thresholds`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });

    // 2. Fetch Alerts
    const fetchAlerts = () => {
      fetch(`${API_BASE}/api/alerts${districtQuery}`)
        .then(res => res.json())
        .then(data => setAlerts(data));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);

    return () => clearInterval(interval);
  }, [selectedDistrictId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/config/thresholds`, {
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

  return (
    <div style={{ padding: '2rem', paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', fontWeight: 800, letterSpacing: '2px', wordBreak: 'break-word' }}>ALERT_COMMAND_CENTER</h2>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <div style={{ padding: '8px 15px', background: 'rgba(0, 255, 130, 0.1)', borderRadius: '4px', fontSize: '0.7rem', color: '#00ff82', border: '1px solid rgba(0,255,130,0.2)' }}>
            EWS_STATUS: <span style={{ fontWeight: 800 }}>READY</span>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2" style={{ gap: '30px' }}>
        {/* Threshold Configuration */}
        <div className="widget" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Settings size={18} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>SYSTEM_THRESHOLD_CALIBRATION</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(config).map((key) => (
              <div key={key}>
                <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  {key.replace(/_/g, ' ')}
                </label>
                <input 
                  type="number"
                  value={config[key]}
                  onChange={(e) => setConfig({ ...config, [key]: parseFloat(e.target.value) })}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px', fontSize: '0.8rem' }}
                />
              </div>
            ))}
            
            <button 
              onClick={handleUpdate}
              disabled={saving}
              style={{ 
                background: saveStatus === 'SUCCESS' ? '#00ff82' : 'var(--accent-cyan)', 
                color: '#000', border: 'none', padding: '12px', fontWeight: 900, borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease' 
              }}
            >
              {saving ? 'SYNCING...' : saveStatus === 'SUCCESS' ? 'THRESHOLD_SYNCED' : 'SAVE_CONFIGURATION'}
              <Save size={16} />
            </button>
          </div>
        </div>

        {/* History Feed */}
        <div className="widget" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Clock size={18} className="cyan" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>LIVE_ALERT_FEED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                <CheckCircle2 size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <div>NO_ACTIVE_THRESHOLD_BREACHES_DETECTED</div>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} style={{ 
                  padding: '15px', 
                  background: 'rgba(255,62,62,0.05)', 
                  borderLeft: `3px solid var(--accent-red)`,
                  borderRadius: '0 4px 4px 0',
                  border: '1px solid rgba(255,62,62,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-red)' }}>{alert.type}_BREACH</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {alert.metric || alert.type} limit exceeded at {alert.zone}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    VALUE: <span style={{ color: 'var(--accent-red)', fontWeight: 800 }}>{alert.value}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

