import React from 'react';
import { X, FileText, Shield, TrendingUp, BarChart3, Download, Printer } from 'lucide-react';

const BursaReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-[85vh] overflow-hidden rounded-lg shadow-2xl flex flex-col text-slate-900 border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-accent-cyan p-2 rounded">
              <FileText size={20} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">BURSA MALAYSIA CSI DISCLOSURE</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Document Ref: IFRS-S1/S2-2026-MY</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Scrollable Report */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50 font-serif">
          <div className="max-w-3xl mx-auto space-y-12 bg-white p-12 shadow-sm border border-slate-100">
            {/* Header / Logo Section */}
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900">ENVIROPULSE</h1>
                <p className="text-sm font-sans text-slate-500 uppercase tracking-tighter">Sustainability Intelligence Unit</p>
              </div>
              <div className="text-right text-xs font-sans text-slate-400 uppercase">
                <p>Date: May 14, 2026</p>
                <p>Confidential: Auditor Copy</p>
              </div>
            </div>

            {/* 1. Governance */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
                <Shield size={18} className="text-slate-700" />
                <h3 className="text-lg font-bold uppercase tracking-tight font-sans">1. Governance</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Oversight of climate-related risks (Heat/Haze) is managed directly by the Sustainability Committee. 
                Real-time monitoring via EnviroPulse sensor networks provides board-level visibility into site-level environmental exposures, 
                ensuring compliance with OSH Act 2024 and DOE EQA 1974 regulations.
              </p>
            </section>

            {/* 2. Strategy */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
                <TrendingUp size={18} className="text-slate-700" />
                <h3 className="text-lg font-bold uppercase tracking-tight font-sans">2. Strategy</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Our Malaysian site mitigation plans prioritize workforce resilience through automated thermal risk protocols. 
                This includes phased operational shutdowns during peak Heat Index intervals and adaptive scheduling based on 
                localized WBGT sensor data to minimize long-term climate-driven productivity losses.
              </p>
            </section>

            {/* 3. Risk Management */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
                <Shield size={18} className="text-slate-700" />
                <h3 className="text-lg font-bold uppercase tracking-tight font-sans">3. Risk Management</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Real-time sensor-based worker monitoring is the cornerstone of our risk identification process. 
                Individual health profiles are cross-referenced with ambient environmental sensors to trigger 
                immediate interventions (e.g., Mandatory Rest Cycles) when critical thresholds are breached.
              </p>
            </section>

            {/* 4. Metrics & Targets */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2">
                <BarChart3 size={18} className="text-slate-700" />
                <h3 className="text-lg font-bold uppercase tracking-tight font-sans">4. Metrics & Targets</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Scope 1 Emissions</span>
                  <p className="text-2xl font-sans font-black text-slate-900">120 <small className="text-sm font-normal">tCO2e</small></p>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Avg Heat Index</span>
                  <p className="text-2xl font-sans font-black text-slate-900">34.2 <small className="text-sm font-normal">°C</small></p>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Worker Incident Count</span>
                  <p className="text-2xl font-sans font-black text-slate-900">0</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-sans uppercase font-bold text-center">Compliance Status</span>
                  <p className="text-lg font-sans font-black text-emerald-600 uppercase text-center mt-1">VERIFIED_IFRS</p>
                </div>
              </div>
            </section>

            {/* Signature Area */}
            <div className="mt-12 pt-12 border-t border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-sans font-bold text-slate-400">Digital Identity Seal:</p>
                <p className="text-[9px] font-mono text-slate-400 uppercase">SHA-256: 8a9f4773-903e-4cbb-8a7c-617cc7101592</p>
              </div>
              <div className="w-32 h-12 bg-slate-100 border-2 border-dashed border-slate-300 rounded flex items-center justify-center italic text-slate-400 text-xs">
                Official Digital Seal
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-xs font-bold hover:bg-white transition-colors">
            <Printer size={14} /> Print Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-colors">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BursaReportModal;
