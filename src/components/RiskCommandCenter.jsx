import CircularGauge from './CircularGauge';

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

  return (
    <div className="widget" style={{ padding: '16px', background: 'var(--bg-widget)', border: '1px solid rgba(0,240,255,0.1)', flexShrink: 0 }}>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px' }}>
        RISK_COMMAND_CENTER
      </div>

      {/* Gauge row — gauge left, breach status right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <CircularGauge
          type="full"
          label="COMPOSITE_RISK"
          value={compositeScore}
          max={100}
          size={200}
          unit="pts"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>COMPOSITE_RISK</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: compositeScore >= 70 ? 'var(--accent-red)' : compositeScore >= 40 ? 'var(--accent-gold)' : 'var(--accent-cyan)', fontFamily: 'monospace', lineHeight: 1 }}>
            {compositeScore}<span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, marginLeft: '4px' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.5rem', color: breachCount > 0 ? 'var(--accent-red)' : '#00b862', fontWeight: 800, marginTop: '6px', letterSpacing: '1px' }}>
            {breachCount > 0 ? `⚠ ${breachCount} ACTIVE BREACH${breachCount > 1 ? 'ES' : ''}` : '● ALL LIMITS CLEAR'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCommandCenter;


