import React from 'react';
import CircularGauge from './CircularGauge';
import BulletChart from './BulletChart';

const RiskCommandCenter = ({ data }) => {
  if (!data) return null;

  const pollutants = data.pollutants;
  
  // Calculate a composite risk score (0-100)
  // Logic: Weighted average of key pollutants + heat index risk
  const pm25Risk = (parseFloat(pollutants.pm25) / 15) * 40;
  const aqiRisk = (data.metrics.aqi.value / 100) * 40;
  const heatRisk = (parseFloat(data.metrics.heatIndex.value) / 38) * 20;
  const compositeScore = Math.min(Math.round(pm25Risk + aqiRisk + heatRisk), 100);

  const bulletConfigs = [
    { label: 'PM2.5', value: parseFloat(pollutants.pm25), limit: 15, unit: 'µg/m³' },
    { label: 'PM10', value: parseFloat(pollutants.pm10), limit: 45, unit: 'µg/m³' },
    { label: 'NO2', value: parseFloat(pollutants.no2?.value || pollutants.no2), limit: 21, unit: 'ppb' },
    { label: 'SO2', value: parseFloat(pollutants.so2), limit: 15, unit: 'ppb' },
    { label: 'CO', value: parseFloat(pollutants.co), limit: 4, unit: 'mg/m³' },
    { label: 'O3', value: parseFloat(pollutants.o3), limit: 51, unit: 'ppb' }
  ];

  return (
    <div className="widget" style={{ padding: '20px', background: 'rgba(5,5,5,0.8)', border: '1px solid rgba(0,240,255,0.1)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '2px', marginBottom: '20px' }}>
        RISK_COMMAND_CENTER_v4.2
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        {/* Large Risk Gauge */}
        <div style={{ flex: '0 0 200px', display: 'flex', justifyContent: 'center' }}>
          <CircularGauge 
            type="full"
            label="COMPOSITE_RISK"
            value={compositeScore}
            max={100}
            size={180}
            unit="pts"
          />
        </div>

        {/* Bullet Chart Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '30px' }}>
          {bulletConfigs.map((config, idx) => (
            <BulletChart key={idx} {...config} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskCommandCenter;
