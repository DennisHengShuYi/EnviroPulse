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
    <div style={{ padding: '2rem', background: '#050505', color: '#fff', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Layers className="cyan" size={20} />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-cyan)', letterSpacing: '2px' }}>SUPPLY_CHAIN_TERMINAL_v1.0</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-1px' }}>
            Supplier Compliance <span className="gold">Framework</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '5px' }}>
            Multi-tier sustainability tracking for automotive ecosystem (Proton/Perodua)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>TOTAL_SUPPLIERS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>154</div>
          </div>
          <div style={{ background: 'rgba(0,255,130,0.05)', border: '1px solid rgba(0,255,130,0.2)', padding: '10px 20px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.55rem', color: '#00ff82', marginBottom: '2px' }}>CSI_COMPLIANCE_RATE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00ff82' }}>92.4%</div>
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        {supplyChainData.map((d) => (
          <div 
            key={d.tier}
            onClick={() => setSelectedTier(d.tier)}
            style={{ 
              padding: '20px', 
              background: selectedTier === d.tier ? 'rgba(255,184,0,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedTier === d.tier ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}`,
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
                background: selectedTier === d.tier ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.8rem'
              }}>
                T{d.tier}
              </div>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900 }}>{d.title}</h3>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>{d.subtitle}</p>
            {selectedTier === d.tier && <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}><TrendingUp size={80} /></div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Suppliers List */}
        <div className="widget" style={{ padding: '0', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>MANAGED SUPPLIER DIRECTORY</h3>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search Suppliers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '6px 10px 6px 30px', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  color: '#fff',
                  width: '200px'
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
                <tr style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '15px 20px' }}>SUPPLIER_NAME</th>
                  <th style={{ padding: '15px 20px' }}>CORE_CATEGORY</th>
                  <th style={{ padding: '15px 20px' }}>REPORTING_STATUS</th>
                  <th style={{ padding: '15px 20px' }}>DATA_FIDELITY</th>
                </tr>
              </thead>
              <tbody>
                {currentData.suppliers
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '15px 20px', fontWeight: 700 }}>{s.name}</td>
                    <td style={{ padding: '15px 20px', color: 'var(--text-secondary)' }}>{s.category}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {s.status === 'Verified' ? <CheckCircle2 size={12} style={{ color: '#00ff82' }} /> : <AlertCircle size={12} style={{ color: 'var(--accent-gold)' }} />}
                        <span style={{ color: s.status === 'Verified' ? '#00ff82' : 'var(--accent-gold)', fontWeight: 800, fontSize: '0.65rem' }}>{s.status.toUpperCase()}</span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px', fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>{s.data.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="widget" style={{ padding: '25px', background: 'rgba(0,240,255,0.02)', border: '1px solid rgba(0,240,255,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>ENVIROPULSE_IMPACT</h3>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.6', color: '#ccc', marginBottom: '20px' }}>
              {currentData.impact}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentData.systemHelp.map((help, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
                  <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{help}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget" style={{ padding: '25px', background: 'rgba(255,0,0,0.02)', border: '1px solid rgba(255,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <AlertCircle size={16} style={{ color: '#ff4444' }} />
              <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#ff4444' }}>NON-COMPLIANCE RISK</h3>
            </div>
            <p style={{ fontSize: '0.7rem', lineHeight: '1.6', color: '#aaa', margin: 0 }}>
              If MSMEs fail to adopt CSI-aligned systems, Proton & Perodua cannot complete Scope 3 disclosures, leading to <strong>financing risks</strong> and <strong>contract terminations</strong>.
            </p>
          </div>

          <div className="widget" style={{ padding: '20px', background: '#0a0a0a', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Lock size={20} style={{ color: 'var(--text-secondary)', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 800 }}>AUDITOR_ACCESS_LOCKED</h4>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: 0 }}>External verification requires government-grade digital seal.</p>
          </div>
        </div>
      </div>

      {/* Global Supply Chain Visualization Placeholder */}
      <div className="widget" style={{ marginTop: '30px', padding: '30px', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Globe size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '15px' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '4px' }}>MAPPING_GLOBAL_RAW_MATERIAL_INTENSITY...</span>
        <div style={{ width: '60%', height: '2px', background: 'rgba(255,255,255,0.05)', marginTop: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainPage;
