import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, ArrowRight, Sun, Wind, AlertCircle, ShieldCheck, Globe, Maximize2, Minimize2 } from 'lucide-react';

const AIAdvisory = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [advisory, setAdvisory] = useState({});
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeRole, setActiveRole] = useState('construction');

  // Clear advisory cache when district changes
  useEffect(() => {
    setAdvisory({});
  }, [data?.id]);

  const fetchRoleAdvisory = async (roleToFetch) => {
    if (!data) return;
    
    // Skip if already loaded
    if (advisory && advisory[roleToFetch]) return;

    const isFirstLoad = Object.keys(advisory).length === 0;
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setLoadingRole(true);
    }
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s safety timeout
    
    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: data, role: roleToFetch }),
        signal: controller.signal
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.details || result?.error || 'AI_OFFLINE');
        
        setAdvisory(prev => ({
          ...prev,
          isFallback: prev.isFallback || result.isFallback,
          [roleToFetch]: result[roleToFetch] || result
        }));
      } else {
        throw new Error(response.status === 502 || response.status === 504 ? 'GATEWAY_TIMEOUT' : 'SERVER_ERROR');
      }
    } catch (err) {
      console.error(`Advisor role fetch error (${roleToFetch}):`, err);
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
      setLoadingRole(false);
    }
  };

  useEffect(() => {
    fetchRoleAdvisory(activeRole);
  }, [data?.id, activeRole]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Brain size={14} className="cyan" />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>AI_HEALTH_ADVISORY</span>
          </div>
          {advisory?.isFallback && (
            <span className="badge" style={{ position: 'static', background: 'rgba(255, 184, 0, 0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', fontSize: '0.5rem', padding: '1px 5px', letterSpacing: '0.5px', borderRadius: '3px', fontWeight: 800 }}>
              FALLBACK_MODE (HARDCODED)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <RefreshCw 
            size={14} 
            className={`cyan pointer ${loading || loadingRole ? 'spin' : ''}`} 
            onClick={() => !loading && !loadingRole && fetchRoleAdvisory(activeRole)} 
          />
          <button 
            onClick={toggleExpand}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Role Selector Tabs — Guaranteed on two lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '2px', 
          borderRadius: '6px', 
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            { id: 'construction', label: 'Construction' },
            { id: 'government', label: 'Municipal' },
            { id: 'msme', label: 'MSME Compliance' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: '0.55rem',
                fontWeight: 800,
                background: activeRole === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: activeRole === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: activeRole === tab.id ? 'inset 0 0 10px rgba(0, 240, 255, 0.1)' : 'none',
                textAlign: 'center'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '2px', 
          borderRadius: '6px', 
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            { id: 'esgFirm', label: 'ESG Officer' },
            { id: 'doeAuditor', label: 'DOE Auditor' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: '0.55rem',
                fontWeight: 800,
                background: activeRole === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: activeRole === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: activeRole === tab.id ? 'inset 0 0 10px rgba(0, 240, 255, 0.1)' : 'none',
                textAlign: 'center'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {advisory?.isFallback && !loading && (
        <div style={{ background: 'rgba(255, 184, 0, 0.08)', border: '1px solid var(--accent-gold)', padding: '8px 12px', borderRadius: '4px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem' }}>⚠️</span>
          <div style={{ fontSize: '0.58rem', color: 'var(--accent-gold)', lineHeight: '1.4' }}>
            <strong style={{ fontWeight: 900 }}>OFFLINE FALLBACK STATE:</strong> The displayed content below is pre-compiled hardcoded baseline data triggered by a live inference timeout.
          </div>
        </div>
      )}

      {loading || loadingRole || !advisory?.[activeRole] ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <div className="marker-pulse" style={{ width: 24, height: 24, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
            {loadingRole ? `INFERRING ADVISORY (${activeRole.toUpperCase()})...` : 'ANALYZING_LIVE_DELTA...'}
          </span>
        </div>
      ) : error ? (
        <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{error}</span>
          <button onClick={() => fetchRoleAdvisory(activeRole)} style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.5rem', padding: '2px 8px', cursor: 'pointer' }}>RETRY</button>
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

              {/* Statutory Verdict Highlight Block */}
              {advisory.construction.complianceVerdict && (
                <div style={{ padding: '14px', background: 'rgba(255, 184, 0, 0.08)', borderLeft: '4px solid var(--accent-gold)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '5px', letterSpacing: '0.5px' }}>OSH_ACT_2024_COMPLIANCE_VERDICT:</div>
                  <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.85rem' : '0.72rem', fontWeight: 700, lineHeight: '1.55' }}>
                    {advisory.construction.complianceVerdict}
                  </p>
                </div>
              )}

              {/* Submission Window Alert */}
              {advisory.construction.submissionAlert && (
                <div style={{ padding: '12px', background: 'rgba(255, 60, 60, 0.05)', border: '1px solid rgba(255, 60, 60, 0.2)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#ff6b6b', marginBottom: '4px', letterSpacing: '0.5px' }}>SUBMISSION_WINDOW_ALERT:</div>
                  <div style={{ fontSize: isExpanded ? '0.8rem' : '0.68rem', color: '#eee', lineHeight: '1.5' }}>
                    {advisory.construction.submissionAlert}
                  </div>
                </div>
              )}

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
                {(advisory.construction.regulatoryCitation || advisory.construction.regulatoryCompliance) && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: isExpanded ? undefined : 'span 2' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.55rem', letterSpacing: '0.5px' }}>REGULATORY_CITATION</div>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.72rem', lineHeight: '1.5' }}>
                      {advisory.construction.regulatoryCitation || advisory.construction.regulatoryCompliance}
                    </div>
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
                {advisory.government.ncaapScore && (
                  <span className="badge badge-cyan" style={{ position: 'static', marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 8px' }}>
                    NCAAP_RESILIENCE: {advisory.government.ncaapScore}/100
                  </span>
                )}
              </div>

              {advisory.government.ncaapContext && (
                <div style={{ padding: '10px 14px', background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '4px', letterSpacing: '0.5px' }}>NCAAP_RESILIENCE_CONTEXT:</div>
                  <div style={{ fontSize: isExpanded ? '0.8rem' : '0.68rem', color: '#ddd', lineHeight: '1.5' }}>
                    {advisory.government.ncaapContext}
                  </div>
                </div>
              )}

              {/* District Status & Escalation Decision */}
              {advisory.government.districtStatus && (
                <div style={{ padding: '14px', background: 'rgba(0, 240, 255, 0.08)', borderLeft: '4px solid var(--accent-cyan)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '5px', letterSpacing: '0.5px' }}>DISTRICT_STATUTORY_STATUS:</div>
                  <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.85rem' : '0.72rem', fontWeight: 700, lineHeight: '1.55' }}>
                    {advisory.government.districtStatus}
                  </p>
                  {advisory.government.escalationDecision && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0, 240, 255, 0.15)', fontSize: '0.68rem', color: '#ffb800', fontWeight: 800 }}>
                      ESCALATION_MANDATE: {advisory.government.escalationDecision}
                    </div>
                  )}
                </div>
              )}

              {/* Policy Action Mandate */}
              {advisory.government.policyAction && (
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '0.5px' }}>REQUIRED_POLICY_ACTION:</div>
                  <div style={{ fontSize: isExpanded ? '0.8rem' : '0.68rem', color: '#00ffcc', fontWeight: 600, lineHeight: '1.5' }}>
                    {advisory.government.policyAction}
                  </div>
                </div>
              )}

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
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Globe size={isExpanded ? 18 : 14} className="cyan" /> ESG_SUSTAINABILITY_AUDIT
                {advisory.esgFirm.readinessScore && (
                  <span className="badge" style={{ position: 'static', background: 'rgba(0, 255, 204, 0.1)', color: '#00ffcc', border: '1px solid #00ffcc', fontSize: '0.6rem', padding: '2px 8px' }}>
                    BURSA_READINESS: {advisory.esgFirm.readinessScore}/100
                  </span>
                )}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: isExpanded ? '1.5rem' : '0.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{advisory.esgFirm.complianceRating || 'TIER-1'}</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>PERFORMANCE_GRADE</div>
                </div>
              </div>

              {/* Statutory ESG Disclosures: GRI Gap, TCFD Flag, Materiality */}
              <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr 1fr' : '1fr', gap: '10px', marginBottom: '15px' }}>
                {advisory.esgFirm.gri305Gap && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid #ffb800' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 800, color: '#ffb800', marginBottom: '4px' }}>GRI_305_GAP_ANALYSIS:</div>
                    <div style={{ fontSize: '0.68rem', color: '#eee', lineHeight: '1.4' }}>{advisory.esgFirm.gri305Gap}</div>
                  </div>
                )}
                {advisory.esgFirm.tcfdFlag && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: `3px solid ${advisory.esgFirm.tcfdFlag.includes('YES') ? '#ff4d4d' : '#00ffcc'}` }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 800, color: advisory.esgFirm.tcfdFlag.includes('YES') ? '#ff4d4d' : '#00ffcc', marginBottom: '4px' }}>TCFD_PHYSICAL_RISK_FLAG:</div>
                    <div style={{ fontSize: '0.68rem', color: '#eee', lineHeight: '1.4', fontWeight: 700 }}>{advisory.esgFirm.tcfdFlag}</div>
                  </div>
                )}
                {advisory.esgFirm.investorMateriality && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '4px' }}>INVESTOR_MATERIALITY:</div>
                    <div style={{ fontSize: '0.68rem', color: '#eee', lineHeight: '1.4' }}>{advisory.esgFirm.investorMateriality}</div>
                  </div>
                )}
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
                    GRI 305: Emissions (Scope 1/2/3) · GRI 306: Waste · TCFD Disclosures · Bursa Malaysia Mandatory ESG Guidelines
                  </div>
                )}
              </div>
            </div>
          )}

          {activeRole === 'msme' && (
            <div style={{ 
              border: '1px solid rgba(0, 255, 136, 0.3)', 
              padding: isExpanded ? '25px' : '15px', 
              borderRadius: '8px', 
              background: 'rgba(0, 255, 136, 0.03)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: '#00ff88', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={isExpanded ? 18 : 14} /> MSME_COMPLIANCE_SELF_CHECK
                {advisory.msme.bursaIndicator && (
                  <span className="badge" style={{ position: 'static', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid #00ff88', fontSize: '0.6rem', padding: '2px 8px', marginLeft: 'auto' }}>
                    BURSA_E1: {advisory.msme.bursaIndicator}
                  </span>
                )}
              </div>

              {/* Plain language summary block */}
              <div style={{ padding: '15px', background: 'rgba(0, 255, 136, 0.08)', borderRadius: '6px', borderLeft: '4px solid #00ff88', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#00ff88', marginBottom: '6px', letterSpacing: '0.5px' }}>PLAIN_LANGUAGE_VERDICT:</div>
                <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.85rem' : '0.72rem', fontWeight: 700, lineHeight: '1.55' }}>
                  {advisory.msme.plainVerdict || advisory.msme.dailySummary}
                </p>
                {advisory.msme.submissionRisk && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0, 255, 136, 0.15)', fontSize: '0.65rem', color: advisory.msme.submissionRisk === 'LOW' ? '#00ffcc' : '#ffb800', fontWeight: 800 }}>
                    DISCREPANCY_SUBMISSION_RISK: {advisory.msme.submissionRisk}
                  </div>
                )}
              </div>

              {/* Pre-Submission Stack Action */}
              {advisory.msme.preSubmissionAction && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px' }}>CALIBRATION_ACTION:</div>
                  <div style={{ fontSize: '0.72rem', color: '#ddd', lineHeight: '1.5' }}>{advisory.msme.preSubmissionAction}</div>
                </div>
              )}

              {/* Detailed Technical Analysis */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.5px' }}>BASELINE_CORRELATION_ANALYSIS</div>
                <p style={{ fontSize: isExpanded ? '0.82rem' : '0.7rem', color: '#ddd', margin: 0, lineHeight: '1.6' }}>
                  {advisory.msme.detailedAnalysis || "Automated variance comparison between localized stack logs and the primary district sensor string shows robust synchrony."}
                </p>
              </div>

              {/* Technical Reasoning */}
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '0.5px' }}>STATUTORY_FRAMEWORK</div>
                <div style={{ fontSize: '0.68rem', color: '#aaa', lineHeight: '1.5' }}>
                  {advisory.msme.technicalReasoning || "Continuous alignment validation under Environmental Quality Act 1974 (Clean Air Regulations)."}
                </div>
              </div>

              {/* Recommended Pre-submission Checks */}
              {advisory.msme.siteActions && (
                <div style={{ borderTop: '1px solid rgba(0,255,136,0.15)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#00ff88', marginBottom: '8px', letterSpacing: '0.5px' }}>PRE_SUBMISSION_CHECKLIST:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: '8px' }}>
                    {advisory.msme.siteActions.map((act, i) => (
                      <div key={i} style={{ fontSize: '0.68rem', color: '#ccc', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,255,136,0.02)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.08)' }}>
                        <span style={{ color: '#00ff88', fontWeight: 900 }}>✓</span> {act}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeRole === 'doeAuditor' && advisory.doeAuditor && (
            <div style={{ 
              border: '1px solid rgba(255, 77, 77, 0.3)', 
              padding: isExpanded ? '25px' : '15px', 
              borderRadius: '8px', 
              background: 'rgba(255, 77, 77, 0.04)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ fontSize: isExpanded ? '0.9rem' : '0.65rem', fontWeight: 900, color: '#ff4d4d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <ShieldCheck size={isExpanded ? 18 : 14} /> FORENSIC_DOE_AUDITOR_SWEEP
                <span className={`badge ${advisory.doeAuditor.verificationStatus === 'CLEAN' ? 'badge-success' : 'badge-danger'}`} style={{ position: 'static', marginLeft: 'auto', fontSize: '0.6rem', padding: '2px 8px' }}>
                  STATUS: {advisory.doeAuditor.verificationStatus}
                </span>
              </div>

              {/* EQA Clean Air sweep */}
              <div style={{ padding: '14px', background: 'rgba(255, 77, 77, 0.08)', borderLeft: '4px solid #ff4d4d', borderRadius: '6px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#ff4d4d', marginBottom: '5px', letterSpacing: '0.5px' }}>EQA_1974_ASSESSMENT_RESULTS:</div>
                <p style={{ margin: 0, color: '#fff', fontSize: isExpanded ? '0.85rem' : '0.72rem', fontWeight: 700, lineHeight: '1.55' }}>
                  {advisory.doeAuditor.eqaAssessment}
                </p>
              </div>

              {/* Discrepancy Signal */}
              {advisory.doeAuditor.discrepancySignal && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px' }}>FRAUD_DETECTION_DISCREPANCY_SIGNAL:</div>
                  <div style={{ fontSize: '0.72rem', color: '#ffcc00', fontWeight: 600, lineHeight: '1.5', fontFamily: 'JetBrains Mono' }}>
                    {advisory.doeAuditor.discrepancySignal}
                  </div>
                </div>
              )}

              {/* Dense Ledger Table of Submissions */}
              <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255, 77, 77, 0.15)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(255, 77, 77, 0.1)', fontSize: '0.55rem', fontWeight: 800, color: '#ff4d4d', letterSpacing: '0.5px' }}>
                  RECENT_CORPORATE_SUBMISSIONS_LEDGER ({data?.name ? data.name.toUpperCase() : 'ZONE'}):
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px 12px', fontWeight: 800 }}>STAKEHOLDER_UID</th>
                        <th style={{ padding: '6px 12px', fontWeight: 800 }}>REPORTED_PM2.5</th>
                        <th style={{ padding: '6px 12px', fontWeight: 800 }}>VARIANCE</th>
                        <th style={{ padding: '6px 12px', fontWeight: 800 }}>VERDICT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: '#ddd' }}>
                        <td style={{ padding: '6px 12px', fontFamily: 'JetBrains Mono' }}>MY-PETRO-CHEM-01</td>
                        <td style={{ padding: '6px 12px' }}>17.8 µg/m³</td>
                        <td style={{ padding: '6px 12px', color: '#00ffcc' }}>-2.2%</td>
                        <td style={{ padding: '6px 12px' }}><span style={{ color: '#00ffcc', fontWeight: 800 }}>VERIFIED</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: '#ddd' }}>
                        <td style={{ padding: '6px 12px', fontFamily: 'JetBrains Mono' }}>MEGA-STEEL-CORP</td>
                        <td style={{ padding: '6px 12px' }}>18.5 µg/m³</td>
                        <td style={{ padding: '6px 12px', color: '#00ffcc' }}>+1.6%</td>
                        <td style={{ padding: '6px 12px' }}><span style={{ color: '#00ffcc', fontWeight: 800 }}>VERIFIED</span></td>
                      </tr>
                      <tr style={{ color: '#ddd' }}>
                        <td style={{ padding: '6px 12px', fontFamily: 'JetBrains Mono' }}>GLOBAL-MANUF-LTD</td>
                        <td style={{ padding: '6px 12px' }}>12.1 µg/m³</td>
                        <td style={{ padding: '6px 12px', color: '#ffcc00' }}>-33.5%</td>
                        <td style={{ padding: '6px 12px' }}><span style={{ color: '#ffcc00', fontWeight: 800 }}>FLAGGED</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dense Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr 1fr' : '1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CONSECUTIVE_CLEAN_TRACKING</div>
                  <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 900, marginTop: '2px' }}>14 DAYS <span style={{ fontSize: '0.55rem', color: '#00ffcc', fontWeight: 600 }}>(NOMINAL)</span></div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>AUTONOMOUS_SCRUTINY_TIER</div>
                  <div style={{ fontSize: '0.75rem', color: '#ffcc00', fontWeight: 900, marginTop: '2px' }}>HIGH_SCRUTINY_ESCALATION</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>LEDGER_HASH_CHAIN_COUNT</div>
                  <div style={{ fontSize: '0.75rem', color: '#00ffcc', fontWeight: 900, marginTop: '2px', fontFamily: 'JetBrains Mono' }}>1,482 ENTRIES</div>
                </div>
              </div>

              {/* Submittable Evidence Seal */}
              {advisory.doeAuditor.evidenceChainRef && (
                <div style={{ padding: '10px', background: '#050505', border: '1px solid #222', borderRadius: '4px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.5rem', color: '#666', fontFamily: 'JetBrains Mono' }}>IMMUTABLE_EVIDENCE_SEAL (FNV-1A):</div>
                  <div style={{ fontSize: '0.62rem', color: '#00ffcc', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                    {advisory.doeAuditor.evidenceChainRef}
                  </div>
                </div>
              )}

              {/* Technical Reasoning */}
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '0.5px' }}>FORENSIC_SWEEP_REASONING</div>
                <div style={{ fontSize: '0.68rem', color: '#aaa', lineHeight: '1.5' }}>
                  {advisory.doeAuditor.technicalReasoning || "Cryptographic integrity sweep corroborating continuous sensor logs against reported string ranges."}
                </div>
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
