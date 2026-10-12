import React, { useEffect, useState } from 'react';
import { ShieldAlert, PhoneCall, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FallAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FallAlertModal: React.FC<FallAlertModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen && countdown > 0 && !dispatched) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && !dispatched) {
      setDispatched(true);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, dispatched]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setCountdown(10);
    setDispatched(false);
    onClose();
  };

  const contact = user?.emergency_contact || {
    name: "Dr. Sarah Jenkins",
    phone: "+1 (555) 349-2810",
    relationship: "Primary Caregiver"
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 pt-fade-in">
      <div className="w-full max-w-sm bg-[#0E1524] border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl shadow-rose-900/40 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500 pt-beat">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block">
            Impact Sensor Trigger
          </span>
          <h2 className="text-xl font-bold text-white mt-1">High-G Fall Detected</h2>
          <p className="text-xs text-slate-300 mt-1">
            IndusBoard 6-axis IMU detected a rapid deceleration (&gt;2.8G) followed by immobility.
          </p>
        </div>

        {/* Countdown Box */}
        {!dispatched ? (
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">
              Dispatching emergency notification in
            </span>
            <div className="font-mono text-4xl font-extrabold text-rose-400">
              {countdown}s
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Recipient: <strong className="text-white">{contact.name}</strong> ({contact.phone})
            </p>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-3 text-emerald-300 space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Emergency SOS Dispatched
            </div>
            <p className="text-[11px] text-slate-300">
              Location coordinates & heart telemetry transmitted to {contact.name}.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            I am OK · Cancel Emergency Alert
          </button>

          <a
            href={`tel:${contact.phone}`}
            className="w-full py-2.5 bg-[#162035] hover:bg-[#1F2D48] text-slate-200 font-semibold text-xs rounded-xl border border-[#22324D] transition flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
            Call Emergency Contact Now
          </a>
        </div>
      </div>
    </div>
  );
};