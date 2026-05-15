import CircularGauge from './CircularGauge';

const PollutantCell = ({ label, value, unit, limit }) => {
  const pct = Math.min(Math.round((parseFloat(value) / parseFloat(limit)) * 100), 110);
  const getColor = (p) => p >= 90 ? 'var(--accent-red)' : p >= 70 ? 'var(--accent-gold)' : 'var(--accent-cyan)';
  const color = getColor(pct);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${pct >= 90 ? 'rgba(255,62,62,0.2)' : 'rgba(255,255,255,0.04)'}`,
      borderRadius: '3px',
      padding: '7px 9px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '0.45rem', color: pct >= 90 ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: 800 }}>{pct}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 900, color: color, fontFamily: 'monospace' }}>{parseFloat(value).toFixed(1)}</span>
        <span style={{ fontSize: '0.45rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: '1px',
          transition: 'width 1s ease-in-out',
          boxShadow: pct >= 90 ? `0 0 4px ${color}` : 'none'
        }} />
      </div>
    </div>
  );
};

const RiskCommandCenter = ({ data }) => {
  if (!data) return null;

  const pollutants = data.pollutants;

  const pm25Risk = (parseFloat(pollutants.pm25) / 15) * 40;
  const aqiRisk = (data.metrics.aqi.value / 100) * 40;
  const heatRisk = (parseFloat(data.metrics.heatIndex.value) / 38) * 20;
  const compositeScore = Math.min(Math.round(pm25Risk + aqiRisk + heatRisk), 100);

  // Count active breaches for sub-label
  const breachCount = [
    parseFloat(pollutants.pm25) > 15,
    parseFloat(pollutants.pm10) > 45,
    parseFloat(pollutants.no2?.value || pollutants.no2) > 21,
    parseFloat(pollutants.so2) > 15,
    data.metrics.aqi.value > 100,
    parseFloat(data.metrics.heatIndex.value) > 38
  ].filter(Boolean).length;

  const pollutantCells = [
    { label: 'PM2.5', value: pollutants.pm25, limit: 15, unit: 'µg/m³' },
    { label: 'PM10',  value: pollutants.pm10, limit: 45, unit: 'µg/m³' },
    { label: 'NO2',   value: pollutants.no2?.value || pollutants.no2, limit: 21, unit: 'ppb' },
    { label: 'SO2',   value: pollutants.so2, limit: 15, unit: 'ppb' },
    { label: 'CO',    value: pollutants.co, limit: 4, unit: 'mg/m³' },
    { label: 'O3',    value: pollutants.o3, limit: 51, unit: 'ppb' },
  ];

  return (
    <div className="widget" style={{ padding: '16px', background: 'rgba(5,5,5,0.85)', border: '1px solid rgba(0,240,255,0.1)', flexShrink: 0 }}>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px' }}>
        RISK_COMMAND_CENTER
      </div>

      {/* Gauge row — gauge left, breach status right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
        <CircularGauge
          type="full"
          label="COMPOSITE_RISK"
          value={compositeScore}
          max={100}
          size={200}
          unit="pts"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1.5px', color: '#fff', marginBottom: '6px' }}>COMPOSITE_RISK</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: compositeScore >= 70 ? 'var(--accent-red)' : compositeScore >= 40 ? 'var(--accent-gold)' : 'var(--accent-cyan)', fontFamily: 'monospace', lineHeight: 1 }}>
            {compositeScore}<span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, marginLeft: '4px' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.5rem', color: breachCount > 0 ? 'var(--accent-red)' : '#00ff88', fontWeight: 800, marginTop: '6px', letterSpacing: '1px' }}>
            {breachCount > 0 ? `⚠ ${breachCount} ACTIVE BREACH${breachCount > 1 ? 'ES' : ''}` : '● ALL LIMITS CLEAR'}
          </div>
        </div>
      </div>

      {/* 2×3 pollutant grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {pollutantCells.map((cell, idx) => (
          <PollutantCell key={idx} {...cell} />
        ))}
      </div>
    </div>
  );
};

export default RiskCommandCenter;
