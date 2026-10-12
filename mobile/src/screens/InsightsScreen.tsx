import React, { useState } from 'react';
import {
  FlaskConical, RefreshCw, Zap, ChevronDown, CheckCircle2,
  AlertTriangle, ShieldAlert, Cpu, Check
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Chip } from '../components/Chip';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { AnomalyEvent } from '../types';

interface InsightsScreenProps {
  anomalies: AnomalyEvent[];
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  anomalies,
  onTriggerAnalysis,
  isAnalyzing
}) => {
  const [openId, setOpenId] = useState<string | null>(anomalies[0]?.id || null);
  const highConfidenceCount = anomalies.filter(a => a.confidence >= 75).length;

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in">
      <div>
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
          Machine Learning Pipeline
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Insights & Anomalies</h2>
        <p className="text-xs text-slate-400">On-device edge inference & pattern classification</p>
      </div>

      <DisclaimerBanner />

      {/* Model Information Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3EE8D3]/10 border border-[#1B6E64]/50 flex items-center justify-center text-[#3EE8D3]">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">PulseML · PPG-Net v1.2</h3>
              <p className="text-[11px] text-slate-400">Trained Random Forest Classifier (ESP32 Edge Target)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            INFERENCE READY
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1A263C]">
          <span className="text-xs text-slate-400 font-mono">Status: Evaluated 1,240 intervals</span>
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-[#3EE8D3] hover:bg-[#7CF0DF] active:scale-98 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing…' : 'Run Full Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-2">
        <StatCard label="Total Events (24h)" value={anomalies.length} />
        <StatCard
          label="High Confidence"
          value={highConfidenceCount}
          sub={highConfidenceCount > 0 ? "Review suggested" : "Nominal"}
          subTone={highConfidenceCount > 0 ? "up" : "down"}
        />
      </div>

      {/* Detected Events List */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3.5 border-b border-[#1A263C] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Flagged Episodes ({anomalies.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Sorted by recency</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#3EE8D3] mx-auto" />
            <h4 className="text-sm font-bold text-white">No Abnormal Patterns Flagged</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              All measured pulses are within your personal resting corridor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1A263C]">
            {anomalies.map((event) => {
              const isOpen = openId === event.id;
              const sevColor =
                event.confidence >= 80 ? 'text-amber-400' : 'text-slate-300';

              return (
                <div key={event.id} className="transition">
                  <div
                    onClick={() => setOpenId(isOpen ? null : event.id)}
                    className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141E32] transition"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {event.type.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.bpm} BPM · SQI {event.quality}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${sevColor}`}>
                        {event.confidence}%
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 bg-[#101828]/60 space-y-3 pt-fade-in border-t border-[#172338]">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {event.type.detail}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Chip tone="teal">Confidence Score {event.confidence}%</Chip>
                        <Chip tone="neutral">Signal Quality {event.quality}%</Chip>
                        <Chip tone="amber">Requires Clinical Assessment</Chip>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed px-1">
        Confidence scores reflect model probability about classification, not physiological severity. Flagged events do not establish a diagnosis.
      </p>
    </div>
  );
};