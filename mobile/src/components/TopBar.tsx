import React from 'react';
import { Bluetooth, Battery, Wifi, WifiOff, HeartPulse, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Chip } from './Chip';

interface TopBarProps {
  now: Date;
  connected: boolean;
  battery: number;
  isSimulated: boolean;
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  now,
  connected,
  battery,
  isSimulated,
  onOpenProfile
}) => {
  const { user } = useAuth();

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="sticky top-0 z-30 bg-[#080B12]/95 backdrop-blur-md border-b border-[#1A263C]">
      {/* Hardware Telemetry Strip */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] text-slate-400 font-mono border-b border-slate-900/60">
        <span>{formattedTime}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <Bluetooth className="w-3 h-3 text-sky-400" />
            <span className="text-[10px]">IndusCoin</span>
          </span>
          <span className="flex items-center gap-1">
            <Battery className={`w-3.5 h-3.5 ${battery < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>{battery}%</span>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3EE8D3]/10 border border-[#1B6E64]/60 flex items-center justify-center text-[#3EE8D3] shadow-sm">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">PulseBand</h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">v1.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">IndusBoard Coin · Health AI</p>
          </div>
        </div>

        {/* Status Chip & Profile Avatar */}
        <div className="flex items-center gap-2">
          {isSimulated ? (
            <Chip tone="amber" className="text-[10.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-0.5" />
              SIMULATION
            </Chip>
          ) : connected ? (
            <Chip icon={Wifi} tone="teal" className="text-[10.5px]">
              BLE LINKED
            </Chip>
          ) : (
            <Chip icon={WifiOff} tone="red" className="text-[10.5px]">
              OFFLINE
            </Chip>
          )}

          <button
            onClick={onOpenProfile}
            title="User Profile & Account"
            className="w-8 h-8 rounded-xl bg-[#162238] hover:bg-[#1F2D48] border border-[#22324D] text-slate-200 flex items-center justify-center transition active:scale-95 text-xs font-bold font-mono"
          >
            {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};