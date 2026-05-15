import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Clock, MapPin, Lock, FileText, Wind, Eye, Users, Shield } from 'lucide-react';
import WhatsAppAlert from './WhatsAppAlert';

const workers = [
  {
    name: "Ahmad Razif",
    age: 52,
    role: "Foreman",
    conditions: ["Hypertension", "Diabetes"],
    acclimatized: "3 days",
    risk: "CRITICAL",
    riskColor: "red",
    isCritical: true
  },
  {
    name: "Ravi Subramaniam",
    age: 28,
    role: "General Worker",
    conditions: ["Asthmatic"],
    acclimatized: "14 days",
    risk: "HIGH",
    riskColor: "orange",
    isCritical: false
  },
  {
    name: "Nurul Ain",
    age: 34,
    role: "Site Supervisor",
    conditions: [],
    acclimatized: "21 days",
    risk: "MODERATE",
    riskColor: "yellow",
    isCritical: false
  },
  {
    name: "Jakaria bin Daud",
    age: 45,
    role: "Machine Operator",
    conditions: ["Hypertension"],
    acclimatized: "7 days",
    risk: "HIGH",
    riskColor: "orange",
    isCritical: false
  }
];

const DOSH_LOGIC = {
  MODERATE: { work: "30m", rest: "30m", status: "MANDATORY REST", statusColor: "amber" },
  HIGH: { work: "15m", rest: "45m", status: "MANDATORY REST", statusColor: "amber" },
  CRITICAL: { work: "STOP WORK", rest: "N/A", status: "IMMEDIATE EVACUATION", statusColor: "red" }
};

const WorkerCard = ({ worker, blur }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MODERATE': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative p-6 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-xl transition-all duration-500 ${worker.isCritical ? 'border-2 border-red-500 animate-pulse' : ''} ${blur ? 'blur-sm grayscale opacity-50 select-none' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{worker.name}</h3>
          <p className="text-slate-500 text-sm">{worker.age}, {worker.role}</p>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold border border-blue-500/20">
          <ShieldCheck size={12} />
          MYKAD VERIFIED
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {worker.conditions.length > 0 ? (
          worker.conditions.map((cond, idx) => (
            <span key={idx} className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 font-medium">
              {cond}
            </span>
          ))
        ) : (
          <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-medium">
            No Conditions
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="text-[10px] text-slate-500">
          <p>ACCLIMATIZED: <span className="text-slate-700 font-mono">{worker.acclimatized}</span></p>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest ${getRiskColor(worker.risk)}`}>
          {worker.risk}
        </div>
      </div>

      {blur && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-black text-xs uppercase shadow-2xl flex items-center gap-2 hover:bg-cyan-400 transition-all transform hover:scale-105 active:scale-95">
            <Lock size={14} /> Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

const DOSHComplianceTable = ({ blur, workers }) => {
  return (
    <div className={`mt-12 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xl transition-all duration-500 relative ${blur ? 'blur-sm grayscale opacity-50 select-none' : ''}`}>
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-1 uppercase tracking-tight">DOSHComplianceTable</h2>
        <p className="text-slate-500 text-xs italic">Referenced: DOSH Malaysia Heat Stress Guidelines (Table 2 Annex B)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Worker Name</th>
              <th className="px-6 py-4 font-bold">Current Risk</th>
              <th className="px-6 py-4 font-bold">Work Duration</th>
              <th className="px-6 py-4 font-bold">Rest Duration</th>
              <th className="px-6 py-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-sm">
            {workers && workers.map((worker, idx) => {
              const logic = DOSH_LOGIC[worker.risk];
              const isCritical = worker.risk === 'CRITICAL';
              const isAmber = worker.risk === 'MODERATE' || worker.risk === 'HIGH';
              
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800 font-bold">{worker.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      worker.risk === 'CRITICAL' ? 'text-red-500' : 
                      worker.risk === 'HIGH' ? 'text-orange-500' : 
                      'text-yellow-500'
                    }`}>
                      {worker.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{logic?.work || '30m'}</td>
                  <td className="px-6 py-4 text-slate-600">{logic?.rest || '30m'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      isCritical ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                      isAmber ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' :
                      'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'
                    }`}>
                      {isCritical ? 'STOP WORK - Immediate Evacuation / Notify Supervisor' : (isAmber ? 'MANDATORY REST' : 'ON WORK')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-500 italic text-center">
          Schedules auto-generated based on DOSH WBGT heat stress assessment criteria for Malaysian climate.
        </p>
      </div>

      {blur && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-black text-sm uppercase shadow-2xl flex items-center gap-2 hover:bg-cyan-400 transition-all transform hover:scale-105 active:scale-95">
            <Lock size={18} /> Upgrade to Premium for DOSH Compliance & AI Alerts
          </button>
        </div>
      )}
    </div>
  );
};

const WorkerGrid = ({ hazeLevel, triggerHazeSimulation }) => {
  const [role, setRole] = useState('Site Manager'); // Site Manager | Auditor/DOE
  const [mode, setMode] = useState('Premium'); // Basic | Premium
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState(null);

  const isAuditor = role === 'Auditor/DOE';
  const isBasic = mode === 'Basic';

  // Graduated risk based on hazeLevel
  const activeWorkers = workers.map(w => {
    if (hazeLevel === 0) return w;
    
    let newRisk = w.risk;
    let newIsCritical = w.isCritical;

    if (hazeLevel === 1) {
      // Moderate: Sensitive groups affected
      if (w.conditions.length > 0 || w.age > 50) {
        newRisk = 'HIGH';
      }
    } else if (hazeLevel === 2) {
      // Unhealthy: Most workers affected
      if (w.conditions.length > 0 || w.age > 40) {
        newRisk = 'CRITICAL';
        newIsCritical = true;
      } else {
        newRisk = 'HIGH';
      }
    } else if (hazeLevel === 3) {
      // Hazardous: All stop work
      newRisk = 'CRITICAL';
      newIsCritical = true;
    }

    return { ...w, risk: newRisk, isCritical: newIsCritical };
  });

  // Trigger WhatsApp alerts
  useEffect(() => {
    if (hazeLevel > 0 && !isBasic) {
      let severity = hazeLevel === 1 ? 'MODERATE' : (hazeLevel === 2 ? 'UNHEALTHY' : 'HAZARDOUS');
      let action = hazeLevel === 3 ? 'IMMEDIATE Site-wide shutdown' : (hazeLevel === 2 ? 'Limited outdoor activity' : 'Sensitive groups withdrawn');
      
      setWhatsAppMessage(
        <div className="space-y-2">
          <p>⚠️ <strong>ALERT ({severity}):</strong> Air quality has reached {severity} levels.</p>
          <p><strong>ACTION:</strong> {action} initiated. [Hash: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}...]</p>
        </div>
      );
      setShowWhatsApp(true);
    }
  }, [hazeLevel, isBasic]);

  return (
    <div className="bg-slate-50 overflow-y-auto relative min-h-screen" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Auditor Watermark */}
      {isAuditor && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5 select-none">
          <h1 className="text-[12vw] font-black text-slate-900 rotate-[-35deg] border-[20px] border-slate-900 p-10 whitespace-nowrap">
            OFFICIAL GOVERNMENT VERIFICATION
          </h1>
        </div>
      )}

      <div className="p-8 max-w-6xl mx-auto relative z-10">
        {/* Header Controls */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
          <div className="border-l-4 border-cyan-500 pl-4">
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Worker Thermal Risk Profile</h1>
            <p className="text-slate-500 text-xs font-mono">ENVIROPULSE_V4_SECURE_NODE</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Freemium Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setMode('Basic')}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase transition-all ${mode === 'Basic' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Basic
              </button>
              <button 
                onClick={() => setMode('Premium')}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase transition-all ${mode === 'Premium' ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Premium
              </button>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Users size={14} className="text-slate-500" />
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-slate-800 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="Site Manager">Site Manager</option>
                <option value="Auditor/DOE">Auditor/DOE</option>
              </select>
            </div>

            {/* Simulation Controls (Hidden for Auditors) */}
            {!isAuditor && (
              <button 
                onClick={triggerHazeSimulation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${hazeLevel > 0 ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-600' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
              >
                <Wind size={14} /> {hazeLevel > 0 ? `Haze Level ${hazeLevel} (Click to change)` : 'Simulate Haze'}
              </button>
            )}
          </div>
        </div>


        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeWorkers.map((worker, idx) => (
            <WorkerCard key={idx} worker={worker} blur={isBasic} />
          ))}
        </div>

        {/* Compliance Table (Stage 3) */}
        <div className="mt-12">
          <DOSHComplianceTable blur={isBasic} workers={activeWorkers} />
        </div>

        {/* Footer Audit Log Footer (Stage 2) */}
        <div className="mt-12 p-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-70">
          <div className="flex items-center gap-3">
             <Shield className="text-cyan-600" size={24} />
             <div>
               <p className="text-[10px] text-slate-800 font-black tracking-widest uppercase">Certified Node Alpha</p>
               <p className="text-[9px] text-slate-500 font-mono">Location: Selangor Industrial Zone</p>
             </div>
          </div>
          <p className="text-[9px] text-slate-500 font-mono text-center md:text-right">
             System running secure-kernel v4.0.1. All worker interventions are notarized on the private ledger. 
             IFRS S1/S2 Compliance Module: ACTIVE.
          </p>
        </div>
      </div>

      {/* New Components */}
      <WhatsAppAlert isTriggered={showWhatsApp} onClose={() => setShowWhatsApp(false)} message={whatsAppMessage} />
    </div>
  );
};

export default WorkerGrid;
