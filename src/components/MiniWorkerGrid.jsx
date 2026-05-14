import React from 'react';
import { ShieldCheck } from 'lucide-react';

const workers = [
  { name: "Ahmad Razif", role: "Foreman", risk: "CRITICAL", riskColor: "red" },
  { name: "Ravi Subramaniam", role: "General Worker", risk: "HIGH", riskColor: "orange" },
  { name: "Nurul Ain", role: "Site Supervisor", risk: "MODERATE", riskColor: "yellow" },
  { name: "Jakaria bin Daud", role: "Machine Operator", risk: "HIGH", riskColor: "orange" }
];

const MiniWorkerGrid = ({ districtName }) => {
  // Mock assignment logic: Ahmad and Ravi in KL districts, Nurul and Jakaria elsewhere
  const assignedWorkers = (districtName?.includes('Kuala') || districtName?.includes('KL')) 
    ? [workers[0], workers[1]] 
    : [workers[2], workers[3]];

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheck size={12} className="text-blue-500" />
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Assigned Personnel</span>
      </div>
      <div className="space-y-2">
        {assignedWorkers.map((worker, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-none">{worker.name}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{worker.role}</p>
            </div>
            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
              worker.risk === 'CRITICAL' ? 'bg-red-500 text-white' : 
              worker.risk === 'HIGH' ? 'bg-orange-500 text-white' : 
              'bg-yellow-500 text-black'
            }`}>
              {worker.risk}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-slate-400 italic mt-2 text-center uppercase">Securely linked via EnviroPulse Node</p>
    </div>
  );
};

export default MiniWorkerGrid;
