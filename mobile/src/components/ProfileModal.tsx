import React, { useState } from 'react';
import { X, User, Heart, Phone, ShieldCheck, LogOut, Edit2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutConfirm: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onLogoutConfirm
}) => {
  const { user, updateProfile } = useAuth();
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactName, setContactName] = useState(user?.emergency_contact.name || '');
  const [contactPhone, setContactPhone] = useState(user?.emergency_contact.phone || '');
  const [contactRelation, setContactRelation] = useState(user?.emergency_contact.relationship || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveContact = () => {
    updateProfile({
      emergency_contact: {
        ...user.emergency_contact,
        name: contactName,
        phone: contactPhone,
        relationship: contactRelation
      }
    });
    setIsEditingContact(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 pt-fade-in">
      <div className="w-full max-w-md bg-[#0E1524] border border-[#22324D] rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A263C]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3EE8D3]/10 border border-[#1B6E64]/50 flex items-center justify-center text-[#3EE8D3] font-bold text-base font-mono">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white leading-tight">{user.name}</h2>
                {user.auth_provider === 'google' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9.5px] font-medium text-slate-200">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometrics Card */}
        <div className="bg-[#141E32] border border-[#22324D] rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Physiological Baseline Parameters
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[#0E1524] border border-[#1A263C]">
              <span className="text-slate-400 text-[10px] block">Age</span>
              <span className="font-mono font-bold text-white">{user.age} yrs</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0E1524] border border-[#1A263C]">
              <span className="text-slate-400 text-[10px] block">Resting HR</span>
              <span className="font-mono font-bold text-[#3EE8D3]">{user.resting_hr_bpm} bpm</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0E1524] border border-[#1A263C]">
              <span className="text-slate-400 text-[10px] block">Max HR</span>
              <span className="font-mono font-bold text-rose-400">{user.max_hr_bpm} bpm</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0E1524] border border-[#1A263C]">
              <span className="text-slate-400 text-[10px] block">Weight</span>
              <span className="font-mono font-bold text-white">{user.weight_kg} kg</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-[#141E32] border border-[#22324D] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-rose-400" />
              Emergency Safety Contact
            </span>
            {!isEditingContact ? (
              <button
                onClick={() => setIsEditingContact(true)}
                className="text-[11px] text-teal-300 hover:text-teal-200 flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveContact}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            )}
          </div>

          {!isEditingContact ? (
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">{user.emergency_contact.name}</p>
              <p className="text-slate-400 font-mono">{user.emergency_contact.phone}</p>
              <p className="text-[11px] text-slate-500">{user.emergency_contact.relationship} · Auto-notify on fall enabled</p>
            </div>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
                className="w-full px-3 py-1.5 bg-[#0E1524] border border-[#22324D] rounded-lg text-white text-xs focus:outline-none focus:border-teal-400"
              />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-3 py-1.5 bg-[#0E1524] border border-[#22324D] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-teal-400"
              />
              <input
                type="text"
                value={contactRelation}
                onChange={(e) => setContactRelation(e.target.value)}
                placeholder="Relationship (e.g. Physician, Spouse)"
                className="w-full px-3 py-1.5 bg-[#0E1524] border border-[#22324D] rounded-lg text-white text-xs focus:outline-none focus:border-teal-400"
              />
            </div>
          )}
        </div>

        {/* Paired Device Info */}
        <div className="bg-[#141E32] border border-[#22324D] rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paired Hardware</span>
            <p className="font-bold text-white mt-0.5">IndusBoard Coin (Unit 01)</p>
            <span className="text-[11px] text-slate-400 font-mono">ESP32 Core · BLE 5.0</span>
          </div>
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-mono font-bold">
            PAIRED
          </span>
        </div>

        {/* Logout Section */}
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of PulseBand
          </button>
        ) : (
          <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3.5 space-y-2.5 text-center">
            <p className="text-xs text-slate-200 font-medium">Are you sure you want to sign out?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onLogoutConfirm}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};