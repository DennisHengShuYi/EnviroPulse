import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendChart = ({ data, isHazeSimulated }) => {
  const [activeMetric, setActiveMetric] = useState('pm25');

  const metrics = [
    { id: 'pm25', label: 'PM2.5 CONC.', color: '#00f0ff' },
    { id: 'aqi', label: 'DOE API', color: '#00f0ff' },
    { id: 'heat', label: 'HEAT INDEX', color: '#ff3e3e' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isExceeding = (activeMetric === 'pm25' && val > 15) || isHazeSimulated;
      return (
        <div style={{ 
          background: 'rgba(7, 7, 7, 0.95)', 
          border: isExceeding ? '1px solid #ff3e3e' : '1px solid rgba(255,255,255,0.1)', 
          padding: '10px',
          fontSize: '0.7rem',
          backdropFilter: 'blur(5px)',
          borderRadius: '4px'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 800 }}>{label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ color: isExceeding ? '#ff3e3e' : metrics.find(m => m.id === activeMetric).color, fontWeight: 900, fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {activeMetric.toUpperCase()}: {val.toFixed(1)} {activeMetric === 'pm25' ? 'µg/m³' : ''}
            </p>
            {payload[1] && (
               <p style={{ color: 'var(--accent-gold)', fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                 PROD_EFFICIENCY: {payload[1].value.toFixed(1)}%
               </p>
            )}
          </div>
          {(isExceeding || isHazeSimulated) && (
            <span style={{ fontSize: '0.55rem', color: '#ff3e3e', fontWeight: 800, display: 'block', marginTop: '4px' }}>
              ⚠️ {isHazeSimulated ? 'CRITICAL HAZE EVENT RECORDED' : 'EXCEEDS WHO LIMIT (15 µg/m³)'}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Compute offset where y = 15 falls in the dataset range
  const getGradientOffset = () => {
    if ((activeMetric !== 'pm25' && !isHazeSimulated) || !data || !data.length) return 0;
    const vals = data.map(i => i[activeMetric] || 0);
    const dataMax = Math.max(...vals);
    const dataMin = Math.min(...vals);
    const threshold = activeMetric === 'pm25' ? 15 : (activeMetric === 'aqi' ? 100 : 35);
    if (dataMax <= threshold) return 0; 
    if (dataMin >= threshold) return 1; 
    return (dataMax - threshold) / (dataMax - dataMin);
  };

  const offset = getGradientOffset();

  return (
    <div className="trend-area" style={{ background: '#070707', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '1px' }}>COMPLIANCE_TREND_MONITOR</span>
          {(activeMetric === 'pm25' || isHazeSimulated) && (
            <span style={{ fontSize: '0.55rem', color: '#ff3e3e', fontWeight: 800 }}>
              {isHazeSimulated ? '⚠️ HAZE SIMULATION ACTIVE - ECONOMIC IMPACT VIEW' : 'WHO AQG Exceedance Audit View Active'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {metrics.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              style={{
                background: activeMetric === m.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                border: activeMetric === m.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.05)',
                color: activeMetric === m.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                padding: '4px 10px',
                fontSize: '0.55rem',
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '220px', width: '100%', minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                {activeMetric === 'pm25' ? (
                  <>
                    <stop offset="0%" stopColor="#ff3e3e" stopOpacity={0.6}/>
                    <stop offset={`${offset * 100}%`} stopColor="#ff3e3e" stopOpacity={0.15}/>
                    <stop offset={`${offset * 100}%`} stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0}/>
                  </>
                ) : (
                  <>
                    <stop offset="5%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0}/>
                  </>
                )}
              </linearGradient>
              {activeMetric === 'pm25' && (
                <linearGradient id="strokeMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff3e3e" />
                  <stop offset={`${offset * 100}%`} stopColor="#ff3e3e" />
                  <stop offset={`${offset * 100}%`} stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 700 }}
              interval={2}
              dy={10}
            />
            <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              tick={{ fill: 'var(--accent-gold)', fontSize: 8, fontWeight: 800 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Legend Overlay */}
            <foreignObject x="0" y="-10" width="100%" height="20" style={{ overflow: 'visible' }}>
              <div style={{ display: 'flex', gap: '15px', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 2, background: metrics.find(m => m.id === activeMetric).color }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>{activeMetric.toUpperCase()} Level</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 2, background: 'var(--accent-gold)' }}></div>
                  <span style={{ color: 'var(--accent-gold)' }}>Economic Impact (Est. Productivity Loss)</span>
                </div>
              </div>
            </foreignObject>

            {activeMetric === 'pm25' && (
              <ReferenceLine 
                yAxisId="left"
                y={15} 
                stroke="#ff3e3e" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: "WHO LIMIT: 15 µg/m³", 
                  fill: "#ff3e3e", 
                  fontSize: 8, 
                  fontWeight: 900,
                  position: 'insideTopLeft',
                  dy: -5
                }} 
              />
            )}
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey={activeMetric} 
              stroke={activeMetric === 'pm25' ? "url(#strokeMetric)" : metrics.find(m => m.id === activeMetric).color} 
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              strokeWidth={2.5}
            />

            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey={(d) => {
                // Logic: AQI < 50 -> 100%. Heat Index 38 -> 40%.
                const aqiVal = d.aqi || 0;
                const heatVal = d.heat || 31;
                
                let prod = 100;
                if (aqiVal > 50) prod -= (aqiVal - 50) * 0.4;
                if (heatVal > 31) prod -= (heatVal - 31) * 8;
                
                return Math.max(10, Math.min(100, prod));
              }} 
              stroke="var(--accent-gold)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
