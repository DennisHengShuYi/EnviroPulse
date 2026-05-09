import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState('aqi');

  const metrics = [
    { id: 'aqi', label: 'AQI', color: '#00f0ff' },
    { id: 'heat', label: 'HEAT INDEX', color: '#ff3e3e' },
    { id: 'pm25', label: 'PM2.5', color: '#ff9f9f' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'rgba(10, 10, 10, 0.95)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          padding: '10px',
          fontSize: '0.7rem',
          backdropFilter: 'blur(5px)'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</p>
          <p style={{ color: metrics.find(m => m.id === activeMetric).color, fontWeight: 700 }}>
            {activeMetric.toUpperCase()}: {payload[0].value.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="trend-area">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1px' }}>24H_TREND_ANALYSIS</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {metrics.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              style={{
                background: activeMetric === m.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                border: activeMetric === m.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.05)',
                color: activeMetric === m.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                padding: '4px 12px',
                fontSize: '0.6rem',
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

      <div style={{ height: '220px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={metrics.find(m => m.id === activeMetric).color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}
              interval={2}
              dy={10}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={metrics.find(m => m.id === activeMetric).color} 
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
