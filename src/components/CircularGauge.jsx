import React from 'react';

const CircularGauge = ({ 
  value, 
  min = 0, 
  max = 100, 
  label, 
  unit = '', 
  size = 110, 
  type = 'semicircle', 
  limitLabel = 'LIMIT', 
  headroomLabel = 'HEADROOM' 
}) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 120);
  const isSemicircle = type === 'semicircle';
  
  const getColor = (pct) => {
    if (pct >= 90) return 'var(--accent-red)';
    if (pct >= 70) return 'var(--accent-gold)';
    return 'var(--accent-cyan)';
  };

  const color = getColor(percentage);
  const strokeWidth = 10;
  const radius = (size / 2) - strokeWidth;
  const center = size / 2;
  
  const circumference = 2 * Math.PI * radius;
  const arcLength = isSemicircle ? circumference / 2 : circumference;
  const offset = isSemicircle 
    ? arcLength - (percentage / 100) * arcLength 
    : circumference - (percentage / 100) * circumference;

  const rotation = isSemicircle ? -180 : -90;
  const showDot = percentage >= 90;
  const showGlow = percentage >= 100;

  // For semicircle, we only want to show the top half
  const svgHeight = isSemicircle ? (size / 2) + 10 : size;
  const containerHeight = isSemicircle ? svgHeight + 45 : size + 20;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: size, 
      height: containerHeight,
      position: 'relative'
    }}>
      <svg 
        width={size} 
        height={svgHeight} 
        viewBox={`0 0 ${size} ${svgHeight}`} 
        style={{ overflow: 'visible' }}
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeDasharray={isSemicircle ? `${arcLength} ${circumference}` : undefined}
          transform={`rotate(${rotation} ${center} ${center})`}
          strokeLinecap="round"
        />
        
        {/* Active Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={isSemicircle ? `${arcLength} ${circumference}` : circumference}
          strokeDashoffset={offset}
          transform={`rotate(${rotation} ${center} ${center})`}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
            filter: showGlow ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
        />

        {/* Blinking Dot */}
        {showDot && !showGlow && (
          <circle
            cx={center + radius * Math.cos((rotation + (percentage / 100) * (isSemicircle ? 180 : 360)) * Math.PI / 180)}
            cy={center + radius * Math.sin((rotation + (percentage / 100) * (isSemicircle ? 180 : 360)) * Math.PI / 180)}
            r={3}
            fill="#fff"
            style={{ animation: 'pulse-dot 1s infinite' }}
          />
        )}
      </svg>

      {/* Value - Positioned inside the arc */}
      <div style={{ 
        position: 'absolute', 
        top: isSemicircle ? '35%' : '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          fontSize: isSemicircle ? '1.5rem' : '2rem', 
          fontWeight: 900, 
          color: color,
          lineHeight: 1
        }}>
          {value}
        </div>
        {!isSemicircle && (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 800 }}>
            {label}
          </div>
        )}
      </div>

      {/* Footer Labels - Below the arc */}
      {isSemicircle && (
        <div style={{ marginTop: '5px', textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {limitLabel}: {max}{unit} | {headroomLabel}: {(max - value).toFixed(1)}{unit}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default CircularGauge;

