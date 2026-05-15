import React from 'react';

const MetricCard = ({ label, value, unit, limit, color, hazeLevel, isResource = false }) => {
  // Air pollutants increase with hazeLevel; resources do not.
  const getSimulatedValue = () => {
    if (isResource || !hazeLevel || hazeLevel === 0) return value;
    const base = parseFloat(value);
    if (label === 'PM2.5') return (base * (hazeLevel === 1 ? 4 : hazeLevel === 2 ? 10 : 25)).toFixed(1);
    if (label === 'PM10') return (base * (hazeLevel === 1 ? 2 : hazeLevel === 2 ? 5 : 12)).toFixed(1);
    return (base * (1 + hazeLevel * 0.5)).toFixed(1);
  };

  const finalValue = getSimulatedValue();
  const pct = Math.min(100, Math.round((parseFloat(finalValue) / parseFloat(limit)) * 100));

  // Highlight tile if limit is exceeded (>= 100%)
  const isCritical = !isResource && pct >= 100;
  const displayColor = isCritical ? '#ef4444' : color;

  return (
    <div style={{
      padding: '12px',
      background: isCritical ? '#fef2f2' : '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${isCritical ? '#fecaca' : '#e2e8f0'}`,
      borderLeft: `4px solid ${displayColor}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      minHeight: '85px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: isCritical ? '#ef4444' : '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isCritical ? '#ef4444' : '#1e293b', marginTop: '2px' }}>
            {finalValue}
            <span style={{ fontSize: '0.65rem', color: isCritical ? '#f87171' : '#94a3b8', marginLeft: '4px' }}>{unit}</span>
          </div>
        </div>
        <div style={{ background: isCritical ? '#fee2e2' : '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: displayColor }}>{pct}%</span>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: isCritical ? '#ef4444' : '#94a3b8', marginBottom: '4px', fontWeight: 800 }}>
          <span>{isCritical ? 'EXCEEDS LIMIT' : 'CURRENT CAPACITY'}</span>
          <span>MAX: {limit}{unit}</span>
        </div>
        <div style={{ height: '4px', background: isCritical ? '#fca5a5' : '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: displayColor, transition: 'width 1s ease' }} />
        </div>
      </div>
    </div>
  );
};

// Safely extracts a primitive number from a pollutant field that may be
// a plain number, a string, or an object like { value, status }.
const extractValue = (field, fallback) => {
  if (field === null || field === undefined) return fallback;
  if (typeof field === 'object') return parseFloat(field.value ?? fallback) || fallback;
  return parseFloat(field) || fallback;
};

const PollutantGrid = ({ pollutants, hazeLevel }) => {
  const airMetrics = [
    { label: 'PM2.5', value: extractValue(pollutants?.pm25, 12.4), unit: 'µg/m³', limit: '15', color: '#f97316' },
    { label: 'PM10',  value: extractValue(pollutants?.pm10, 28.1), unit: 'µg/m³', limit: '45', color: '#eab308' },
    { label: 'NO2',   value: extractValue(pollutants?.no2, 5.2),   unit: 'ppb',   limit: '21', color: '#06b6d4' },
    { label: 'SO2',   value: extractValue(pollutants?.so2, 3.4),   unit: 'ppb',   limit: '15', color: '#ec4899' },
  ];

  const resourceMetrics = [
    { label: 'Water Waste', value: 14.2, unit: 'm³/h', limit: '20', color: '#3b82f6', isResource: true },
    { label: 'Energy Load', value: 410, unit: 'kWh', limit: '500', color: '#8b5cf6', isResource: true },
  ];

  const LabelDivider = ({ text }) => (
    <div style={{
      fontSize: '0.65rem',
      fontWeight: 900,
      color: '#64748b',
      letterSpacing: '1px',
      margin: '15px 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      {text} <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
    </div>
  );

    <div className="grid-container" style={{ padding: '0 4px' }}>
      <LabelDivider text="PRIMARY_POLLUTANTS" />
      <div className="responsive-grid-2" style={{ gap: '10px' }}>
        {airMetrics.map((m, i) => <MetricCard key={i} {...m} hazeLevel={hazeLevel} />)}
      </div>

      <LabelDivider text="RESOURCE_TRACKING" />
      <div className="responsive-grid-2" style={{ gap: '10px' }}>
        {resourceMetrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>
    </div>
};

export default PollutantGrid;