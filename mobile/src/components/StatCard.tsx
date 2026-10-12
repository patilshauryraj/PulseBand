import React from 'react';
import { MoveUpRight, MoveDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  subTone?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  sub,
  subTone = 'neutral',
  className = ''
}) => {
  const toneColor =
    subTone === 'up'
      ? 'text-amber-400'
      : subTone === 'down'
      ? 'text-teal-300'
      : 'text-slate-400';

  return (
    <div className={`bg-[#0E1524] border border-[#22324D] rounded-xl p-3 flex-1 min-w-0 shadow-sm ${className}`}>
      <div className="text-[10.5px] text-slate-400 font-semibold tracking-wider uppercase truncate">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-bold text-slate-100">{value}</span>
        {unit && <span className="text-[11px] text-slate-400 font-medium">{unit}</span>}
      </div>
      {sub && (
        <div className={`mt-1 text-[11px] flex items-center gap-1 font-medium ${toneColor}`}>
          {subTone === 'up' && <MoveUpRight className="w-3 h-3" />}
          {subTone === 'down' && <MoveDownRight className="w-3 h-3" />}
          <span className="truncate">{sub}</span>
        </div>
      )}
    </div>
  );
};