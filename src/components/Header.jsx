import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ShieldCheck, ChevronDown, Bell, ShieldAlert, Crosshair } from 'lucide-react';

const Header = ({ districtName, districts, onSelectDistrict, onLocateMe, alertCount, onToggleAlerts, showAlerts }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(5, 5, 5, 0.5)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 80
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="marker-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f0ff' }}></div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
            STATUS: <span style={{ color: '#00ff82' }}>LIVE_STABLE</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <MapPin size={16} className="cyan" />
            <select 
              value={districtName} 
              onChange={(e) => onSelectDistrict(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                fontSize: '0.9rem', 
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                paddingRight: '20px'
              }}
            >
              <optgroup label="CURRENT_GPS" style={{ background: '#111', color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>
                <option value="user_gps" style={{ background: '#000', color: '#fff' }}>[ LOCAL_STATION ]</option>
              </optgroup>
              {Array.from(new Set(districts.map(d => d.region))).map(region => (
                <optgroup key={region} label={region} style={{ background: '#111', color: '#00f0ff', fontSize: '0.7rem' }}>
                  {districts.filter(d => d.region === region).map(d => (
                    <option key={d.id} value={d.id} style={{ background: '#000', color: '#fff' }}>{d.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
          </div>

          <button 
            onClick={onLocateMe}
            title="SYNC GPS LOCATION"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: 'var(--accent-cyan)',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Crosshair size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Alert Toggle Button */}
        <div 
          onClick={onToggleAlerts}
          style={{ 
            position: 'relative', 
            cursor: 'pointer', 
            padding: '8px',
            borderRadius: '4px',
            background: showAlerts ? 'rgba(255, 62, 62, 0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showAlerts ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          {alertCount > 0 ? (
            <ShieldAlert size={18} className={showAlerts ? 'white' : 'red'} />
          ) : (
            <Bell size={18} className="cyan" />
          )}
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: alertCount > 0 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
            {alertCount > 0 ? `ALERTS (${alertCount})` : 'SYSTEM_STABLE'}
          </span>
          {alertCount > 0 && !showAlerts && (
            <div className="marker-pulse" style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: 'var(--accent-red)', borderRadius: '50%' }}></div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Clock size={16} />
          <span style={{ fontSize: '0.9rem', fontFamily: 'JetBrains Mono' }}>
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 130, 0.1)', padding: '4px 12px', borderRadius: '2px', border: '1px solid rgba(0, 255, 130, 0.2)' }}>
          <ShieldCheck size={14} style={{ color: '#00ff82' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#00ff82' }}>SECURE_CONN</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
