import React from 'react';
import { Thermometer, Droplets, Wind, Sun } from 'lucide-react';
import CircularGauge from './CircularGauge';
import KPITile from './KPITile';

<<<<<<< HEAD
const HeroMetrics = ({ data, isHazeSimulated }) => {
=======
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
>>>>>>> c03c1b1fe6dab7570326751cf2ed848007228e19
  if (!data) return null;

  // Group A: 3 Arc Gauges
  const arcMetrics = [
    {
      label: 'OSH_HEAT_INDEX',
      value: parseFloat(data.metrics.heatIndex.value),
      max: 38,
      unit: '°C',
      headroomLabel: 'DOSH_LIMIT'
    },
    {
      label: 'PM2.5_EXPOSURE',
      value: parseFloat(isHazeSimulated ? 152.4 : data.metrics.pm25.value),
      max: 15,
      unit: 'µg/m³',
      headroomLabel: 'WHO_AQG'
    },
    {
      label: 'DOE_API_SCORE',
      value: parseInt(isHazeSimulated ? 184 : data.metrics.aqi.value),
      max: 100,
      unit: 'API',
      headroomLabel: 'EQA_LIMIT'
    }
  ];

  // Group B: 2x2 KPI Tiles
  const kpiMetrics = [
    { icon: Thermometer, label: 'AMBIENT_TEMP', value: data.metrics.temp.value, unit: '°C', delta: 0.2 },
    { icon: Droplets, label: 'REL_HUMIDITY', value: data.metrics.temp.rh, unit: '%', delta: -1 },
    { icon: Wind, label: 'WIND_SPEED', value: data.metrics.temp.wind, unit: 'm/s', delta: 0.5 },
    { icon: Sun, label: 'UV_EXPOSURE', value: data.metrics.temp.uv, unit: 'idx', delta: 0 }
  ];

  return (
<<<<<<< HEAD
    <div className="hero-metrics-mixed" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
      {/* Group A: Arc Gauges - Stacked in side column */}
      <div className="widget" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '10px',
        padding: '10px 5px' 
      }}>
        {arcMetrics.map((m, i) => (
          <CircularGauge 
            key={i}
            label={m.label}
            value={m.value}
            max={m.max}
            unit={m.unit}
            limitLabel={m.headroomLabel}
            size={110}
          />
        ))}
      </div>

      {/* Group B: 2x2 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {kpiMetrics.map((m, i) => {
          // Fix for wind speed which might already contain unit
          const cleanValue = typeof m.value === 'string' ? m.value.split(' ')[0] : m.value;
          return (
            <KPITile 
              key={i}
              icon={m.icon}
              label={m.label}
              value={cleanValue}
              unit={m.unit}
              delta={m.delta}
            />
          );
        })}
      </div>
=======
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
>>>>>>> c03c1b1fe6dab7570326751cf2ed848007228e19
    </div>
  );
};

export default HeroMetrics;
