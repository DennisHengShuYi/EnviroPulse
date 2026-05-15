import React from 'react';
import { Thermometer, Droplets, Wind, Sun } from 'lucide-react';
import CircularGauge from './CircularGauge';
import KPITile from './KPITile';

const HeroMetrics = ({ data, hazeLevel }) => {
  if (!data) return null;

  const isHazeSimulated = hazeLevel > 0;

  // Group A: 3 Arc Gauges with simulation logic
  const getSimulatedArcData = () => {
    const baseHeat = parseFloat(data.metrics.heatIndex.value);
    const basePM25 = parseFloat(data.metrics.pm25.value);
    const baseAQI = parseInt(data.metrics.aqi.value);

    if (hazeLevel === 0) return { heat: baseHeat, pm25: basePM25, aqi: baseAQI };

    let simHeat = baseHeat;
    let simPM25 = basePM25;
    let simAQI = baseAQI;

    if (hazeLevel === 1) { simPM25 = 52.4; simAQI = 78; }
    else if (hazeLevel === 2) { simPM25 = 155.8; simAQI = 184; simHeat += 1.5; }
    else if (hazeLevel === 3) { simPM25 = 382.1; simAQI = 412; simHeat += 3.2; }

    return { heat: simHeat, pm25: simPM25, aqi: simAQI };
  };

  const sim = getSimulatedArcData();

  const arcMetrics = [
    {
      label: 'OSH_HEAT_INDEX',
      value: sim.heat,
      max: 38,
      unit: '°C',
      headroomLabel: 'DOSH_LIMIT'
    },
    {
      label: 'PM2.5_EXPOSURE',
      value: sim.pm25,
      max: 15,
      unit: 'µg/m³',
      headroomLabel: 'WHO_AQG'
    },
    {
      label: 'DOE_API_SCORE',
      value: sim.aqi,
      max: 100,
      unit: 'API',
      headroomLabel: 'EQA_LIMIT'
    }
  ];

  // Group B: 2x2 KPI Tiles
  const kpiMetrics = [
    { icon: Thermometer, label: 'AMBIENT_TEMP', value: hazeLevel > 1 ? (parseFloat(data.metrics.temp.value) + 2).toFixed(1) : data.metrics.temp.value, unit: '°C', delta: 0.2 },
    { icon: Droplets, label: 'REL_HUMIDITY', value: data.metrics.temp.rh, unit: '%', delta: -1 },
    { icon: Wind, label: 'WIND_SPEED', value: data.metrics.temp.wind, unit: 'm/s', delta: 0.5 },
    { icon: Sun, label: 'UV_EXPOSURE', value: data.metrics.temp.uv, unit: 'idx', delta: 0 }
  ];

  return (
    <div className="hero-metrics-mixed" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Group A: Arc Gauges — uniform trio, single row */}
      <div className="widget" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'nowrap',
        justifyContent: 'space-evenly', 
        alignItems: 'flex-start', 
        gap: '4px',
        padding: '14px 8px 10px',
        border: hazeLevel === 3 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: hazeLevel === 3 ? '0 0 20px rgba(239,68,68,0.1)' : 'none',
        overflow: 'hidden'
      }}>
        {arcMetrics.map((m, i) => (
          <div key={i} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <CircularGauge 
              label={m.label}
              value={m.value}
              max={m.max}
              unit={m.unit}
              limitLabel={m.headroomLabel}
              size={100}
            />
          </div>
        ))}
      </div>

      {/* Group B: 2x2 KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {kpiMetrics.map((m, i) => {
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
    </div>
  );
};

export default HeroMetrics;
