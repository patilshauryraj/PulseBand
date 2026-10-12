import React, { useState } from 'react';
import {
  Cpu, CheckCircle2, Play, Battery, Radio, ShieldCheck,
  RefreshCw, Settings, Bluetooth, Signal, Clock, Layers, ExternalLink,
  Send, Code2, Wifi, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { simulator } from '../services/simulationEngine';
import { Chip } from '../components/Chip';

export const DeviceScreen: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showFirmwareCode, setShowFirmwareCode] = useState(false);

  // Live Hardware Interactive Test Inputs
  const [hwHr, setHwHr] = useState(82);
  const [hwSpo2, setHwSpo2] = useState(98.2);
  const [hwTemp, setHwTemp] = useState(36.8);
  const [hwMotion, setHwMotion] = useState(0.05);
  const [packetCount, setPacketCount] = useState(0);
  const [packetLogs, setPacketLogs] = useState<Array<{ id: number; time: string; text: string }>>([
    { id: 1, time: "Initial", text: "Ready to ingest live hardware telemetry packets on /api/sensor-data" }
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRunTest = async () => {
    setTesting(true);
    const res = await api.runSensorTest();
    setTimeout(() => {
      setTestResult(res);
      setTesting(false);
      showToast("Diagnostic self-test completed");
    }, 1200);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await api.triggerSync();
    setTimeout(() => {
      setIsSyncing(false);
      showToast("Device buffer synced successfully");
    }, 1000);
  };

  const handleRecalibrate = () => {
    showToast("MAX30102 optical LED currents recalibrated");
  };

  // Transmit live hardware packet into simulation engine & backend
  const handleTransmitHardwarePacket = async () => {
    const payload = {
      bpm: hwHr,
      spo2: hwSpo2,
      temp: hwTemp,
      motion_g: hwMotion
    };

    simulator.injectLiveHardwarePacket(payload);
    const newCount = packetCount + 1;
    setPacketCount(newCount);

    const logEntry = {
      id: newCount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: `Ingested: HR=${hwHr} BPM | SpO2=${hwSpo2}% | Temp=${hwTemp}°C | Motion=${hwMotion}g`
    };
    setPacketLogs(prev => [logEntry, ...prev].slice(0, 8));
    showToast(`Live Hardware Packet #${newCount} Ingested!`);

    // Optional POST to backend API if active
    try {
      await fetch("http://127.0.0.1:8000/api/sensor-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heart_rate: hwHr,
          spo2: hwSpo2,
          temperature: hwTemp,
          motion_g: hwMotion,
          device_id: "PULSEBAND_HARDWARE_NODE"
        })
      });
    } catch {
      // Offline fallback: simulator already handled it
    }
  };

  const sensors = [
    { name: "MAX30102 Optical PPG", desc: "Dual Red/IR Pulse Photodiode (50Hz)", status: "Operational", sqi: "96%" },
    { name: "MAX30205 / NTC Temp", desc: "Skin Temperature Thermistor (0.1°C)", status: "Operational", sqi: "99%" },
    { name: "MPU6050 6-Axis Motion", desc: "Tri-axis Accelerometer & Gyroscope", status: "Operational", sqi: "98%" },
    { name: "AD8232 / ECG Lead", desc: "Biopotential Cardiac Front-End", status: "Operational", sqi: "95%" },
    { name: "Capacitive Skin Contact", desc: "Wear & Proximity Detection", status: "Detected", sqi: "100%" },
    { name: "Real-Time Clock (RTC)", desc: "Synchronized to Mobile Clock", status: "Synced", sqi: "100%" }
  ];

  return (
    <div className="p-4 space-y-4 font-sans max-w-md mx-auto pt-fade-in relative">
      <div>
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest">
          Hardware Architecture
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">IndusBoard Coin</h2>
        <p className="text-xs text-slate-400">ESP32-based screenless smart health capsule</p>
      </div>

      {/* Hardware Profile Hero Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3EE8D3]/10 border border-[#1B6E64]/50 flex items-center justify-center text-[#3EE8D3]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">PulseBand Unit 01</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">IndusBoard Coin · BLE / WiFi Active</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <Battery className="w-3.5 h-3.5" />
            <span>85%</span>
          </div>
        </div>

        {/* Telemetry rows */}
        <div className="bg-[#141E32] rounded-xl p-3 divide-y divide-[#1F2D48] text-xs">
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-sky-400" /> Ingestion Endpoint
            </span>
            <span className="font-mono text-teal-300 font-medium">/api/sensor-data (Active)</span>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-emerald-400" /> Optical Sensor SQI
            </span>
            <span className="font-mono text-emerald-400 font-medium">96% · High Fidelity</span>
          </div>
          <div className="py-1.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" /> Firmware Build
            </span>
            <span className="font-mono text-slate-200">v1.2.0 (IndusBoard Core)</span>
          </div>
        </div>

        {/* Action buttons: Sync & Recalibrate */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="py-2 px-3 bg-[#162238] hover:bg-[#1F2D48] border border-[#22324D] text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3EE8D3]' : ''}`} />
            <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
          </button>
          <button
            onClick={handleRecalibrate}
            className="py-2 px-3 bg-[#162238] hover:bg-[#1F2D48] border border-[#22324D] text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Settings className="w-3.5 h-3.5 text-teal-300" />
            <span>Recalibrate</span>
          </button>
        </div>

        {/* Diagnostic Run Button */}
        <button
          onClick={handleRunTest}
          disabled={testing}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running Sensor Diagnostic Test…</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Automated Sensor Self-Test</span>
            </>
          )}
        </button>
      </div>

      {/* Live Detecting Sensor Hardware Ingestion Hub */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#3EE8D3]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Hardware Ingestion Bridge
            </h3>
          </div>
          <Chip tone="teal" className="text-[10px]">
            Packets: {packetCount}
          </Chip>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Test or connect your live physical hardware (ESP32/Arduino) currently under construction:
        </p>

        {/* Sliders for manual hardware simulation */}
        <div className="space-y-2 bg-[#141E32] p-3 rounded-xl">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Heart Rate:</span>
            <span className="font-mono text-rose-400 font-bold">{hwHr} BPM</span>
          </div>
          <input
            type="range"
            min="45"
            max="185"
            value={hwHr}
            onChange={(e) => setHwHr(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-400">Blood Oxygen (SpO2):</span>
            <span className="font-mono text-emerald-400 font-bold">{hwSpo2}%</span>
          </div>
          <input
            type="range"
            min="70"
            max="100"
            step="0.5"
            value={hwSpo2}
            onChange={(e) => setHwSpo2(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-400">Skin Temp:</span>
            <span className="font-mono text-amber-400 font-bold">{hwTemp}°C</span>
          </div>
          <input
            type="range"
            min="35.5"
            max="41.5"
            step="0.1"
            value={hwTemp}
            onChange={(e) => setHwTemp(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-400">Motion / Convulsion:</span>
            <span className="font-mono text-purple-400 font-bold">{hwMotion}g</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="4.5"
            step="0.05"
            value={hwMotion}
            onChange={(e) => setHwMotion(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <button
          onClick={handleTransmitHardwarePacket}
          className="w-full py-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 active:scale-98 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>🚀 Transmit Hardware Packet to Pipeline</span>
        </button>

        {/* Packet Log Feed */}
        <div className="bg-[#090D16] border border-[#1A263C] rounded-xl p-2.5 max-h-32 overflow-y-auto font-mono text-[10px] space-y-1">
          {packetLogs.map((log) => (
            <div key={log.id} className="text-slate-400">
              <span className="text-[#3EE8D3]">[{log.time}]</span> {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Firmware Code Toggle Card */}
      <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              ESP32 / Arduino Firmware
            </h3>
          </div>
          <button
            onClick={() => setShowFirmwareCode(!showFirmwareCode)}
            className="text-xs text-[#3EE8D3] hover:underline font-mono"
          >
            {showFirmwareCode ? "Hide Code" : "View Code"}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          C++ firmware ready to flash to your ESP32 + MAX30102 + NTC sensor.
        </p>
        {showFirmwareCode && (
          <pre className="bg-[#090D16] border border-[#1A263C] rounded-xl p-3 text-[10px] text-teal-300 font-mono overflow-x-auto max-h-48 pt-fade-in leading-relaxed">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_PASSWORD";
const char* server = "http://192.168.1.100:8000/api/sensor-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["heart_rate"] = 78.5;  // MAX30102 reading
    doc["spo2"] = 98.2;        // MAX30102 reading
    doc["temperature"] = 36.8; // NTC thermistor reading
    doc["motion_g"] = 0.05;    // MPU6050 reading

    String json;
    serializeJson(doc, json);
    http.POST(json);
    http.end();
  }
  delay(1000); // 1 Hz stream
}`}
          </pre>
        )}
      </div>

      {/* Hardware Sensor Fleet List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Hardware Sensor Fleet ({sensors.length})
        </span>
        {sensors.map((s, idx) => (
          <div
            key={idx}
            className="bg-[#0E1524] border border-[#22324D] rounded-xl p-3 flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-100">{s.name}</div>
              <div className="text-[10.5px] text-slate-400">{s.desc}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-400 block font-mono">● {s.status}</span>
              <span className="text-[10px] text-slate-400 font-mono">Quality: {s.sqi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#162238] border border-[#3EE8D3]/50 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 pt-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#3EE8D3]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};