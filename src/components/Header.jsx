import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ShieldCheck, ChevronDown, Bell, ShieldAlert, Crosshair } from 'lucide-react';

const Header = ({ districtName, districts, onSelectDistrict, onLocateMe, alertCount, onToggleAlerts, showAlerts, isLive, tier, setTier }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header">
      <div className="header-group header-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="marker-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? '#00f0ff' : '#ffb800' }}></div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>
            STATUS: <span style={{ color: isLive ? '#00ff82' : '#ffb800' }}>{isLive ? 'LIVE' : 'FALLBACK'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <MapPin size={14} className="cyan" />
            <select 
              value={districtName} 
              onChange={(e) => onSelectDistrict(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-primary)', 
                fontSize: '0.8rem', 
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                paddingRight: '15px'
              }}
            >
              <optgroup label="CURRENT_GPS" style={{ background: 'var(--bg-primary)', color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>
                <option value="user_gps" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>[ LOCAL ]</option>
              </optgroup>
              {Array.from(new Set(districts.map(d => d.region))).map(region => (
                <optgroup key={region} label={region} style={{ background: 'var(--bg-primary)', color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>
                  {districts.filter(d => d.region === region).map(d => (
                    <option key={d.id} value={d.id} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{d.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
          </div>

          <button 
            onClick={onLocateMe}
            title="SYNC GPS"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: 'var(--accent-cyan)',
              padding: '4px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      <div className="header-group header-right">
        {/* Tier Toggle - simplified for mobile */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => setTier && setTier('basic')}
            style={{ 
              padding: '4px 10px', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 800, 
              fontSize: '0.6rem',
              background: tier === 'basic' ? '#00bcd4' : 'transparent',
              color: tier === 'basic' ? '#000' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}>B</button>
          <button 
            onClick={() => setTier && setTier('premium')}
            style={{ 
              padding: '4px 10px', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 800, 
              fontSize: '0.6rem',
              background: tier === 'premium' ? '#00bcd4' : 'transparent',
              color: tier === 'premium' ? '#000' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}>P</button>
        </div>

        <div 
          onClick={onToggleAlerts}
          style={{ 
            position: 'relative', 
            cursor: 'pointer', 
            padding: '6px 10px',
            borderRadius: '4px',
            background: showAlerts ? 'rgba(255, 62, 62, 0.1)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${showAlerts ? 'var(--accent-red)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {alertCount > 0 ? (
            <ShieldAlert size={14} className={showAlerts ? 'white' : 'red'} />
          ) : (
            <Bell size={14} className="cyan" />
          )}
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: alertCount > 0 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
            {alertCount > 0 ? `${alertCount}` : 'OK'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={14} />
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 255, 130, 0.1)', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(0, 255, 130, 0.2)' }}>
          <ShieldCheck size={12} style={{ color: '#00ff82' }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#00ff82' }}>SEC</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

