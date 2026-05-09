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
  const [selectedDistrict, setSelectedDistrict] = useState('All KL Metro');

  // Mock data for the report
  const complianceData = [
    { pollutant: 'PM2.5', limit: '15 µg/m³', avg: '31.4', daysOver: '7/7', peak: '48.2', status: 'FAIL' },
    { pollutant: 'PM10', limit: '45 µg/m³', avg: '49.2', daysOver: '4/7', peak: '78.1', status: 'WARN' },
    { pollutant: 'NO₂', limit: '25 µg/m³', avg: '22.1', daysOver: '2/7', peak: '31.4', status: 'WARN' },
    { pollutant: 'SO₂', limit: '20 µg/m³', avg: '5.8', daysOver: '0/7', peak: '12.3', status: 'PASS' },
    { pollutant: 'CO', limit: '4 mg/m³', avg: '0.7', daysOver: '0/7', peak: '1.2', status: 'PASS' },
    { pollutant: 'O₃', limit: '60 µg/m³', avg: '54.2', daysOver: '1/7', peak: '68.4', status: 'WARN' },
  ];

  const rankingData = [
    { rank: 1, district: 'Putrajaya', aqi: 55, temp: '31.5°C', score: 91, grade: 'A' },
    { rank: 2, district: 'Cyberjaya', aqi: 58, temp: '31.8°C', score: 88, grade: 'A' },
    { rank: 3, district: 'Mont Kiara', aqi: 72, temp: '32.2°C', score: 79, grade: 'C+' },
    { rank: 4, district: 'Chow Kit', aqi: 94, temp: '34.2°C', score: 68, grade: 'D' },
    { rank: 5, district: 'Klang', aqi: 128, temp: '34.1°C', score: 38, grade: 'F' },
  ];

  const radarData = [
    { subject: 'AQI', A: 120, fullMark: 150 },
    { subject: 'PM2.5', A: 98, fullMark: 150 },
    { subject: 'PM10', A: 86, fullMark: 150 },
    { subject: 'NO2', A: 99, fullMark: 150 },
    { subject: 'SO2', A: 85, fullMark: 150 },
    { subject: 'O3', A: 65, fullMark: 150 },
  ];

  const breachLog = [
    { date: '5 May 14:32', district: 'Klang', metric: 'PM2.5', value: '68.4', limit: '15', severity: 'CRITICAL' },
    { date: '5 May 14:32', district: 'Shah Alam', metric: 'AQI', value: '142', limit: '100', severity: 'CRITICAL' },
    { date: '5 May 09:15', district: 'KLCC', metric: 'HeatIdx', value: '42.1', limit: '41', severity: 'DANGER' },
    { date: '4 May 17:45', district: 'Petaling Jaya', metric: 'PM2.5', value: '38.2', limit: '15', severity: 'WARNING' },
  ];

  const [esgAdvisory, setEsgAdvisory] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setReportReady(false);
    
    // Simulate fetching ESG data from AI
    try {
      const response = await fetch('/api/analytics/esg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sensorData: data || { name: 'Kuala Lumpur Metro', type: 'City' },
          stats: {
            pm25Compliance: 14,
            doeCompliance: 42,
            heatSafeDays: 71
          }
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
    // Basic CSV generation for compliance data
    const headers = ['Pollutant', 'WHO Limit', '7-Day Avg', 'Days Over', 'Peak', 'Status'];
    const rows = complianceData.map(d => [d.pollutant, d.limit, d.avg, d.daysOver, d.peak, d.status].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UMDT_Report_${selectedDistrict}_${period.replace(/ /g, '_')}.csv`);
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
                <option>All KL Metro</option>
                {districts?.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-gold)', lineHeight: 1 }}>C+</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>72/100</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-gold)' }}>●</div> Air quality was Moderate for 5 of 7 days</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-red)' }}>●</div> PM2.5 exceeded WHO limit on 6 of 7 days</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-gold)' }}>●</div> Heat index reached Danger level on 2 days</li>
                    <li style={{ display: 'flex', gap: '10px' }}><div style={{ color: 'var(--accent-cyan)' }}>●</div> Klang recorded highest average AQI (118)</li>
                  </ul>
                  <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '20px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={12} /> AI_INSIGHT_SYNTHESIS
                    </div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.6', margin: 0 }}>
                      "This week showed elevated pollution levels primarily driven by southwest winds carrying industrial emissions from Klang Port toward central residential districts. The heat index spikes in the afternoon correlate with low cloud cover periods..."
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: KEY METRICS SUMMARY ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>AVG_AQI</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>89</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>MODERATE</div>
                  <div style={{ fontSize: '0.55rem', marginTop: '5px', color: 'var(--accent-red)' }}>↑ +8 vs LAST_PERIOD</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>AVG_HEAT_INDEX</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>38.2°C</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>EXT_CAUTION</div>
                  <div style={{ fontSize: '0.55rem', marginTop: '5px', color: 'var(--accent-red)' }}>↑ +1.2 vs LAST_PERIOD</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>AVG_PM2.5</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>31.4</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-red)' }}>2.1x WHO LIMIT</div>
                  <div style={{ fontSize: '0.55rem', marginTop: '5px', color: 'var(--accent-red)' }}>↑ +4.2 vs LAST_PERIOD</div>
                </div>
                <div className="widget" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>WORST_DAY</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>3 MAY</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent-red)' }}>AQI 142</div>
                  <div style={{ fontSize: '0.55rem', marginTop: '5px', color: 'var(--text-secondary)' }}>KLANG_INDUSTRIAL</div>
                </div>
              </div>

              {/* SECTION 4: WHO COMPLIANCE TABLE */}
              <div className="widget" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ShieldCheck size={18} className="cyan" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>POLLUTANT_COMPLIANCE_WHO_AIR_QUALITY_GUIDELINES_2021</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px' }}>POLLUTANT</th>
                      <th style={{ padding: '10px' }}>WHO LIMIT</th>
                      <th style={{ padding: '10px' }}>7-DAY AVG</th>
                      <th style={{ padding: '10px' }}>DAYS OVER</th>
                      <th style={{ padding: '10px' }}>PEAK</th>
                      <th style={{ padding: '10px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 800 }}>{row.pollutant}</td>
                        <td style={{ padding: '12px' }}>{row.limit}</td>
                        <td style={{ padding: '12px' }}>{row.avg}</td>
                        <td style={{ padding: '12px' }}>{row.daysOver}</td>
                        <td style={{ padding: '12px' }}>{row.peak}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '3px 8px', 
                            background: row.status === 'PASS' ? 'rgba(0,255,130,0.1)' : (row.status === 'WARN' ? 'rgba(255,184,0,0.1)' : 'rgba(255,62,62,0.1)'),
                            color: row.status === 'PASS' ? '#00ff82' : (row.status === 'WARN' ? '#ffb800' : '#ff3e3e'),
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            borderRadius: '2px'
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SECTION 4: DISTRICT RANKING TABLE */}
              <div className="widget" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <TrendingUp size={18} className="cyan" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>METRO_DISTRICT_PERFORMANCE_RANKING</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px' }}>RANK</th>
                      <th style={{ padding: '10px' }}>DISTRICT</th>
                      <th style={{ padding: '10px' }}>AVG AQI</th>
                      <th style={{ padding: '10px' }}>AVG TEMP</th>
                      <th style={{ padding: '10px' }}>SCORE</th>
                      <th style={{ padding: '10px' }}>GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 800 }}>#{row.rank}</td>
                        <td style={{ padding: '12px' }}>{row.district}</td>
                        <td style={{ padding: '12px' }}>{row.aqi}</td>
                        <td style={{ padding: '12px' }}>{row.temp}</td>
                        <td style={{ padding: '12px' }}>{row.score}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            color: row.score > 80 ? '#00ff82' : (row.score > 60 ? '#ffb800' : '#ff3e3e'),
                            fontWeight: 900
                          }}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SECTION 6: TREND CHARTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="widget" style={{ padding: '20px', height: '350px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px' }}>POLLUTANT_DISTRIBUTION_RADAR</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name="Current" dataKey="A" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="widget" style={{ padding: '20px', height: '350px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '20px' }}>7-DAY_POLLUTANT_LOAD_STACKED</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={[
                      { day: 'Mon', pm25: 40, pm10: 24, no2: 12 },
                      { day: 'Tue', pm25: 30, pm10: 13, no2: 15 },
                      { day: 'Wed', pm25: 60, pm10: 38, no2: 20 },
                      { day: 'Thu', pm25: 45, pm10: 22, no2: 18 },
                      { day: 'Fri', pm25: 55, pm10: 30, no2: 22 },
                      { day: 'Sat', pm25: 20, pm10: 15, no2: 10 },
                      { day: 'Sun', pm25: 15, pm10: 10, no2: 8 },
                    ]}>
                      <XAxis dataKey="day" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--accent-cyan)' }} />
                      <Bar dataKey="pm25" stackId="a" fill="var(--accent-cyan)" />
                      <Bar dataKey="pm10" stackId="a" fill="var(--accent-gold)" />
                      <Bar dataKey="no2" stackId="a" fill="var(--accent-red)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 5: THRESHOLD BREACH LOG */}
              <div className="widget" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <AlertTriangle size={18} className="red" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>CRITICAL_THRESHOLD_BREACH_LOG</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {breachLog.map((log, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,62,62,0.05)', border: '1px solid rgba(255,62,62,0.1)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', width: '80px' }}>{log.date}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, width: '100px' }}>{log.district}</div>
                        <div style={{ fontSize: '0.7rem', width: '80px' }}>{log.metric}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-red)' }}>{log.value} / {log.limit}</div>
                      </div>
                      <span style={{ fontSize: '0.55rem', fontWeight: 900, background: 'var(--accent-red)', color: '#000', padding: '2px 6px', borderRadius: '2px' }}>{log.severity}</span>
                    </div>
                  ))}
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
                    <div style={{ padding: '15px', background: 'rgba(255,184,0,0.05)', borderLeft: '3px solid var(--accent-gold)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '5px' }}>⚠ 5 MAY 14:00-16:00</div>
                      <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.5 }}>
                        Rapid PM2.5 spike in Klang (+85% in 2 hours). Probable cause: Industrial event or vessel docking. Districts affected: Klang, PJ (downwind). Peak value: 68.4 µg/m³.
                      </p>
                    </div>
                    <div style={{ padding: '15px', background: 'rgba(0,240,255,0.05)', borderLeft: '3px solid var(--accent-cyan)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '5px' }}>ℹ 6 MAY 22:00</div>
                      <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.5 }}>
                        Unusually low AQI across all districts. Probable cause: Heavy rainfall (18mm recorded). Note: Rain naturally washes particulate matter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="widget" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Heart size={18} className="red" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>HEALTH_IMPACT_ASSESSMENT</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>UNHEALTHY_EXPOSURE_DAYS</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                        <span>Klang residents (~940k)</span>
                        <span style={{ color: 'var(--accent-red)', fontWeight: 800 }}>4 Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                        <span>Shah Alam residents (~650k)</span>
                        <span style={{ color: 'var(--accent-red)', fontWeight: 800 }}>5 Days</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>VULNERABLE_GROUP_RISK</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {['Elderly', 'Children', 'Outdoor Workers', 'Pregnant Women'].map(tag => (
                          <span key={tag} style={{ fontSize: '0.55rem', background: 'rgba(255,62,62,0.1)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: '2px' }}>{tag.toUpperCase()}</span>
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
