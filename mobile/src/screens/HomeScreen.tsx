import React, { useState, useEffect } from 'react';
import { Heart, Thermometer, Battery, ShieldAlert, RefreshCw, Zap, ChevronRight, Activity, Wind, AlertOctagon } from 'lucide-react';
import { LiveWaveform } from '../components/LiveWaveform';
import { StatCard } from '../components/StatCard';
import { Chip } from '../components/Chip';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { simulator } from '../services/simulationEngine';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AnomalyEvent, ClinicalCondition, MultiVitalReading } from '../types';

interface HomeScreenProps {
  isSimulated: boolean;
  onNavigateToTab: (tab: string) => void;
  onTriggerFallModal: () => void;
  anomalies: AnomalyEvent[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isSimulated,
  onNavigateToTab,
  onTriggerFallModal,
  anomalies
}) => {
  const { user } = useAuth();
  const [reading, setReading] = useState<MultiVitalReading>(() => simulator.step());
  const [isSyncing, setIsSyncing] = useState(false);

  // Live telemetry loop
  useEffect(() => {
    const interval = setInterval(() => {
      const step = simulator.step();
      setReading(step);
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulated]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await api.triggerSync();
    setTimeout(() => setIsSyncing(false), 900);
  };

  const isAlertActive = reading.condition !== "NORMAL";
  const latestAnomaly = anomalies[0];

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in">
      {/* Greeting & Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
            Continuous Telemetry
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Hello, {user ? user.name.split(' ')[0] : 'Alex'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Sync Wearable Data"
            className="p-2 rounded-xl bg-[#162238] border border-[#22324D] text-slate-300 hover:text-white transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3EE8D3]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Pulse Rate Hero Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wider uppercase">
              <Heart className="w-4 h-4 fill-rose-500 pt-beat" />
              <span>Live Pulse Rate · Optical PPG</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-white leading-none">
                {reading.bpm}
              </span>
              <span className="text-slate-400 text-sm font-semibold">BPM</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`w-3 h-3 rounded-full ${
                reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
                  ? 'bg-rose-500 animate-ping'
                  : isAlertActive
                  ? 'bg-amber-400 pt-dot-live-amber'
                  : 'bg-[#3EE8D3] pt-dot-live'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                  : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS'
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                  : reading.condition === 'TACHYCARDIA_STRESS'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-[#162238] border-[#22324D] text-slate-300'
              }`}
            >
              {reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
                ? '⚡ Seizure Surge'
                : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS'
                ? 'Low O2 (Hypoxia)'
                : reading.condition === 'TACHYCARDIA_STRESS'
                ? 'Tachycardia Spike'
                : reading.condition === 'FEBRILE_HYPERTHERMIA'
                ? 'Febrile State'
                : 'Normal Resting'}
            </span>
          </div>
        </div>

        {/* Live Continuous Scrolling PPG Waveform */}
        <div className="mt-4 mb-3">
          <LiveWaveform bpm={reading.bpm} alert={isAlertActive} />
        </div>

        {/* Signal Quality & Status Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1A263C] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3EE8D3]" />
            <span className="text-slate-300">
              Signal: <strong className="text-white font-semibold">{reading.quality >= 90 ? 'Excellent' : 'Good'}</strong> ({reading.quality}%)
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">50Hz stream · OK</span>
        </div>
      </div>

      {/* Dynamic Real-Time Clinical Diagnostic Conclusion Banner */}
      <div
        onClick={() => onNavigateToTab('insights')}
        className={`rounded-2xl p-3.5 flex items-start justify-between cursor-pointer transition pt-fade-in shadow-md border ${
          reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
            ? 'bg-rose-950/40 border-rose-500/80 shadow-rose-900/30 animate-pulse'
            : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS'
            ? 'bg-orange-950/40 border-orange-500/80'
            : reading.condition === 'TACHYCARDIA_STRESS'
            ? 'bg-amber-500/10 border-amber-500/40'
            : reading.condition === 'FEBRILE_HYPERTHERMIA'
            ? 'bg-purple-950/40 border-purple-500/80'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
                ? 'bg-rose-500/30 text-rose-400'
                : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS'
                ? 'bg-orange-500/30 text-orange-400'
                : reading.condition === 'TACHYCARDIA_STRESS'
                ? 'bg-amber-500/20 text-amber-400'
                : reading.condition === 'FEBRILE_HYPERTHERMIA'
                ? 'bg-purple-500/30 text-purple-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {reading.condition === 'EPILEPTIC_SEIZURE_SURGE' ? (
              <AlertOctagon className="w-4 h-4 animate-bounce" />
            ) : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS' ? (
              <Wind className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </div>
          <div>
            <div
              className={`text-xs font-bold ${
                reading.condition === 'EPILEPTIC_SEIZURE_SURGE'
                  ? 'text-rose-300'
                  : reading.condition === 'HYPOXIA_RESPIRATORY_DISTRESS'
                  ? 'text-orange-300'
                  : reading.condition === 'TACHYCARDIA_STRESS'
                  ? 'text-amber-300'
                  : reading.condition === 'FEBRILE_HYPERTHERMIA'
                  ? 'text-purple-300'
                  : 'text-emerald-300'
              }`}
            >
              ML Diagnostic Conclusion · Confidence {reading.confidence}%
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5 leading-snug">
              {reading.conclusion}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
      </div>

      {/* 4-Metric Vitals Grid (Including Blood O2 / SpO2, Skin Temp, HRV, Motion) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Blood O2 (SpO2) Card */}
        <div
          className={`bg-[#0E1524] border rounded-xl p-3 transition ${
            reading.spo2 < 90 ? 'border-orange-500/60 bg-orange-950/20' : 'border-[#22324D]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Blood O2 (SpO2)</span>
            <Wind className={`w-3.5 h-3.5 ${reading.spo2 < 90 ? 'text-orange-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`font-mono text-lg font-bold ${reading.spo2 < 90 ? 'text-orange-300' : 'text-white'}`}>
              {reading.spo2}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <span className={`text-[10px] font-medium block mt-0.5 ${reading.spo2 < 90 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {reading.spo2 >= 95 ? '● Optimal O2' : '⚠️ Hypoxic Corridor'}
          </span>
        </div>

        {/* Skin Temp Card */}
        <div
          className={`bg-[#0E1524] border rounded-xl p-3 transition ${
            reading.temp > 38.0 ? 'border-purple-500/60 bg-purple-950/20' : 'border-[#22324D]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Skin Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`font-mono text-lg font-bold ${reading.temp > 38.0 ? 'text-purple-300' : 'text-white'}`}>
              {reading.temp}
            </span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <span className={`text-[10px] font-medium block mt-0.5 ${reading.temp > 38.0 ? 'text-purple-400' : 'text-emerald-400'}`}>
            {reading.temp > 38.0 ? '● Febrile Spike' : '● Circadian Normal'}
          </span>
        </div>

        {/* HRV RMSSD Card */}
        <div className="bg-[#0E1524] border border-[#22324D] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>HRV (rMSSD)</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-bold text-white">{reading.hrv}</span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-teal-300 font-medium block mt-0.5">
            {reading.hrv >= 35 ? 'High recovery' : 'Sympathetic load'}
          </span>
        </div>

        {/* Convulsion / Motion Card */}
        <div
          className={`bg-[#0E1524] border rounded-xl p-3 transition ${
            reading.motion_g > 1.5 ? 'border-rose-500/60 bg-rose-950/20' : 'border-[#22324D]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Motion / Convulsion</span>
            <Activity className={`w-3.5 h-3.5 ${reading.motion_g > 1.5 ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`font-mono text-lg font-bold ${reading.motion_g > 1.5 ? 'text-rose-300' : 'text-white'}`}>
              {reading.motion_g}
            </span>
            <span className="text-xs text-slate-400">g</span>
          </div>
          <span className={`text-[10px] font-mono block mt-0.5 ${reading.motion_g > 1.5 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
            {reading.motion_g > 1.5 ? '⚡ Clonic Jerks' : 'Normal Gait'}
          </span>
        </div>
      </div>

      {/* Quick Interactive Event Injection Strip */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-3 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          ML Pipeline State Injection (Simulate Condition)
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => simulator.injectCondition('NORMAL')}
            className="px-2 py-1 bg-[#162238] hover:bg-[#1E2E4B] border border-[#22324D] text-emerald-300 text-[10px] font-semibold rounded-lg transition"
          >
            Normal
          </button>
          <button
            onClick={() => simulator.injectCondition('TACHYCARDIA_STRESS')}
            className="px-2 py-1 bg-[#162238] hover:bg-[#1E2E4B] border border-[#22324D] text-amber-300 text-[10px] font-semibold rounded-lg transition"
          >
            Tachycardia
          </button>
          <button
            onClick={() => simulator.injectCondition('HYPOXIA_RESPIRATORY_DISTRESS')}
            className="px-2 py-1 bg-[#162238] hover:bg-[#1E2E4B] border border-[#22324D] text-orange-300 text-[10px] font-semibold rounded-lg transition"
          >
            Hypoxia (Low O2)
          </button>
          <button
            onClick={() => simulator.injectCondition('FEBRILE_HYPERTHERMIA')}
            className="px-2 py-1 bg-[#162238] hover:bg-[#1E2E4B] border border-[#22324D] text-purple-300 text-[10px] font-semibold rounded-lg transition"
          >
            High Fever
          </button>
          <button
            onClick={() => simulator.injectCondition('EPILEPTIC_SEIZURE_SURGE')}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-[10px] font-bold rounded-lg transition"
          >
            ⚡ Seizure Surge
          </button>
        </div>
      </div>

      {/* 24-Hour Statistical Summary */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Last 24 Hours Summary
          </span>
          <button
            onClick={() => onNavigateToTab('trends')}
            className="text-[11px] text-[#3EE8D3] hover:underline flex items-center gap-0.5 font-medium"
          >
            View Trends <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-2">
          <StatCard label="24h Average" value={72} unit="bpm" />
          <StatCard label="Resting Low" value={58} unit="bpm" subTone="down" sub="During sleep" />
          <StatCard label="Peak High" value={118} unit="bpm" subTone="up" sub="Jogging" />
        </div>
      </div>

      {/* Safety & Fall Detection Test Trigger Card */}
      <div className="bg-gradient-to-r from-[#0E1524] to-[#162035] border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Kinematic Fall & Convulsion Engine</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Monitors high-G deceleration & clonic oscillations with 10s auto-SOS.
          </p>
        </div>
        <button
          onClick={onTriggerFallModal}
          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition active:scale-95 shrink-0"
        >
          Test Alert
        </button>
      </div>

      {/* Latest Flagged Anomaly Event Card */}
      {latestAnomaly && (
        <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Latest On-Device Flagged Event
            </span>
            <button
              onClick={() => onNavigateToTab('insights')}
              className="text-[11px] text-[#3EE8D3] hover:underline flex items-center gap-1 font-semibold"
            >
              All Events <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-start gap-3 pt-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">{latestAnomaly.type.label}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                {latestAnomaly.type.detail}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Chip tone="amber" className="text-[10px]">
                  Confidence {latestAnomaly.confidence}%
                </Chip>
                <span className="text-[10px] text-slate-500 font-mono">
                  {latestAnomaly.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Research Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};