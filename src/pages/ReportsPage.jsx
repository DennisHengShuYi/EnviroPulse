import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, PieChart, ShieldCheck, ArrowRight, Printer, 
  Calendar, MapPin, Layout, Share2, AlertTriangle, TrendingUp, 
  Activity, Zap, Heart, Globe, Table as TableIcon, BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';

const ReportsPage = ({ districts, data }) => {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [period, setPeriod] = useState('Last 7 Days');
  const [selectedDistrict, setSelectedDistrict] = useState('klcc');
  const [stats, setStats] = useState(null);
  const [esgAdvisory, setEsgAdvisory] = useState(null);

  // Fetch real stats when district changes
  useEffect(() => {
    setReportReady(false);
    setEsgAdvisory(null);
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/analytics/esg-stats?id=${selectedDistrict}`);
        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    };
    fetchStats();
  }, [selectedDistrict]);

  const handleGenerate = async () => {
    setGenerating(true);
    setReportReady(false);
    
    try {
      // 1. Ensure we have latest stats
      const statsRes = await fetch(`/api/analytics/esg-stats?id=${selectedDistrict}`);
      const currentStats = await statsRes.json();
      setStats(currentStats);

      // 2. Get specific sensor data for this district
      const sensorRes = await fetch(`/api/sensors?id=${selectedDistrict}`);
      const sensorData = await sensorRes.json();

      // 3. Get AI Narrative
      const response = await fetch('/api/analytics/esg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sensorData: sensorData || { name: currentStats.districtName, id: selectedDistrict },
          stats: currentStats
        })
      });
      const result = await response.json();
      setEsgAdvisory(result);
      setReportReady(true);
    } catch (err) {
      console.error('ESG fetch error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;
    const headers = ['Metric', 'Current Value', 'Compliance % (30 Day)'];
    const rows = [
      ['PM2.5', stats.currentPm25, stats.pm25Compliance + '%'],
      ['AQI (DOE)', stats.currentAqi, stats.doeCompliance + '%'],
      ['Heat Index (Safe)', stats.currentHeatIndex, stats.heatSafeDays + '%']
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EnviroPulse_ESG_${selectedDistrict}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    const reportEl = document.querySelector('.printable-area');
    if (!reportEl) { window.print(); return; }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>UMDT Environmental Report — ${selectedDistrict} / ${period}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800;900&display=swap');
            @page { size: A4 portrait; margin: 1.2cm; }
            * { box-sizing: border-box; }
            body {
              margin: 0; padding: 0;
              font-family: 'JetBrains Mono', monospace;
              background: #fff; color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Hide the config panel (left column), show only report content */
            .no-print { display: none !important; }
            /* Make the 2-col grid single column */
            .report-main-grid {
              display: block !important;
              width: 100% !important;
            }
            .widget {
              background: #fff !important;
              color: #000 !important;
              border: 1px solid #ccc !important;
              border-radius: 4px;
              padding: 16px !important;
              margin-bottom: 18px !important;
              width: 100% !important;
              display: block !important;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            table { width: 100% !important; border-collapse: collapse; }
            th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.75rem; }
            th { font-weight: 900; color: #333; }
            h1,h2 { color: #000; }
            .cyan, [class~="cyan"] { color: #0077aa !important; font-weight: bold; }
            .gold, [class~="gold"] { color: #996600 !important; font-weight: bold; }
            .red,  [class~="red"]  { color: #cc0000 !important; font-weight: bold; }
            /* Grid sections → stack vertically */
            div[style*="grid-template-columns"] {
              display: block !important;
            }
            /* Recharts SVG — keep visible but sized */
            svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${reportEl.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: '2rem', background: '#000', color: '#fff', minHeight: '100vh', overflowY: 'auto' }} className="printable-area">
      
      {/* SECTION 1: HEADER + CONTROLS */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="no-print">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
            <FileText size={18} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>ENVIRONMENTAL_PERFORMANCE_REPORT</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{selectedDistrict.toUpperCase()} | {period.toUpperCase()}</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrintPDF}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 15px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={14} /> PDF
          </button>
          <button 
            onClick={handleExportCSV}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 15px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <TableIcon size={14} /> CSV
          </button>
        </div>
      </div>

      <div className="report-main-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px', marginBottom: '40px' }}>
        {/* CONFIG PANEL */}
        <div className="widget no-print" style={{ padding: '20px', height: 'fit-content' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '10px' }}>REPORT_CONFIGURATION</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>REPORT_PERIOD</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', fontSize: '0.7rem' }}>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>GEOSPATIAL_SCOPE</label>
              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', fontSize: '0.7rem' }}>
                {districts?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={generating}
              style={{ width: '100%', background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '12px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {generating ? 'SYNTHESIZING...' : 'GENERATE_AI_REPORT'}
              {generating && <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }}></div>}
            </button>
          </div>
        </div>

        {/* REPORT CONTENT AREA */}
        <div style={{ position: 'relative' }}>
          {!reportReady && !generating && (
            <div className="widget" style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', opacity: 0.3 }}>
              <Layout size={60} />
              <span style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>CONFIGURE_ABOVE_TO_LOAD_DATA</span>
            </div>
          )}

          {generating && (
            <div className="widget" style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '25px' }}>
              <div className="marker-pulse" style={{ width: 80, height: 80, background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div className="cyan" style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '4px', marginBottom: '10px' }}>ANALYZING_SENSORS...</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>CROSS_REFERENCING_WHO_STANDARDS_&_WIND_VECTORS</div>
              </div>
            </div>
          )}

          {reportReady && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* SECTION 2: EXECUTIVE SUMMARY CARD */}
              <div className="widget" style={{ padding: '30px', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>EXECUTIVE_SUMMARY</h2>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{selectedDistrict} · 1 May – 7 May 2026</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>OVERALL_GRADE</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-gold)', lineHeight: 1 }}>
                      {stats ? (stats.pm25Compliance > 80 ? 'A' : stats.pm25Compliance > 60 ? 'B+' : 'C') : '...'}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{stats ? stats.pm25Compliance : '0'}/100</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-gold)' }}>●</div> WHO PM2.5 Compliance: {stats?.pm25Compliance}%</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-red)' }}>●</div> Current PM2.5 Load: {stats?.currentPm25} µg/m³</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-gold)' }}>●</div> Heat Safe Operation Days: {stats?.heatSafeDays}%</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-cyan)' }}>●</div> DOE API Compliance: {stats?.doeCompliance}%</li>
                  </ul>
                  <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '20px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={12} /> AI_INSIGHT_SYNTHESIS
                    </div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.6', margin: 0 }}>
                      {esgAdvisory?.narrative || "Synthesizing regional environmental drivers..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: KEY METRICS SUMMARY ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CURRENT_AQI</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.currentAqi}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>{stats?.currentAqi < 50 ? 'GOOD' : 'MODERATE'}</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>HEAT_SAFE_INDEX</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.heatSafeDays}%</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>{stats?.heatSafeDays > 70 ? 'STABLE' : 'STRESS'}</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>PM2.5_AVG</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.currentPm25}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-red)' }}>{stats?.pm25Compliance}% COMPLIANT</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SAMPLE_SIZE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{stats?.totalDaysAnalyzed} DAYS</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>HISTORICAL_LOOKBACK</div>
                </div>
              </div>

              {/* SECTION 4: WHO COMPLIANCE TABLE */}
              <div className="widget" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ShieldCheck size={18} className="cyan" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>POLLUTANT_COMPLIANCE_WHO_AIR_QUALITY_GUIDELINES_2021</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '20px' }}>
                  <div className="widget" style={{ padding: '20px', background: 'rgba(0,240,255,0.05)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>WHO PM2.5 COMPLIANCE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{stats?.pm25Compliance}%</div>
                  </div>
                  <div className="widget" style={{ padding: '20px', background: 'rgba(255,184,0,0.05)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>MALAYSIA DOE COMPLIANCE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-gold)' }}>{stats?.doeCompliance}%</div>
                  </div>
                  <div className="widget" style={{ padding: '20px', background: 'rgba(0,255,130,0.05)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>HEAT SAFETY UPTIME</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00ff82' }}>{stats?.heatSafeDays}%</div>
                  </div>
                </div>
              </div>



              {/* SECTION 6: TREND CHARTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="widget" style={{ padding: '20px', height: '350px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px' }}>COMPLIANCE_RADAR_DISTRIBUTION</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'WHO PM2.5', A: stats?.pm25Compliance || 0, fullMark: 100 },
                      { subject: 'DOE API', A: stats?.doeCompliance || 0, fullMark: 100 },
                      { subject: 'Heat Safe', A: stats?.heatSafeDays || 0, fullMark: 100 },
                      { subject: 'Reporting', A: 99, fullMark: 100 },
                      { subject: 'Sensor Uptime', A: 100, fullMark: 100 }
                    ]}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Compliance" dataKey="A" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="widget" style={{ padding: '20px', height: '350px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px' }}>ESG_KPI_TRAJECTORY</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={[
                      { day: 'W1', value: 45 },
                      { day: 'W2', value: 52 },
                      { day: 'W3', value: 68 },
                      { day: 'W4', value: stats?.pm25Compliance || 72 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)' }} />
                      <Area type="monotone" dataKey="value" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 5: THRESHOLD BREACH LOG */}
              <div className="widget" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <AlertTriangle size={18} className="cyan" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>METRO_LIVE_COMPLIANCE_STATUS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>LIVE_SENSOR_ID: {stats?.districtName?.toUpperCase()}</div>
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, background: 'var(--accent-cyan)', color: '#000', padding: '2px 6px', borderRadius: '2px' }}>ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* SECTION 7 & 8: ANOMALIES & HEALTH IMPACT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
                <div className="widget" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Activity size={18} className="gold" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>AI_DETECTED_ANOMALIES</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {(esgAdvisory?.anomalies || []).map((anom, i) => (
                      <div key={i} style={{ padding: '15px', background: `rgba(${anom.severity === 'GOLD' ? '255,184,0' : '0,240,255'}, 0.05)`, borderLeft: `3px solid ${anom.severity === 'GOLD' ? 'var(--accent-gold)' : 'var(--accent-cyan)'}` }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '5px' }}>{anom.title.toUpperCase()}</div>
                        <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.5 }}>{anom.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="widget" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Heart size={18} className="red" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>HEALTH_IMPACT_ASSESSMENT</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(255,62,62,0.03)', borderRadius: '4px', fontSize: '0.75rem', lineHeight: '1.6' }}>
                      {esgAdvisory?.healthImpact}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>VULNERABLE_GROUP_RISK_INDEX</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['Elderly', 'Children', 'Outdoor Workers', 'Pregnant Women'].map(tag => (
                          <span key={tag} style={{ fontSize: '0.55rem', background: 'rgba(255,62,62,0.1)', color: 'var(--accent-red)', padding: '3px 8px', borderRadius: '2px', fontWeight: 800 }}>{tag.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 9 & 10: ESG & RECOMMENDATIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '25px' }}>
                <div className="widget" style={{ padding: '20px', background: 'rgba(0, 240, 255, 0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Globe size={18} className="cyan" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>ESG_ENVIRONMENTAL_STATEMENT</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '5px', color: 'var(--accent-cyan)' }}>SCORE: {esgAdvisory?.performanceScore || 'N/A'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>ALIGNED_TO_GRI_305_ISO_14001</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>PM2.5 Compliance:</span>
                      <span style={{ color: 'var(--accent-red)' }}>{esgAdvisory?.complianceStatement.pm25}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>DOE API Status:</span>
                      <span style={{ color: 'var(--accent-gold)' }}>{esgAdvisory?.complianceStatement.api}</span>
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '0.7rem', lineHeight: '1.5' }}>
                    {esgAdvisory?.narrative}
                  </div>
                </div>

                <div className="widget" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ArrowRight size={18} className="cyan" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>AI_RECOMMENDED_INTERVENTIONS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {esgAdvisory?.interventions.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ background: item.potential === 'High' ? 'var(--accent-red)' : 'var(--accent-gold)', color: '#000', padding: '5px 10px', fontSize: '0.5rem', fontWeight: 900, height: 'fit-content' }}>{item.potential.toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{item.action}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Stakeholder: {item.stakeholder}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
