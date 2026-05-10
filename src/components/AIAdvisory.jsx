import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, ArrowRight, Sun, Wind, AlertCircle, ShieldCheck, Globe, Maximize2, Minimize2 } from 'lucide-react';

const AIAdvisory = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeRole, setActiveRole] = useState('construction');

  const fetchAdvisory = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s safety timeout
    
    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: data }),
        signal: controller.signal
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.details || result?.error || 'AI_OFFLINE');
        setAdvisory(result);
      } else {
        const text = await response.text();
        throw new Error(response.status === 502 || response.status === 504 ? 'GATEWAY_TIMEOUT' : 'SERVER_ERROR');
      }
    } catch (err) {
      console.error('Advisor fetch error:', err);
      if (err.name === 'AbortError') {
        setError('REQUEST_TIMEOUT');
      } else if (err.message === 'Failed to fetch') {
        setError('CONNECTION_FAILED');
      } else {
        setError(err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [data?.id]); // Refetch when district changes

  if (!data) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="widget" style={isExpanded ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'rgba(5, 10, 20, 0.98)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)',
      overflowY: 'auto'
    } : { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', minHeight: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={14} className="cyan" />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>AI_HEALTH_ADVISORY</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <RefreshCw 
            size={14} 
            className={`cyan pointer ${loading ? 'spin' : ''}`} 
            onClick={() => !loading && fetchAdvisory()} 
          />
          <button 
            onClick={toggleExpand}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '2px', 
        background: 'rgba(255,255,255,0.05)', 
        padding: '2px', 
        borderRadius: '6px', 
        marginTop: '10px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {['construction', 'government', 'esgFirm'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            style={{
              flex: 1,
              padding: '8px 5px',
              fontSize: '0.6rem',
              fontWeight: 800,
              background: activeRole === role ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeRole === role ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: activeRole === role ? 'inset 0 0 10px rgba(0, 240, 255, 0.1)' : 'none'
            }}
          >
            {role.replace('Firm', '')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <div className="marker-pulse" style={{ width: 24, height: 24, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>ANALYZING_LIVE_DELTA...</span>
        </div>
      ) : error ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{error}</span>
          <button onClick={fetchAdvisory} style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.5rem', padding: '2px 8px', cursor: 'pointer' }}>RETRY</button>
        </div>
      ) : (advisory && advisory[activeRole]) ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          overflowY: 'auto',
          maxHeight: isExpanded ? 'none' : '550px',
          paddingRight: '5px',
          flex: isExpanded ? 1 : 'none',
          marginTop: '15px'
        }}>
          {activeRole === 'construction' && (
            <div style={{ 
              border: '1px solid rgba(255, 184, 0, 0.3)', 
              padding: isExpanded ? '25px' : '15px', 
              borderRadius: '8px', 
              background: 'rgba(255, 184, 0, 0.05)',
              transition: 'all 0.3s ease',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: 'var(--accent-gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={isExpanded ? 18 : 14} /> CONSTRUCTION_SAFETY_INTELLIGENCE
                <span className={`badge ${advisory.construction.riskLevel === 'LOW' ? 'badge-success' : 'badge-danger'}`} style={{ position: 'static', padding: '2px 8px', marginLeft: 'auto', fontSize: isExpanded ? '0.7rem' : '0.6rem' }}>
                  {advisory.construction.riskLevel}_RISK
                </span>
              </div>

              {/* CoT Block */}
              <div style={{ background: 'rgba(255, 184, 0, 0.05)', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid rgba(255, 184, 0, 0.2)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '10px', letterSpacing: '1px' }}>🧠 AI_THINKING_PROCESS — FULL CHAIN OF THOUGHT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {(advisory.construction.chainOfThought || [
                    'Step 1 — Ingesting live sensor data and validating against Malaysian equatorial climate baselines...',
                    'Step 2 — Computing Heat Index via Rothfusz polynomial with humidity correction adjustments...',
                    'Step 3 — Estimating WBGT using ISO 7243 outdoor formula and mapping to DOSH work-intensity tiers...',
                    'Step 4 — Assessing PM2.5/PM10 against WHO 2021 guidelines and DOSH occupational exposure limits...',
                    'Step 5 — Profiling UV radiation risk using MED photobiological model for Malaysian workforce demographics...',
                    'Step 6 — Analysing multi-pollutant synergy: NO2, O3, CO, SO2 interaction and CAQI computation...',
                    'Step 7 — Applying DOSH hierarchy of controls to generate PPE matrix and engineering control priorities...',
                    'Step 8 — Aggregating composite risk score and ranking interventions by criticality for final advisory output...'
                  ]).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>{i+1}</div>
                      <div style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#fff', opacity: 0.9, lineHeight: '1.55' }}>{step}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,184,0,0.15)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', letterSpacing: '1px' }}>TECHNICAL_REASONING_LOGIC:</div>
                  <p style={{ fontSize: isExpanded ? '0.85rem' : '0.75rem', color: '#fff', margin: 0, lineHeight: '1.65' }}>
                    {advisory.construction.technicalReasoning || 'Processing multi-vector metrics for site safety...'}
                  </p>
                </div>
              </div>

              {/* Detailed Risk Analysis */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>TECHNICAL_RISK_ANALYSIS</div>
                <p style={{ fontSize: isExpanded ? '0.88rem' : '0.75rem', lineHeight: '1.7', color: '#eee', margin: 0 }}>
                  {advisory.construction.detailedAnalysis}
                </p>
              </div>

              {/* Health Risk Breakdown */}
              {advisory.construction.healthRiskBreakdown && (
                <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr 1fr' : '1fr', gap: '10px', marginBottom: '18px' }}>
                  {Object.entries(advisory.construction.healthRiskBreakdown).map(([key, val]) => (
                    <div key={key} style={{ padding: '12px', background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, '_$1').toUpperCase()}:</div>
                      <div style={{ fontSize: isExpanded ? '0.8rem' : '0.68rem', color: '#ddd', lineHeight: '1.55' }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Work / Rest + PPE + Compliance */}
              <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px', fontSize: isExpanded ? '0.8rem' : '0.65rem', marginBottom: '18px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.55rem', letterSpacing: '0.5px' }}>WORK_REST_CYCLE</div>
                  <div style={{ color: '#fff', fontWeight: 600, lineHeight: '1.5' }}>{advisory.construction.workRestCycle}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.55rem', letterSpacing: '0.5px' }}>SAFETY_PPE_SPEC</div>
                  <div style={{ color: '#fff', fontWeight: 600, lineHeight: '1.5' }}>{advisory.construction.safetyPPE}</div>
                </div>
                {isExpanded && advisory.construction.regulatoryCompliance && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.55rem', letterSpacing: '0.5px' }}>REGULATORY_COMPLIANCE</div>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.72rem', lineHeight: '1.5' }}>{advisory.construction.regulatoryCompliance}</div>
                  </div>
                )}
              </div>

              {/* Site Actions */}
              <div style={{ borderTop: '1px solid rgba(255,184,0,0.1)', paddingTop: '15px' }}>
                <div style={{ fontSize: isExpanded ? '0.7rem' : '0.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '12px', letterSpacing: '1px' }}>SITE_SAFETY_INTERVENTIONS ({advisory.construction.siteActions?.length || 0} ACTIONS):</div>
                <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: '10px' }}>
                  {advisory.construction.siteActions.map((act, i) => (
                    <div key={i} style={{ fontSize: isExpanded ? '0.8rem' : '0.7rem', display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#ccc', lineHeight: '1.5', padding: '8px', background: 'rgba(255,184,0,0.03)', borderRadius: '4px', border: '1px solid rgba(255,184,0,0.08)' }}>
                      <ArrowRight size={isExpanded ? 14 : 12} className="gold" style={{ marginTop: '3px', flexShrink: 0 }} /> <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeRole === 'government' && (
            <div style={{ 
              border: '1px solid rgba(0, 240, 255, 0.3)', 
              padding: isExpanded ? '25px' : '15px', 
              borderRadius: '8px', 
              background: 'rgba(0, 240, 255, 0.05)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: 'var(--accent-cyan)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={isExpanded ? 18 : 14} className="cyan" /> GOVERNMENT_POLICY_INTELLIGENCE
              </div>

              {/* CoT Block */}
              <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '10px', letterSpacing: '1px' }}>🧠 STRATEGIC_THINKING_STEPS — FULL CHAIN OF THOUGHT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {(advisory.government.chainOfThought || [
                    'Step 1 — Evaluating regional AQI against DOE Malaysia API six-band classification and statutory notification requirements...',
                    'Step 2 — Mapping population vulnerability indices across age, pre-existing illness, and outdoor workforce demographics...',
                    'Step 3 — Modelling healthcare system capacity and A&E surge risk against seasonal admission trend baselines...',
                    'Step 4 — Computing electricity grid and water utility demand elasticity under elevated ambient temperature conditions...',
                    'Step 5 — Assessing public transport thermal comfort and ridership impact at peak heat hours...',
                    'Step 6 — Evaluating EQA 1974, KKM heat illness guidelines, and mandatory DOE/DOSH reporting thresholds...',
                    'Step 7 — Determining inter-agency coordination tier across DOE, DOSH, KKM, APM, and NADMA frameworks...',
                    'Step 8 — Finalising escalation decision and public communication strategy across all delivery channels...'
                  ]).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-cyan)', color: '#000', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>{i+1}</div>
                      <div style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#fff', opacity: 0.9, lineHeight: '1.55' }}>{step}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(0,240,255,0.15)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '1px' }}>DECISION_JUSTIFICATION:</div>
                  <p style={{ fontSize: isExpanded ? '0.85rem' : '0.75rem', color: '#fff', margin: 0, lineHeight: '1.65' }}>
                    {advisory.government.technicalReasoning || 'Analyzing policy triggers and infrastructure load...'}
                  </p>
                </div>
              </div>

              {/* Public Health Assessment */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>PUBLIC_HEALTH_ASSESSMENT</div>
                <p style={{ fontSize: isExpanded ? '0.88rem' : '0.75rem', lineHeight: '1.7', color: '#eee', margin: 0 }}>
                  {advisory.government.publicStatus}
                </p>
              </div>

              {/* Population at Risk */}
              {advisory.government.populationAtRisk && (
                <div style={{ marginBottom: '18px', padding: '14px', background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '1px' }}>POPULATION_AT_RISK_BREAKDOWN:</div>
                  <p style={{ fontSize: isExpanded ? '0.85rem' : '0.72rem', lineHeight: '1.65', color: '#ddd', margin: 0 }}>
                    {advisory.government.populationAtRisk}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: isExpanded ? '0.8rem' : '0.7rem' }}>
                {/* Policy Trigger */}
                <div style={{ padding: '14px', background: 'rgba(0, 240, 255, 0.08)', borderRadius: '6px', borderLeft: '4px solid var(--accent-cyan)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.6rem', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>POLICY_TRIGGER_PROTOCOL:</span>
                  <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.88rem' : '0.75rem', fontWeight: 600, lineHeight: '1.6' }}>{advisory.government.policyTrigger}</p>
                </div>

                {/* Emergency Protocol */}
                {advisory.government.emergencyProtocol && (
                  <div style={{ padding: '14px', background: 'rgba(255,60,60,0.05)', borderRadius: '6px', borderLeft: '4px solid rgba(255,60,60,0.5)' }}>
                    <span style={{ fontWeight: 800, color: '#ff6b6b', fontSize: '0.6rem', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>EMERGENCY_RESPONSE_PROTOCOL:</span>
                    <p style={{ margin: 0, color: '#ddd', fontSize: isExpanded ? '0.85rem' : '0.72rem', lineHeight: '1.65' }}>{advisory.government.emergencyProtocol}</p>
                  </div>
                )}

                {/* Infrastructure + Regulatory */}
                <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.55rem', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>INFRASTRUCTURE_IMPACT:</span>
                    <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.85rem' : '0.72rem', lineHeight: '1.6' }}>{advisory.government.infrastructureImpact}</p>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.55rem', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>REGULATORY_FRAMEWORK:</span>
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.8rem', lineHeight: '1.6' }}>EQA 1974 / Act 127 Compliance · Environmental Quality (Clean Air) Regulations 2014 · DOSH OSHA 1994 (Act 514)</p>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: isExpanded ? '0.78rem' : '0.6rem', color: 'var(--accent-cyan)', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  AUTHORITY_ESCALATION: {advisory.government.escalationContact}
                </div>
              </div>
            </div>
          )}

          {activeRole === 'esgFirm' && (
            <div style={{ 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: isExpanded ? '30px' : '15px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.02)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={isExpanded ? 18 : 14} className="cyan" /> ESG_SUSTAINABILITY_AUDIT
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: isExpanded ? '1.5rem' : '0.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{advisory.esgFirm.complianceRating}</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>PERFORMANCE_GRADE</div>
                </div>
              </div>

              {/* CoT Block */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '1px' }}>🧠 ESG_AUDIT_TRAIL — FULL CHAIN OF THOUGHT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {(advisory.esgFirm.chainOfThought || [
                    'Step 1 — Mapping Scope 1/2/3 carbon intensity using TNB grid emission factors and ambient-temperature-driven energy demand elasticity model...',
                    'Step 2 — Verifying GRI 305-1/2/3 and 305-7 data availability from sensor outputs and flagging disclosure gaps for investor materiality assessment...',
                    'Step 3 — Conducting TCFD physical climate risk assessment using current Heat Index and AQI as near-term indicators against IPCC RCP scenarios...',
                    'Step 4 — Scoring UN SDG 3.9, 11.6, and 13.1 alignment using environmental sensor readings and GRI-SDG Mapping Guide methodology...',
                    'Step 5 — Evaluating biodiversity impact using NO2/O3 deposition models and AOT40 ozone phytotoxicity index on urban vegetation...',
                    'Step 6 — Mapping all pollutant readings against EQA 1974 and Environmental Quality (Clean Air) Regulations 2014 ambient standards...',
                    'Step 7 — Assessing ESG investor disclosure risk through MSCI ESG, Sustainalytics, and EU SFDR PAI indicator frameworks...',
                    'Step 8 — Computing weighted ESG pillar scores and finalising grade using Bursa Malaysia ESG Disclosure Framework rubric...'
                  ]).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: '#fff', color: '#000', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>{i+1}</div>
                      <div style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#fff', opacity: 0.9, lineHeight: '1.55' }}>{step}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>AUDIT_SCORE_JUSTIFICATION:</div>
                  <p style={{ fontSize: isExpanded ? '0.85rem' : '0.75rem', color: '#fff', margin: 0, lineHeight: '1.65' }}>
                    {advisory.esgFirm.technicalReasoning || 'Processing ESG compliance metrics...'}
                  </p>
                </div>
              </div>

              {/* Environmental Performance */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>ENVIRONMENTAL_PERFORMANCE_NARRATIVE</div>
                <p style={{ fontSize: isExpanded ? '0.88rem' : '0.75rem', margin: 0, lineHeight: '1.7', color: '#eee' }}>
                  {advisory.esgFirm.environmentalPerformance}
                </p>
              </div>

              {/* Carbon + SDG Row */}
              {(advisory.esgFirm.carbonImpact || advisory.esgFirm.sdgAlignment) && (
                <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '18px' }}>
                  {advisory.esgFirm.carbonImpact && (
                    <div style={{ padding: '14px', background: 'rgba(255,60,60,0.05)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#ff8888', marginBottom: '7px', letterSpacing: '0.5px' }}>CARBON_IMPACT (SCOPE 1/2/3):</div>
                      <p style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#eee', margin: 0, lineHeight: '1.6' }}>{advisory.esgFirm.carbonImpact}</p>
                    </div>
                  )}
                  {advisory.esgFirm.sdgAlignment && (
                    <div style={{ padding: '14px', background: 'rgba(0,200,100,0.05)', border: '1px solid rgba(0,200,100,0.2)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#66ffaa', marginBottom: '7px', letterSpacing: '0.5px' }}>UN_SDG_ALIGNMENT:</div>
                      <p style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#eee', margin: 0, lineHeight: '1.6' }}>{advisory.esgFirm.sdgAlignment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mitigation Roadmap */}
              <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '18px', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.12)', marginBottom: '18px' }}>
                <div style={{ fontSize: isExpanded ? '0.7rem' : '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>STRATEGIC_MITIGATION_ROADMAP:</div>
                <div style={{ fontSize: isExpanded ? '0.9rem' : '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, lineHeight: '1.6' }}>{advisory.esgFirm.mitigationStrategy}</div>
              </div>

              {/* Regulatory + Reporting */}
              <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: '12px' }}>
                <div style={{ fontSize: isExpanded ? '0.75rem' : '0.65rem', color: '#aaa', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: '#ccc', letterSpacing: '0.5px' }}>REGULATORY_CONTEXT</div>
                  {advisory.esgFirm.regulatoryContext}
                </div>
                {isExpanded && (
                  <div style={{ fontSize: '0.75rem', color: '#aaa', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 800, marginBottom: '6px', color: '#ccc', letterSpacing: '0.5px' }}>REPORTING_FRAMEWORK</div>
                    GRI 305: Emissions (Scope 1/2/3) · GRI 306: Waste · GRI 413: Local Communities · TCFD Physical & Transition Risk Disclosures · Bursa Malaysia ESG Mandatory Framework (FY2025) · UN Global Compact SDG Industry Matrix
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={fetchAdvisory} style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '5px 15px', fontWeight: 800, fontSize: '0.6rem', cursor: 'pointer' }}>GENERATE_ADVISORY</button>
        </div>
      )}
    </div>
  );
};

export default AIAdvisory;
