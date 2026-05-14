import React, { useEffect, useState } from 'react';
import { User, ShieldAlert } from 'lucide-react';

const WhatsAppAlert = ({ isTriggered, onClose, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isTriggered) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isTriggered, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[20000] animate-in slide-in-from-right duration-500 ease-out">
      <div className="bg-[#25D366] text-white w-80 rounded-lg shadow-2xl overflow-hidden border border-emerald-400">
        <div className="p-3 bg-[#1ebe5d] flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-none">Tuan Azman (Site Supervisor)</h4>
            <p className="text-[10px] opacity-80 mt-1">Status: Online</p>
          </div>
        </div>
        <div className="p-4 bg-white text-slate-800 relative">
          <div className="absolute top-0 right-3 -translate-y-1/2">
             <div className="bg-white w-3 h-3 rotate-45 border-l border-t border-slate-100"></div>
          </div>
          <div className="text-[13px] leading-relaxed">
            {message || (
              <p>
                ⚠️ <strong>KECEMASAN:</strong> Ahmad Razif reached <strong>CRITICAL</strong> heat risk level at Site A. 
                Immediate 15-minute rest enforced. Logged to Blockchain Audit.
              </p>
            )}
          </div>
          <div className="flex justify-end mt-2 text-[10px] text-slate-400 font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAlert;
