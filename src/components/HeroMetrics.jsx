import React from 'react';
import { Thermometer, Droplets, Wind, Sun, Flame, CloudFog, Activity } from 'lucide-react';
import KPITile from './KPITile';
import ArcGauge from './ArcGauge';

const HeroMetrics = ({ data, hazeLevel }) => {
  if (!data) return null;

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

  // Sustainability‑friendly colors: green for heat index (but heat is orange usually – we use amber), PM2.5 (teal), AQI (emerald)
  const arcMetrics = [
    {
      label: 'OSH_HEAT_INDEX',
      value: sim.heat,
      max: 38,
      unit: '°C',
      headroomLabel: 'DOSH_LIMIT',
      icon: Flame,
      color: '#ea580c'   // warm orange – still safety related
    },
    {
      label: 'PM2.5_EXPOSURE',
      value: sim.pm25,
      max: 15,
      unit: 'µg/m³',
      headroomLabel: 'WHO_AQG',
      icon: CloudFog,
      color: '#0d9488'   // teal (sustainable, clean air)
    },
    {
      label: 'DOE_API_SCORE',
      value: sim.aqi,
      max: 100,
      unit: 'API',
      headroomLabel: 'EQA_LIMIT',
      icon: Activity,
      color: '#059669'   // emerald green
    }
  ];

  const kpiMetrics = [
    { icon: Thermometer, label: 'AMBIENT_TEMP', value: hazeLevel > 1 ? (parseFloat(data.metrics.temp.value) + 2).toFixed(1) : data.metrics.temp.value, unit: '°C', delta: 0.2 },
    { icon: Droplets, label: 'REL_HUMIDITY', value: data.metrics.temp.rh, unit: '%', delta: -1 },
    { icon: Wind, label: 'WIND_SPEED', value: data.metrics.temp.wind, unit: 'm/s', delta: 0.5 },
    { icon: Sun, label: 'UV_EXPOSURE', value: data.metrics.temp.uv, unit: 'idx', delta: 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Row 1: Three arc gauges – fixed 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        alignItems: 'stretch'
      }}>
        {arcMetrics.map((m, i) => (
          <ArcGauge
            key={i}
            label={m.label}
            value={m.value}
            max={m.max}
            unit={m.unit}
            headroomLabel={m.headroomLabel}
            icon={m.icon}
            color={m.color}
          />
        ))}
      </div>

      {/* Row 2: 2x2 KPI Tiles – ensure KPITile also uses light theme */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
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