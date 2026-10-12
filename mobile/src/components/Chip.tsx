import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ChipProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  tone?: 'neutral' | 'teal' | 'amber' | 'red' | 'emerald';
  className?: string;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ icon: Icon, children, tone = 'neutral', className = '', onClick }) => {
  const toneClasses = {
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/70',
    teal: 'bg-[#3EE8D3]/10 text-[#7CF0DF] border-[#1B6E64]/50',
    amber: 'bg-[#F5AC3C]/10 text-[#FFCE85] border-[#F5AC3C]/40',
    red: 'bg-[#F0555A]/10 text-[#FF9A9D] border-[#F0555A]/40',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${toneClasses[tone]} ${className} ${onClick ? 'cursor-pointer active:scale-95 transition' : ''}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};