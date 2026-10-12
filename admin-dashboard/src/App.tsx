import React, { useEffect, useState } from 'react';
import { Activity, Cpu, ShieldAlert, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>({
    total_users: 1,
    total_devices: 1,
    active_devices: 1,
    total_fall_events: 0,
    ml_inferences_today: 128450,
    api_health: "OPTIMAL",
    hardware_sensors: [
      { sensor: "PPG (MAX30102)", status: "OPERATIONAL", avg_sqi: 94.2 },
      { sensor: "Skin Temp (NTC/MAX30205)", status: "OPERATIONAL", avg_sqi: 99.1 },
      { sensor: "Accelerometer (MPU6050)", status: "OPERATIONAL", avg_sqi: 98.4 },
      { sensor: "Magnetometer (QMC5883L)", status: "OPERATIONAL", avg_sqi: 96.0 },
      { sensor: "Proximity / Wear", status: "OPERATIONAL", avg_sqi: 100.0 },
      { sensor: "RTC Sync", status: "OPERATIONAL", avg_sqi: 100.0 }
    ]
  });

  const fetchOverview = () => {
    fetch("http://127.0.0.1:8000/admin/overview")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">PulseBand Cloud Observability</h1>
            <p className="text-xs text-slate-400">IndusBoard Coin Fleet & Machine Learning Telemetry</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3000/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3EE8D3]/15 hover:bg-[#3EE8D3]/25 border border-[#3EE8D3]/40 text-[#3EE8D3] text-xs font-bold rounded-lg transition"
            >
              Open Health Dashboard (Port 3000) &rarr;
            </a>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Status: {data.api_health}
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Registered Users</span>
            <div className="text-3xl font-black text-white mt-1">{data.total_users}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">PostgreSQL Relational DB</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active IndusBoards</span>
            <div className="text-3xl font-black text-white mt-1">{data.active_devices}</div>
            <span className="text-[10px] text-sky-400 font-semibold">BLE 5.0 GATT & Wi-Fi Ingestion</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase">ML Inferences (Today)</span>
            <div className="text-3xl font-black text-white mt-1">{data.ml_inferences_today.toLocaleString()}</div>
            <span className="text-[10px] text-indigo-400 font-semibold">Random Forest + Hybrid Fall</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Fall Events</span>
            <div className="text-3xl font-black text-rose-400 mt-1">{data.total_fall_events}</div>
            <span className="text-[10px] text-slate-400">Emergency safety monitored</span>
          </div>
        </div>

        {/* Hardware Sensor Fleet Health Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            IndusBoard Coin Hardware Sensor Telemetry
          </h2>
          <div className="divide-y divide-slate-800">
            {data.hardware_sensors.map((s: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-200">{s.sensor}</span>
                  <span className="block text-[10px] text-slate-500">Continuous 50Hz hardware sampling</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-slate-400 text-xs">Average SQI: <strong className="text-slate-200">{s.avg_sqi}%</strong></span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                    ● {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
