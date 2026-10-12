import React, { useState } from 'react';
import { Heart, Thermometer, Clock } from 'lucide-react';

export const HealthScreen: React.FC = () => {
  const [range, setRange] = useState<"1H" | "6H" | "12H" | "24H" | "7D">("24H");
  const ranges: Array<"1H" | "6H" | "12H" | "24H" | "7D"> = ["1H", "6H", "12H", "24H", "7D"];

  // Mock interactive points for selected time range
  const mockTrend = [68, 70, 72, 74, 88, 102, 94, 76, 73, 71, 69, 72, 75, 74];

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Health Trends</h1>
        <p className="text-xs text-slate-400">Continuous physiological monitoring & baseline insights</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              range === r ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Heart Rate Detailed Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Heart Rate History ({range})</span>
          </div>
          <span className="text-xs text-slate-400">Avg 74 BPM</span>
        </div>

        {/* CSS-rendered responsive bar / trend graph */}
        <div className="h-36 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-800">
          {mockTrend.map((val, idx) => {
            const heightPct = Math.min(100, Math.max(20, ((val - 50) / 70) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div 
                  className="w-full bg-rose-500/30 hover:bg-rose-500 rounded-t-sm transition-all duration-300"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9px] text-slate-500 hidden group-hover:block absolute -top-5 bg-slate-800 px-1 rounded text-white z-10">
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
          <div>
            <span className="text-slate-500 uppercase">Resting</span>
            <p className="font-bold text-slate-200">64 BPM</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase">Current</span>
            <p className="font-bold text-rose-400">74 BPM</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase">Peak</span>
            <p className="font-bold text-slate-200">102 BPM</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase">HRV (est)</span>
            <p className="font-bold text-slate-200">48 ms</p>
          </div>
        </div>
      </div>

      {/* Temperature Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sky-400">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Skin Temperature Trend</span>
          </div>
          <span className="text-xs text-slate-400">36.4 °C</span>
        </div>
        <p className="text-xs text-slate-300">
          Skin temperature is consistent within your typical circadian variation (36.1°C - 36.6°C).
        </p>
      </div>

      {/* Health Observations */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Observation Note</span>
        <p className="text-xs text-slate-400 leading-relaxed">
          PulseBand monitors physiological trends and motion patterns for personal wellness. It is not intended for clinical diagnosis.
        </p>
      </div>
    </div>
  );
};
