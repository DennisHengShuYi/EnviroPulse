import React, { useState, useEffect } from 'react';

const SVG_W = 100;  // viewBox width (%)
const SVG_H = 36;   // viewBox height (px)
const HISTORY = 20; // number of points

/**
 * Sparkline that tracks real sensor values.
 * - Maintains a rolling buffer seeded from the live `realValue`
 * - Every 1.5 s it appends: realValue + small noise ± occasional spike
 * - Y-axis auto-scales to the visible window so the curve fills the chart
 */
const Sparkline = ({ color, realValue }) => {
  const numVal = parseFloat(realValue) || 0;
  const noiseAmt = Math.max(numVal * 0.02, 0.05); // ±2% of real value

  const nextPoint = (base) => {
    const noise = (Math.random() - 0.5) * noiseAmt * 2;
    const spike = Math.random() < 0.22 ? (Math.random() - 0.5) * base * 0.15 : 0;
    return Math.max(0, base + noise + spike);
  };

  const [history, setHistory] = useState(() =>
    Array.from({ length: HISTORY }, () => nextPoint(numVal))
  );

  // Sync when real value changes (district switch etc.)
  useEffect(() => {
    setHistory(Array.from({ length: HISTORY }, () => nextPoint(numVal)));
  }, [numVal]);

  // Animate: push new point, drop oldest
  useEffect(() => {
    const id = setInterval(() => {
      setHistory(prev => [...prev.slice(1), nextPoint(numVal)]);
    }, 1500);
    return () => clearInterval(id);
  }, [numVal]);

  // Scale history values → SVG pixel y (inverted: high value = low y)
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const toY = v => SVG_H - 2 - ((v - min) / range) * (SVG_H - 4);

  const pts = history
    .map((v, i) => `${(i / (HISTORY - 1)) * SVG_W},${toY(v).toFixed(2)}`)
    .join(' ');

  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="none"
      width="100%"
      height="36"
      style={{ display: 'block', opacity: 0.75 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Filled area under line */}
      <polygon
        fill={`url(#${gradId})`}
        points={`0,${SVG_H} ${pts} ${SVG_W},${SVG_H}`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
};

const PollutantCard = ({ label, value, unit, limit, color, accentClass, hazeLevel }) => {
  const getSimulatedValue = () => {
    if (hazeLevel === 0) return value;
    const base = parseFloat(value);
    if (label === 'PM2.5') {
      if (hazeLevel === 1) return (base * 4).toFixed(1);
      if (hazeLevel === 2) return (base * 10).toFixed(1);
      if (hazeLevel === 3) return (base * 25).toFixed(1);
    }
    if (label === 'PM10') {
      if (hazeLevel === 1) return (base * 2).toFixed(1);
      if (hazeLevel === 2) return (base * 5).toFixed(1);
      if (hazeLevel === 3) return (base * 12).toFixed(1);
    }
    return (base * (1 + hazeLevel * 0.5)).toFixed(1);
  };

  const simulatedValue = getSimulatedValue();
  const pct = Math.min(100, Math.round((parseFloat(simulatedValue) / parseFloat(limit)) * 100));

  return (
    <div className="widget" style={{ 
      padding: '8px 12px', 
      borderLeft: `2px solid ${color}`, 
      minHeight: 'auto',
      borderColor: hazeLevel > 0 && pct > 80 ? 'var(--accent-red)' : color,
      background: hazeLevel > 0 && pct > 100 ? 'rgba(255,0,0,0.05)' : '#0a0a0a'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{label}</span>
        <span className={accentClass} style={{ fontSize: '0.75rem', fontWeight: 800, color: hazeLevel > 0 && pct > 100 ? '#ff4444' : '' }}>
          {simulatedValue} <small style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{unit}</small>
        </span>
      </div>

      <div style={{ margin: '4px 0' }}>
        <Sparkline color={color} realValue={simulatedValue} />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
          <span>LIM: {limit}</span>
          <span style={{ color: pct > 100 ? '#ff4444' : '' }}>{pct}%</span>
        </div>
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct > 100 ? '#ff4444' : color, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
};

const PollutantGrid = ({ pollutants, hazeLevel }) => {
  if (!pollutants) return null;

  const config = [
    { label: 'PM2.5', value: pollutants.pm25,                          unit: 'µg/m³', limit: '15', color: 'var(--accent-salmon)', accentClass: 'salmon' },
    { label: 'PM10',  value: pollutants.pm10,                          unit: 'µg/m³', limit: '45', color: 'var(--accent-gold)',   accentClass: 'gold'   },
    { label: 'NO₂',  value: pollutants.no2?.value || pollutants.no2,  unit: 'ppb',   limit: '21', color: pollutants.no2?.status === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)', accentClass: pollutants.no2?.status === 'CRITICAL' ? 'red' : 'cyan' },
    { label: 'SO₂',  value: pollutants.so2,                           unit: 'ppb',   limit: '15', color: 'var(--accent-red)',    accentClass: 'red'    },
    { label: 'CO',   value: pollutants.co,                            unit: 'mg/m³', limit: '4',  color: '#fff',                accentClass: ''       },
    { label: 'O₃',  value: pollutants.o3,                            unit: 'ppb',   limit: '51', color: '#b19cd9',             accentClass: ''       },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {config.map((p, idx) => (
        <PollutantCard key={idx} {...p} hazeLevel={hazeLevel} />
      ))}
    </div>
  );
};

export default PollutantGrid;
