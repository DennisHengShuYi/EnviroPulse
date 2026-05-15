import React from 'react';
import { Thermometer, Wind, CloudRain, Droplets, ShieldAlert } from 'lucide-react';

const HeroCard = ({ label, value, unit, status, thresholdLabel, details, icon: Icon, colorClass, compact, hazeLevel }) => {
  const getStatusColor = (status) => {
    if (hazeLevel === 3) return 'badge-danger';
    if (hazeLevel === 2) return 'badge-danger';
    if (hazeLevel === 1) return 'badge-warning';
    if (status === 'DANGER' || status === 'UNHEALTHY' || status === 'BREACH' || status === 'CRITICAL') return 'badge-danger';
    if (status === 'CAUTION' || status === 'MODERATE' || status === 'SENSITIVE' || status === 'WARNING') return 'badge-warning';
    return 'badge-safe';
  };

  const getSimulatedData = () => {
    if (hazeLevel === 0) return { val: value, stat: status };
    
    if (label.includes('PM2.5')) {
      if (hazeLevel === 1) return { val: '52.4', stat: 'MODERATE' };
      if (hazeLevel === 2) return { val: '155.8', stat: 'UNHEALTHY' };
      if (hazeLevel === 3) return { val: '382.1', stat: 'HAZARDOUS' };
    }
    if (label.includes('AQI')) {
      if (hazeLevel === 1) return { val: '78', stat: 'MODERATE' };
      if (hazeLevel === 2) return { val: '184', stat: 'UNHEALTHY' };
      if (hazeLevel === 3) return { val: '412', stat: 'HAZARDOUS' };
    }
    if (label.includes('THERMAL')) {
      if (hazeLevel >= 2) return { val: (parseFloat(value) + 2).toFixed(1), stat: 'BREACH' };
    }
    return { val: value, stat: hazeLevel > 1 ? 'CRITICAL' : (hazeLevel === 1 ? 'WARNING' : status) };
  };

  const { val: simulatedValue, stat: simulatedStatus } = getSimulatedData();

  return (
    <div className={`hero-card ${hazeLevel > 0 ? 'animate-pulse' : ''}`} style={{ 
      padding: compact ? '8px 12px' : '20px', 
      marginBottom: compact ? '8px' : '0', 
      border: hazeLevel === 3 ? '2px solid #ef4444' : (hazeLevel > 0 ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.05)'), 
      background: '#070707',
      boxShadow: hazeLevel === 3 ? '0 0 20px rgba(239,68,68,0.2)' : 'none'
    }}>
      <div className="badge-container">
        <span className={`badge ${getStatusColor(simulatedStatus)}`} style={{ fontSize: compact ? '0.5rem' : '0.65rem', fontWeight: 900 }}>{simulatedStatus}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: compact ? '4px' : '12px' }}>
        <div style={{ padding: compact ? '4px' : '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
          <Icon size={compact ? 14 : 18} className={colorClass} />
        </div>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '1px' }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: compact ? '2px' : '4px' }}>
        <span style={{ fontSize: compact ? '1.4rem' : '2.2rem', fontWeight: 900, fontFamily: 'monospace' }}>{value}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{unit}</span>
      </div>

      {thresholdLabel && (
        <div style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', marginBottom: compact ? '2px' : '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.85 }}>
          <span>└</span> {thresholdLabel}
        </div>
      )}

      {!compact && details && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          {Object.entries(details).map(([key, val]) => (
            <div key={key}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>{key}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HeroMetrics = ({ data, layout, hazeLevel }) => {
  if (!data) return null;

  const isVertical = layout === 'vertical';

  return (
    <div className={isVertical ? "hero-sidebar" : "hero-metrics"} style={isVertical ? { display: 'flex', flexDirection: 'column' } : {}}>
      <HeroCard 
        label="OSH THERMAL BASELINE" 
        value={data.metrics.heatIndex.value} 
        unit="°C" 
        status={parseFloat(data.metrics.heatIndex.value) > 38 ? 'BREACH' : 'COMPLIANT'} 
        thresholdLabel="DOSH Safety Cap: 38.0°C"
        icon={Thermometer}
        colorClass="red"
        compact={isVertical}
        hazeLevel={hazeLevel}
      />
      <HeroCard 
        label="DOE API BASELINE SCORE" 
        value={data.metrics.aqi.value} 
        unit="API" 
        status={data.metrics.aqi.value > 100 ? 'WARNING' : 'COMPLIANT'} 
        thresholdLabel="EQA 1974 Threshold: <100"
        icon={Wind}
        colorClass="cyan"
        compact={isVertical}
        hazeLevel={hazeLevel}
      />
      <HeroCard 
        label="AMBIENT CORE BASELINE" 
        value={data.metrics.temp.value} 
        unit="°C" 
        status="STABLE" 
        thresholdLabel="Operational Baseline Band"
        details={{ RH: data.metrics.temp.rh, UV: data.metrics.temp.uv, WIND: data.metrics.temp.wind }}
        icon={CloudRain}
        colorClass="gold"
        compact={isVertical}
        hazeLevel={hazeLevel}
      />
      <HeroCard 
        label="PM2.5 BASELINE CONC." 
        value={data.metrics.pm25.value} 
        unit="µg/m³" 
        status={parseFloat(data.metrics.pm25.value) > 15 ? 'WARNING' : 'COMPLIANT'} 
        thresholdLabel="WHO AQG 2021 Limit: 15 µg/m³"
        icon={Droplets}
        colorClass="salmon"
        compact={isVertical}
        hazeLevel={hazeLevel}
      />
    </div>
  );
};

export default HeroMetrics;
