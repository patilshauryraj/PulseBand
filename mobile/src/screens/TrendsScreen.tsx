import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, Wind, Thermometer, Activity, Heart } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Chip } from '../components/Chip';
import { TimeRangeKey, TrendPoint, MetricType, ClinicalCondition } from '../types';

interface TrendsScreenProps {
  onNavigateToInsights?: () => void;
}

const RANGES: Array<{ key: TimeRangeKey; label: string; count: number; seed: number; amp: number }> = [
  { key: "1H", label: "1 Hour", count: 30, seed: 11, amp: 6 },
  { key: "6H", label: "6 Hours", count: 42, seed: 22, amp: 10 },
  { key: "24H", label: "24 Hours", count: 60, seed: 33, amp: 13 },
  { key: "7D", label: "7 Days", count: 56, seed: 44, amp: 15 },
];

function generateMultiVitalSeries(count: number, { seed = 1, amp = 10 } = {}): TrendPoint[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const out: TrendPoint[] = [];
  for (let i = 0; i < count; i++) {
    const wave =
      Math.sin(i * 0.22 + seed) * amp * 0.6 +
      Math.sin(i * 0.05 + seed * 2) * amp * 0.9 +
      (rand() - 0.5) * 4;

    let bpm = Math.max(52, Math.min(125, Math.round(74 + wave)));
    let spo2 = Math.round((98.2 - Math.abs(wave * 0.15) + (rand() - 0.5) * 0.4) * 10) / 10;
    let temp = Math.round((36.8 + wave * 0.04 + (rand() - 0.5) * 0.1) * 10) / 10;
    let motion_g = Math.round((0.05 + Math.abs(wave * 0.03) + rand() * 0.04) * 100) / 100;
    let cond: ClinicalCondition = "NORMAL";
    let isAnomaly = false;

    // Introduce periodic clinical events / outliers
    if (rand() < 0.07) {
      const eventType = rand();
      if (eventType < 0.35) {
        // Tachycardia
        bpm = Math.min(160, bpm + Math.round(25 + rand() * 30));
        cond = "TACHYCARDIA_STRESS";
        isAnomaly = true;
      } else if (eventType < 0.65) {
        // Hypoxia (Low SpO2)
        spo2 = Math.max(78.0, Math.round((82.5 + rand() * 5.0) * 10) / 10);
        bpm = Math.round(bpm + 15);
        cond = "HYPOXIA_RESPIRATORY_DISTRESS";
        isAnomaly = true;
      } else if (eventType < 0.85) {
        // Fever
        temp = Math.round((38.8 + rand() * 1.2) * 10) / 10;
        cond = "FEBRILE_HYPERTHERMIA";
        isAnomaly = true;
      } else {
        // Epileptic Seizure Surge
        bpm = Math.round(155 + rand() * 20);
        spo2 = Math.round((83.0 + rand() * 3.0) * 10) / 10;
        motion_g = Math.round((2.8 + rand() * 1.5) * 100) / 100;
        cond = "EPILEPTIC_SEIZURE_SURGE";
        isAnomaly = true;
      }
    }

    out.push({
      i,
      bpm,
      spo2,
      temp,
      hrv: Math.max(8, Math.round(55 - (bpm - 70) * 0.4)),
      motion_g,
      riskScore: isAnomaly ? 85 : 12,
      isAnomaly,
      condition: cond,
      quality: Math.round(Math.max(60, Math.min(99, 85 + (rand() - 0.4) * 20)))
    });
  }
  return out;
}

export const TrendsScreen: React.FC<TrendsScreenProps> = ({ onNavigateToInsights }) => {
  const [range, setRange] = useState<TimeRangeKey>("24H");
  const [activeMetric, setActiveMetric] = useState<MetricType>("bpm");

  const cfg = RANGES.find((r) => r.key === range) || RANGES[2];

  const data = useMemo(() => {
    return generateMultiVitalSeries(cfg.count, { amp: cfg.amp, seed: cfg.seed }).map((d, idx) => {
      let label = `${idx}`;
      if (range === "7D") {
        label = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx % 7];
      } else if (range === "24H") {
        label = `${(idx * 24 / cfg.count).toFixed(0)}h`;
      } else if (range === "6H") {
        label = `${(idx * 6 / cfg.count).toFixed(0)}h`;
      } else {
        label = `${(idx * 2).toFixed(0)}m`;
      }
      return { ...d, label };
    });
  }, [range, cfg]);

  // Dynamic statistics based on selected metric
  const stats = useMemo(() => {
    const vals = data.map((d) => d[activeMetric] as number);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    if (activeMetric === "spo2" || activeMetric === "temp") {
      return {
        avg: avg.toFixed(1),
        min: min.toFixed(1),
        max: max.toFixed(1),
        variability: Math.sqrt(variance).toFixed(1)
      };
    } else if (activeMetric === "motion") {
      return {
        avg: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        variability: Math.sqrt(variance).toFixed(2)
      };
    } else {
      return {
        avg: Math.round(avg).toString(),
        min: Math.round(min).toString(),
        max: Math.round(max).toString(),
        variability: Math.round(Math.sqrt(variance)).toString()
      };
    }
  }, [data, activeMetric]);

  const anomalyCount = data.filter((d) => d.isAnomaly).length;

  const metricConfig = {
    bpm: {
      label: "Pulse Curve (BPM)",
      color: "#3EE8D3",
      fillColor: "rgba(62, 232, 211, 0.15)",
      unit: "bpm",
      min: 40,
      max: 180,
      corridor: "60-100 Norm Corridor",
      threshold: 100
    },
    spo2: {
      label: "Blood Oxygen (SpO2 %)",
      color: "#10B981",
      fillColor: "rgba(16, 185, 129, 0.15)",
      unit: "%",
      min: 70,
      max: 100,
      corridor: ">95% Optimal Baseline",
      threshold: 95
    },
    temp: {
      label: "Skin Temperature (°C)",
      color: "#F59E0B",
      fillColor: "rgba(245, 158, 11, 0.15)",
      unit: "°C",
      min: 35.0,
      max: 41.0,
      corridor: "36.5-37.5°C Normal",
      threshold: 38.0
    },
    motion: {
      label: "Motion / Convulsion (g)",
      color: "#A855F7",
      fillColor: "rgba(168, 85, 247, 0.15)",
      unit: "g",
      min: 0.0,
      max: 4.5,
      corridor: "<0.5g Normal Ambulation",
      threshold: 1.5
    }
  }[activeMetric];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const val = p[activeMetric];

    return (
      <div className="bg-[#141E32] border border-[#22324D] rounded-lg p-2.5 text-xs font-mono shadow-xl space-y-1">
        <div className="text-slate-400 text-[10px]">{label}</div>
        <div className={`font-bold ${p.isAnomaly ? 'text-amber-400' : 'text-[#3EE8D3]'}`}>
          {val} {metricConfig.unit}
        </div>
        {p.isAnomaly && (
          <div className="text-[10px] text-rose-300 font-sans border-t border-[#22324D] pt-1">
            ⚠️ {p.condition.replace(/_/g, ' ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in">
      <div>
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
          Longitudinal Analytics
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Physiological Trends</h2>
        <p className="text-xs text-slate-400">Multi-vital trends and ML outlier flags over selectable temporal windows</p>
      </div>

      {/* Time Range Selector Segments */}
      <div className="flex bg-[#0E1524] border border-[#22324D] p-1 rounded-xl">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition font-mono ${
              range === r.key
                ? 'bg-[#3EE8D3] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-[#0E1524] border border-[#22324D] p-1.5 rounded-xl text-center">
        <button
          onClick={() => setActiveMetric("bpm")}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold flex flex-col items-center gap-1 transition ${
            activeMetric === "bpm" ? 'bg-[#162238] text-[#3EE8D3] border border-[#3EE8D3]/40' : 'text-slate-400'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Pulse HR</span>
        </button>
        <button
          onClick={() => setActiveMetric("spo2")}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold flex flex-col items-center gap-1 transition ${
            activeMetric === "spo2" ? 'bg-[#162238] text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-emerald-400" />
          <span>SpO2 %</span>
        </button>
        <button
          onClick={() => setActiveMetric("temp")}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold flex flex-col items-center gap-1 transition ${
            activeMetric === "temp" ? 'bg-[#162238] text-amber-300 border border-amber-500/40' : 'text-slate-400'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>Skin Temp</span>
        </button>
        <button
          onClick={() => setActiveMetric("motion")}
          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold flex flex-col items-center gap-1 transition ${
            activeMetric === "motion" ? 'bg-[#162238] text-purple-300 border border-purple-500/40' : 'text-slate-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>Motion (g)</span>
        </button>
      </div>

      {/* Dynamic Recharts Area Chart Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3EE8D3]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {metricConfig.label} ({range})
            </span>
          </div>
          <Chip
            icon={AlertTriangle}
            tone={anomalyCount > 0 ? 'amber' : 'neutral'}
            className="text-[10px]"
            onClick={onNavigateToInsights}
          >
            {anomalyCount} flagged
          </Chip>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#475569"
                fontSize={10}
                domain={[metricConfig.min, metricConfig.max]}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={metricConfig.threshold} stroke="#64748b" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metricConfig.color}
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#metricGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isAnomaly) {
                    return (
                      <circle
                        key={`dot-${payload.i}`}
                        cx={cx}
                        cy={cy}
                        r={4.5}
                        fill="#f59e0b"
                        stroke="#0e1524"
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1A263C]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5" style={{ backgroundColor: metricConfig.color }} />
            <span>Telemetry Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ML Flagged Outlier</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{metricConfig.corridor}</span>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="flex gap-2">
        <StatCard label="Average" value={stats.avg} unit={metricConfig.unit} />
        <StatCard label="Min - Max" value={`${stats.min}–${stats.max}`} unit={metricConfig.unit} />
        <StatCard label="Variability" value={`${stats.variability}`} unit={`±${metricConfig.unit}`} />
      </div>

      {/* Dynamic Clinical Conclusion for Trends */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-3.5 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-[#3EE8D3] flex items-center gap-1.5">
          <span>ML Longitudinal Trend Assessment</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {anomalyCount > 0
            ? `Detected ${anomalyCount} physiological outlier episodes over the ${range} observation window. Transient deviations correspond to flagged sympathetic acceleration or peripheral desaturation.`
            : `All telemetry traces remain tightly bounded within normal physiological corridors across the ${range} monitoring window.`}
        </p>
      </div>
    </div>
  );
};