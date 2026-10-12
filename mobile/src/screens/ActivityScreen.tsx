import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Navigation, Clock, Activity, Target } from 'lucide-react';
import { api, ActivitySummary } from '../services/api';
import { StatCard } from '../components/StatCard';

export const ActivityScreen: React.FC = () => {
  const [data, setData] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    api.getActivityToday().then(setData);
  }, []);

  const steps = data?.steps || 6840;
  const goal = data?.step_goal || 10000;
  const progress = Math.min(100, Math.round((steps / goal) * 100));

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in">
      <div>
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
          Kinematics & Motion
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Activity Tracking</h2>
        <p className="text-xs text-slate-400">Continuous 6-axis IMU step counting & posture classification</p>
      </div>

      {/* Main Step Goal Ring / Progress Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Footprints className="w-4 h-4" />
            <span>Daily Step Counter</span>
          </div>
          <span className="text-xs font-mono text-slate-400 font-medium">Goal: {goal.toLocaleString()}</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-mono text-4xl font-extrabold text-white">
              {steps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">steps taken</span>
          </div>
          <span className="font-mono text-xl font-bold text-emerald-400">{progress}%</span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#162238] rounded-full h-3 overflow-hidden p-0.5 border border-[#22324D]">
          <div
            className="bg-gradient-to-r from-[#3EE8D3] to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 3-Card Motion Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0E1524] border border-[#22324D] rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Cal</span>
          <div className="mt-1 font-mono text-lg font-bold text-white">
            {data?.active_calories_kcal || 345}
          </div>
          <span className="text-[10px] text-slate-500">kcal</span>
        </div>

        <div className="bg-[#0E1524] border border-[#22324D] rounded-xl p-3 text-center">
          <Navigation className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Distance</span>
          <div className="mt-1 font-mono text-lg font-bold text-white">
            {data?.distance_km || 4.8}
          </div>
          <span className="text-[10px] text-slate-500">km</span>
        </div>

        <div className="bg-[#0E1524] border border-[#22324D] rounded-xl p-3 text-center">
          <Activity className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Time</span>
          <div className="mt-1 font-mono text-lg font-bold text-white">
            {data?.active_minutes || 52}
          </div>
          <span className="text-[10px] text-slate-500">mins</span>
        </div>
      </div>

      {/* Daily Posture Breakdown */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Kinematic Posture Distribution
        </span>
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#162238]">
          <div style={{ width: '62%' }} className="bg-slate-600" title="Resting / Sedentary (62%)" />
          <div style={{ width: '26%' }} className="bg-[#3EE8D3]" title="Walking (26%)" />
          <div style={{ width: '12%' }} className="bg-amber-400" title="Running / Active (12%)" />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Rest 62%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3EE8D3]" /> Walk 26%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Run 12%
          </span>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Activity Timeline
          </span>
          <span className="text-[10.5px] text-slate-500 font-mono">Today</span>
        </div>

        <div className="space-y-2.5">
          {(data?.timeline || [
            { time: "08:10", activity: "Morning Walk", duration: "25m" },
            { time: "08:40", activity: "Desk Work", duration: "1h 15m" },
            { time: "10:15", activity: "Brisk Walk", duration: "18m" },
            { time: "11:30", activity: "Stairs Climbing", duration: "10m" },
            { time: "12:15", activity: "Resting", duration: "45m" }
          ]).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#141E32] border border-[#1A263C]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">{item.activity}</div>
                  <span className="text-[10.5px] text-slate-400 font-mono">{item.time}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#1C2A44] text-[#7CF0DF]">
                {item.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};