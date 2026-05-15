import React from 'react';

const ArcGauge = ({ label, value, max, unit, headroomLabel, icon: Icon, color = "#2e7d32" }) => {
    // 1. Calculate percentage and clamp it between 0 and 100
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // 2. Map 0-100% to a 180-degree sweep 
    // We start at 180° (Left) and move to 360° (Right)
    const startAngle = 180;
    const endAngle = 360;
    const currentAngle = startAngle + (percentage / 100) * (endAngle - startAngle);

    // 3. Fixed geometry settings
    const width = 100;
    const height = 60;
    const radius = 28;
    const centerX = 50;
    const centerY = 50; // Pivot point for the semi-circle

    // Helper to convert degrees to SVG coordinates
    const polarToCartesian = (cx, cy, rad, angleDeg) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            x: cx + rad * Math.cos(angleRad),
            y: cy + rad * Math.sin(angleRad)
        };
    };

    // Calculate path points
    const bgStart = polarToCartesian(centerX, centerY, radius, 180);
    const bgEnd = polarToCartesian(centerX, centerY, radius, 360);
    const fgPoint = polarToCartesian(centerX, centerY, radius, currentAngle);

    // SVG Path: M (Move to start) A (Arc: rx ry x-axis-rotation large-arc-flag sweep-flag x y)
    const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;
    const fgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${fgPoint.x} ${fgPoint.y}`;

    // Dynamic color: If the value exceeds the max (limit), we can turn it red
    const statusColor = value > max ? "#ef4444" : color;

    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '12px 10px',
            textAlign: 'center',
            color: '#1e293b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <Icon size={20} strokeWidth={2} color={statusColor} />
            </div>

            <div style={{ position: 'relative', height: '50px', width: '100%' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                    {/* Background Gray Track */}
                    <path
                        d={bgPath}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Foreground Progress Track */}
                    <path
                        d={fgPath}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ transition: 'd 0.5s ease-out' }}
                    />
                </svg>
            </div>

            <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    <span style={{ fontSize: '0.7rem', marginLeft: '2px', color: '#64748b' }}>{unit}</span>
                </div>

                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#475569',
                    margin: '4px 0'
                }}>
                    {label.replace(/_/g, ' ')}
                </div>

                <div style={{
                    fontSize: '0.6rem',
                    color: value > max ? '#ef4444' : '#94a3b8',
                    fontWeight: value > max ? 700 : 400
                }}>
                    {headroomLabel}: {max}{unit}
                </div>
            </div>
        </div>
    );
};

export default ArcGauge;