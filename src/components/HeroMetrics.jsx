import React from 'react';
import { Thermometer, Wind, CloudRain, Droplets } from 'lucide-react';

const HeroCard = ({ label, value, unit, status, details, icon: Icon, colorClass, compact }) => {
  const getStatusColor = (status) => {
    if (status === 'DANGER' || status === 'UNHEALTHY') return 'badge-danger';
    if (status === 'CAUTION' || status === 'MODERATE' || status === 'SENSITIVE') return 'badge-warning';
    return 'badge-safe';
  };

  return (
    <div className="hero-card" style={{ padding: compact ? '8px 12px' : '20px', marginBottom: compact ? '8px' : '0' }}>
      <div className="badge-container">
        <span className={`badge ${getStatusColor(status)}`} style={{ fontSize: compact ? '0.5rem' : '0.65rem' }}>{status}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: compact ? '4px' : '15px' }}>
        <div style={{ padding: compact ? '4px' : '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <Icon size={compact ? 14 : 20} className={colorClass} />
        </div>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: compact ? '2px' : '20px' }}>
        <span style={{ fontSize: compact ? '1.4rem' : '2.5rem', fontWeight: 800 }}>{value}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>

      {!compact && details && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
          {Object.entries(details).map(([key, val]) => (
            <div key={key}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HeroMetrics = ({ data, layout }) => {
  if (!data) return null;

  const isVertical = layout === 'vertical';

  return (
    <div className={isVertical ? "hero-sidebar" : "hero-metrics"} style={isVertical ? { display: 'flex', flexDirection: 'column' } : {}}>
      <HeroCard 
        label="HEAT INDEX" 
        value={data.metrics.heatIndex.value} 
        unit="°C" 
        status={data.metrics.heatIndex.status} 
        icon={Thermometer}
        colorClass="red"
        compact={isVertical}
      />
      <HeroCard 
        label="AQI SCORE" 
        value={data.metrics.aqi.value} 
        unit="DOE" 
        status={data.metrics.aqi.status} 
        icon={Wind}
        colorClass="cyan"
        compact={isVertical}
      />
      <HeroCard 
        label="AMBIENT TEMP" 
        value={data.metrics.temp.value} 
        unit="°C" 
        status="STABLE" 
        details={{ RH: data.metrics.temp.rh, UV: data.metrics.temp.uv, WIND: data.metrics.temp.wind }}
        icon={CloudRain}
        colorClass="gold"
        compact={isVertical}
      />
      <HeroCard 
        label="PM2.5 CONC." 
        value={data.metrics.pm25.value} 
        unit="µg/m³" 
        status="ELEVATED" 
        icon={Droplets}
        colorClass="salmon"
        compact={isVertical}
      />
    </div>
  );
};

export default HeroMetrics;
