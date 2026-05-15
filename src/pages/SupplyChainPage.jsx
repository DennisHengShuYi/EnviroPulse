import React, { useState } from 'react';
import {
  Truck,
  Factory,
  Layers,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Database,
  Search,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

const SupplyChainPage = () => {
  const [selectedTier, setSelectedTier] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const supplyChainData = [
    {
      tier: 1,
      title: "Tier 1 Direct Suppliers",
      subtitle: "Large SMEs & Local Corporates",
      impact: "Ensures Proton & Perodua can report Scope 1 & 2 emissions credibly.",
      suppliers: [
        { name: "APM Automotive Holdings", category: "Seats, Interior, Suspension", status: "Verified", data: "Real-time Telemetry" },
        { name: "Sapura Industrial Berhad", category: "Engine Parts, Suspension", status: "Verified", data: "IoT Enabled" },
        { name: "PHN Industry", category: "Metal Stamping, Body Panels", status: "Warning", data: "High Carbon Intensity" },
        { name: "Delloyd Industries", category: "Electrical Systems, Plastics", status: "Verified", data: "Audit-Ready" },
        { name: "Clarion Malaysia", category: "Electronics & Infotainment", status: "Verified", data: "Energy Optimized" },
        { name: "Continental Automotive", category: "Vehicle Electronics", status: "Verified", data: "Real-time Tracking" }
      ],
      systemHelp: [
        "Tracks energy use, emissions, and waste at factories.",
        "Verifies data against utility bills and IoT sensors.",
        "Provides predictive analytics for emissions reduction pathways."
      ]
    },
    {
      tier: 2,
      title: "Tier 2 Indirect Suppliers",
      subtitle: "MSMEs & Raw Materials",
      impact: "Prevents supply chain bottlenecks due to missing supplier data.",
      suppliers: [
        { name: "Malaysia Steel Works", category: "Raw Steel Mills", status: "Verified", data: "Scope 3 Logged" },
        { name: "Ann Joo Steel", category: "Steel Manufacturing", status: "Verified", data: "Carbon Tracked" },
        { name: "Jati Beringin", category: "Wiring Harnesses", status: "Pending", data: "Manual Entry" },
        { name: "Local Rubber SMEs", category: "Hoses, Seals, Trim", status: "Verified", data: "Baseline Established" },
        { name: "Precision Machining Workshop", category: "Tooling & Dies", status: "Verified", data: "IoT Lite" }
      ],
      systemHelp: [
        "Provides low-cost, SME-friendly modules to record usage.",
        "Aggregates data into Scope 3 emissions reports.",
        "Flags inconsistencies in unrealistic emission factors."
      ]
    },
    {
      tier: 3,
      title: "Service & Support MSMEs",
      subtitle: "Logistics & Testing",
      impact: "Ensures transport and service emissions are captured for Scope 3.",
      suppliers: [
        { name: "Konsortium Logistik Berhad", category: "Large Scale Logistics", status: "Verified", data: "Fuel Telemetry" },
        { name: "SME Trucking Partners", category: "Localized Transport", status: "Verified", data: "App-Based Tracking" },
        { name: "ISO Testing Labs", category: "Safety & Emissions Testing", status: "Verified", data: "Audit Trail Verified" },
        { name: "IT System Integrators", category: "ERP & IoT Monitoring", status: "Verified", data: "System Integrated" }
      ],
      systemHelp: [
        "Monitors fuel consumption and logistics emissions.",
        "Integrates lab testing data into CSI reports.",
        "Provides dashboards for real-time monitoring."
      ]
    }
  ];

  const currentData = supplyChainData.find(d => d.tier === selectedTier);

  return (
    <div className="page-scroll-container" style={{ padding: '2rem', background: '#ffffff', color: '#1e293b' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Layers className="cyan" size={20} color="#0891b2" />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0891b2', letterSpacing: '2px' }}>SUPPLY_CHAIN_TERMINAL_v1.0</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-1px', color: '#0f172a' }}>
            Supplier Compliance <span style={{ color: '#b45309' }}>Framework</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '5px' }}>
            Multi-tier sustainability tracking for automotive ecosystem (Proton/Perodua)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.55rem', color: '#475569', marginBottom: '2px' }}>TOTAL_SUPPLIERS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>154</div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 20px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.55rem', color: '#16a34a', marginBottom: '2px' }}>CSI_COMPLIANCE_RATE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>92.4%</div>
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="responsive-grid-3" style={{ gap: '15px', marginBottom: '30px' }}>
        {supplyChainData.map((d) => (
          <div
            key={d.tier}
            onClick={() => setSelectedTier(d.tier)}
            style={{
              padding: '20px',
              background: selectedTier === d.tier ? '#fefce8' : '#f8fafc',
              border: `1px solid ${selectedTier === d.tier ? '#b45309' : '#e2e8f0'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: selectedTier === d.tier ? '#b45309' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedTier === d.tier ? '#ffffff' : '#1e293b',
                fontWeight: 900,
                fontSize: '0.8rem'
              }}>
                T{d.tier}
              </div>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>{d.title}</h3>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0 }}>{d.subtitle}</p>
            {selectedTier === d.tier && <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}><TrendingUp size={80} color="#b45309" /></div>}
          </div>
        ))}
      </div>

      <div className="supply-main-grid" style={{ gap: '30px' }}>
        {/* Suppliers List */}
        <div className="widget" style={{ padding: '0', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>MANAGED SUPPLIER DIRECTORY</h3>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search Suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  color: '#1e293b',
                  width: '160px'
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table-mobile" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 10 }}>
                <tr style={{ fontSize: '0.65rem', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '15px 20px' }}>SUPPLIER_NAME</th>
                  <th className="mobile-hide" style={{ padding: '15px 20px' }}>CORE_CATEGORY</th>
                  <th style={{ padding: '15px 20px' }}>STATUS</th>
                  <th className="mobile-hide" style={{ padding: '15px 20px' }}>DATA_FIDELITY</th>
                </tr>
              </thead>
              <tbody>
                {currentData.suppliers
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', transition: 'background 0.2s' }} className="hover-row" onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '15px 20px', fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                      <td className="mobile-hide" style={{ padding: '15px 20px', color: '#475569' }}>{s.category}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {s.status === 'Verified' ? <CheckCircle2 size={12} style={{ color: '#16a34a' }} /> : <AlertCircle size={12} style={{ color: '#b45309' }} />}
                          <span style={{ color: s.status === 'Verified' ? '#16a34a' : '#b45309', fontWeight: 800, fontSize: '0.65rem' }}>{s.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="mobile-hide" style={{ padding: '15px 20px', fontFamily: 'monospace', fontSize: '0.65rem', color: '#0891b2' }}>{s.data.toUpperCase()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="widget" style={{ padding: '25px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#0891b2' }}>ENVIROPULSE_IMPACT</h3>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.6', color: '#1e293b', marginBottom: '20px' }}>
              {currentData.impact}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentData.systemHelp.map((help, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={14} style={{ color: '#0891b2', marginTop: '2px' }} />
                  <span style={{ fontSize: '0.7rem', color: '#334155' }}>{help}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget" style={{ padding: '25px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <AlertCircle size={16} style={{ color: '#dc2626' }} />
              <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#dc2626' }}>NON-COMPLIANCE RISK</h3>
            </div>
            <p style={{ fontSize: '0.7rem', lineHeight: '1.6', color: '#1e293b', margin: 0 }}>
              If MSMEs fail to adopt CSI-aligned systems, Proton & Perodua cannot complete Scope 3 disclosures, leading to <strong style={{ color: '#b91c1c' }}>financing risks</strong> and <strong style={{ color: '#b91c1c' }}>contract terminations</strong>.
            </p>
          </div>

          <div className="widget" style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
            <Lock size={20} style={{ color: '#64748b', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>AUDITOR_ACCESS_LOCKED</h4>
            <p style={{ fontSize: '0.6rem', color: '#475569', margin: 0 }}>External verification requires government-grade digital seal.</p>
          </div>
        </div>
      </div>

      {/* Global Supply Chain Visualization Placeholder */}
      <div className="widget" style={{ marginTop: '30px', padding: '30px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <Globe size={40} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#475569', letterSpacing: '2px', wordBreak: 'break-all', textAlign: 'center', maxWidth: '100%' }}>MAPPING_GLOBAL_RAW_MATERIAL_INTENSITY...</span>
        <div style={{ width: '60%', height: '2px', background: '#e2e8f0', marginTop: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: '#0891b2', boxShadow: '0 0 10px #0891b2' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainPage;