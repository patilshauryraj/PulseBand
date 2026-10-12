import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div
      className={`rounded-xl border flex items-start gap-2.5 ${
        compact ? 'p-2.5 text-[11px]' : 'p-3.5 text-xs'
      } bg-[#F5AC3C]/5 border-[#F5AC3C]/25 text-slate-300 leading-relaxed`}
    >
      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <strong className="text-amber-300 font-semibold">Research prototype, not a diagnostic medical device.</strong>{' '}
        Readings and ML flags indicate potential physiological patterns for wellness monitoring and require qualified clinical assessment.
      </div>
    </div>
  );
};