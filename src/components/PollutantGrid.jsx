import React from 'react';

const MiniDonut = ({ percentage, color, size = 32 }) => {
  const radius = (size / 2) - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const Sparkline = ({ color }) => {
  const [points, setPoints] = React.useState(() => Array.from({ length: 10 }, () => 20 + Math.random() * 20));
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1), 20 + Math.random() * 20];
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const pathData = points.map((p, i) => `${i * 10},${p}`).join(' L ');

  return (
    <svg width="100%" height="30" viewBox="0 0 90 60" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.2, pointerEvents: 'none' }}>
      <path
        d={`M 0,${points[0]} L ${pathData}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transition: 'all 1.5s linear' }}
      />
    </svg>
  );
};

const PollutantCard = ({ label, value, unit, limit, color, accentClass, tier = 1 }) => {
  const pct = Math.min(100, Math.round((parseFloat(value) / parseFloat(limit)) * 100));
  const isCritical = pct > 80;

  return (
    <div className="widget" style={{ 
      padding: tier === 1 ? '12px' : '8px 12px', 
      borderLeft: `3px solid ${isCritical ? 'var(--accent-red)' : color}`, 
      minHeight: tier === 1 ? '90px' : '60px', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      background: tier === 1 ? 'rgba(15,15,15,0.7)' : 'rgba(10,10,10,0.4)'
    }}>
      {tier === 1 && <Sparkline color={isCritical ? 'var(--accent-red)' : color} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.5px' }}>{label}</div>
          <div className={accentClass} style={{ fontSize: tier === 1 ? '1.4rem' : '1.1rem', fontWeight: 900, lineHeight: 1, marginTop: '4px', color: isCritical ? 'var(--accent-red)' : undefined }}>
            {value}
            <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 700, marginLeft: '4px' }}>{unit}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <MiniDonut percentage={pct} color={isCritical ? 'var(--accent-red)' : color} size={tier === 1 ? 32 : 24} />
          <div style={{ fontSize: '0.45rem', color: isCritical ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: 800 }}>{pct}%</div>
        </div>
      </div>

      {tier === 1 && (
        <div style={{ fontSize: '0.45rem', color: 'var(--text-secondary)', fontWeight: 700, opacity: 0.6, position: 'relative', zIndex: 2 }}>
          REG_LIMIT: {limit} {unit}
        </div>
      )}
    </div>
  );
};

const PollutantGrid = ({ pollutants }) => {
  if (!pollutants) return null;

  const config = [
    { label: 'PM2.5', value: pollutants.pm25, unit: 'µg/m³', limit: '15', color: 'var(--accent-salmon)', accentClass: 'salmon', tier: 1 },
    { label: 'PM10',  value: pollutants.pm10, unit: 'µg/m³', limit: '45', color: 'var(--accent-gold)',   accentClass: 'gold',   tier: 1 },
    { label: 'NO2',   value: pollutants.no2?.value || pollutants.no2, unit: 'ppb', limit: '21', color: 'var(--accent-cyan)', accentClass: 'cyan', tier: 1 },
    { label: 'SO2',   value: pollutants.so2, unit: 'ppb', limit: '15', color: 'var(--accent-red)', accentClass: 'red', tier: 2 },
    { label: 'CO',    value: pollutants.co, unit: 'mg/m³', limit: '4', color: '#fff', accentClass: '', tier: 2 },
    { label: 'O3',    value: pollutants.o3, unit: 'ppb', limit: '51', color: '#b19cd9', accentClass: '', tier: 2 },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '10px',
      marginTop: '10px'
    }}>
      {config.map((p, idx) => (
        <PollutantCard key={idx} {...p} />
      ))}
    </div>
  );
};

export default PollutantGrid;
