import React from 'react';
import { Thermometer, Droplets, Wind, Sun } from 'lucide-react';
import CircularGauge from './CircularGauge';
import KPITile from './KPITile';

const HeroMetrics = ({ data, isHazeSimulated }) => {
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
    </div>
  );
};

export default HeroMetrics;
