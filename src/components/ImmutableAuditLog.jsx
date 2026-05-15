import React from 'react';

const activities = [
  { text: 'Heat Threshold Exceeded', hash: '0x4f3a9e21b' },
  { text: 'Ahmad Razif Rest Cycle Started', hash: '0x7b2c5d1e8' },
  { text: 'Sensor Node 04 Heartbeat', hash: '0x1a8f6d3c2' },
  { text: 'Local Station Calibration Sync', hash: '0x9e4a1b7f0' },
  { text: 'WBGT Threshold Alert: Site A', hash: '0x3d2c5e1f4' }
];

const ImmutableAuditLog = ({ blur, isHazeSimulated }) => {
  const hazeEntry = isHazeSimulated ? [{ text: 'Haze Event Detected: PM2.5 > 150μg/m³. Automated Work-Rest Adjustments Deployed.', hash: '0x92c7d1f3' }] : [];
  const logEntries = [...hazeEntry, ...activities];

  return (
    <div className={`mt-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xl transition-all duration-500 ${blur ? 'blur-sm grayscale opacity-50 select-none' : ''}`}>
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Immutable Audit Log</h2>
          <p className="text-[10px] text-slate-500 font-mono">NODE_HASH: 0x811c9dc5</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-emerald-500 font-bold tracking-tighter">LIVE_LEDGER_SYNC</span>
        </div>
      </div>

      <div className="p-2">
        {logEntries.map((act, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors group">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{act.text}</span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Hash: <span className="text-slate-500">{act.hash}</span></span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-tighter">
              Verified on-chain ✓
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-[9px] text-slate-500 italic">
          Tamper-proof logs via notarized ledger technology.
        </p>
      </div>
    </div>
  );
};

export default ImmutableAuditLog;
