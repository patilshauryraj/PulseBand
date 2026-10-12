import React, { useState } from 'react';
import {
  User, Shield, Smartphone, Heart, Bell, Info, LogOut,
  Sliders, Activity, Check, ExternalLink, ChevronRight, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { simulator } from '../services/simulationEngine';
import { ActivityState } from '../types';

interface SettingsScreenProps {
  isSimulated: boolean;
  setIsSimulated: (val: boolean) => void;
  onOpenProfile: () => void;
  onLogoutConfirm: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isSimulated,
  setIsSimulated,
  onOpenProfile,
  onLogoutConfirm
}) => {
  const { user } = useAuth();
  const [currentAct, setCurrentAct] = useState<ActivityState>(simulator.getActivity() as ActivityState);
  const [metricUnits, setMetricUnits] = useState(true);
  const [highHrAlert, setHighHrAlert] = useState(true);
  const [fallSos, setFallSos] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSetActivity = (act: ActivityState) => {
    simulator.setActivity(act);
    setCurrentAct(act);
  };

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in">
      <div>
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
          Configuration & Account
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-xs text-slate-400">Manage user baselines, safety alerts, and simulation engine</p>
      </div>

      {/* User Profile Card */}
      {user && (
        <div
          onClick={onOpenProfile}
          className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl flex items-center justify-between cursor-pointer hover:bg-[#141E32] transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3EE8D3]/10 border border-[#1B6E64]/50 flex items-center justify-center text-[#3EE8D3] font-mono font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white group-hover:text-[#3EE8D3] transition">
                  {user.name}
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                  {user.role}
                </span>
                {user.auth_provider === 'google' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[9px] font-mono text-slate-300">
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
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                <span>Resting: <strong className="text-white font-mono">{user.resting_hr_bpm} bpm</strong></span>
                <span>•</span>
                <span>Contact: <strong className="text-slate-300">{user.emergency_contact.name}</strong></span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
        </div>
      )}

      {/* Simulation Engine Controls */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Simulation Engine Mode</h3>
            <p className="text-[11px] text-slate-400">Generate real-time physiological streams for demos</p>
          </div>
          <button
            onClick={() => setIsSimulated(!isSimulated)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              isSimulated ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isSimulated ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isSimulated && (
          <div className="pt-2 border-t border-[#1A263C]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Force Activity Telemetry State
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(["RESTING", "WALKING", "RUNNING", "ACTIVE"] as ActivityState[]).map((act) => (
                <button
                  key={act}
                  onClick={() => handleSetActivity(act)}
                  className={`py-1.5 text-[10.5px] font-mono font-bold rounded-lg border transition ${
                    currentAct === act
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-[#162238] text-slate-300 border-[#22324D] hover:text-white'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alerts & Safety Thresholds */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
          Safety & Health Alerts
        </span>

        <div className="divide-y divide-[#1A263C] text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Tachycardia / High HR Warning</span>
              <span className="text-[11px] text-slate-400">Alert if sustained pulse exceeds 120 BPM</span>
            </div>
            <button
              onClick={() => setHighHrAlert(!highHrAlert)}
              className={`w-10 h-5 rounded-full p-0.5 transition ${highHrAlert ? 'bg-teal-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${highHrAlert ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Kinematic Fall Emergency SOS</span>
              <span className="text-[11px] text-slate-400">10-second countdown auto-dispatch</span>
            </div>
            <button
              onClick={() => setFallSos(!fallSos)}
              className={`w-10 h-5 rounded-full p-0.5 transition ${fallSos ? 'bg-rose-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${fallSos ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Measurement Units</span>
              <span className="text-[11px] text-slate-400">Temperatures and distance measurements</span>
            </div>
            <button
              onClick={() => setMetricUnits(!metricUnits)}
              className="px-2.5 py-1 rounded-lg bg-[#162238] border border-[#22324D] text-xs font-mono font-bold text-teal-300"
            >
              {metricUnits ? 'Metric (°C, km)' : 'Imperial (°F, mi)'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D CAD WebGL Link */}
      <a
        href="http://localhost:3002"
        target="_blank"
        rel="noreferrer"
        className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 flex items-center justify-between hover:border-teal-400 transition"
      >
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-teal-400" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>Open 3D WebGL CAD Viewer</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">http://localhost:3002</span>
          </div>
        </div>
        <span className="text-xs text-teal-300 font-bold font-mono">PORT 3002</span>
      </a>

      {/* Sign Out Section */}
      {!showLogoutConfirm ? (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 active:scale-98 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of PulseBand</span>
        </button>
      ) : (
        <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-4 space-y-3 text-center pt-fade-in">
          <p className="text-xs text-white font-semibold">
            Are you sure you want to sign out?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2 bg-[#162238] border border-[#22324D] hover:bg-[#1F2D48] text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={onLogoutConfirm}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
            >
              Confirm Sign Out
            </button>
          </div>
        </div>
      )}

      {/* About footer */}
      <div className="text-center text-[10.5px] text-slate-500 space-y-0.5 pt-2">
        <p className="font-semibold text-slate-400">PulseBand Smart Health Ecosystem v1.0.0</p>
        <p>IndusBoard Coin (ESP32) • React 18 • Vite • Tailwind • Recharts</p>
      </div>
    </div>
  );
};