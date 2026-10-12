import React, { useMemo } from 'react';

interface LiveWaveformProps {
  bpm: number;
  alert?: boolean;
  color?: string;
  height?: number;
}

function generatePPGPoints(cycles: number, samplesPerCycle: number, width: number, height: number): string {
  const pts: string[] = [];
  const total = cycles * samplesPerCycle;
  const gaussian = (u: number, mu: number, sigma: number) => Math.exp(-((u - mu) ** 2) / (2 * sigma * sigma));

  for (let i = 0; i <= total; i++) {
    const u = (i % samplesPerCycle) / samplesPerCycle;
    let v =
      0.88 * gaussian(u, 0.14, 0.042) -
      0.16 * gaussian(u, 0.315, 0.02) +
      0.28 * gaussian(u, 0.4, 0.055);
    v = Math.max(v, -0.03);
    const x = (i / total) * width;
    const y = height - (v * height * 0.82 + height * 0.1);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  bpm,
  alert = false,
  color,
  height = 88
}) => {
  const width = 800;
  const points = useMemo(() => generatePPGPoints(8, 48, width, height), [height]);

  // Adjust scroll duration based on heart rate: faster pulse -> faster scroll
  const safeBpm = Math.max(40, Math.min(180, bpm));
  const duration = Math.max(2.4, Math.min(12, 8.5 * (72 / safeBpm)));
  const strokeColor = color || (alert ? '#F5AC3C' : '#3EE8D3');

  const duplicatedPoints = useMemo(() => {
    return `${points} ${points
      .split(" ")
      .map((pt) => {
        const [x, y] = pt.split(",");
        return `${(parseFloat(x) + width).toFixed(1)},${y}`;
      })
      .join(" ")}`;
  }, [points]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-[#060910] border border-[#162238]"
      style={{ height }}
    >
      {/* Background grid lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #232F45 1px, transparent 1px), linear-gradient(to bottom, #232F45 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      <svg
        width="200%"
        height={height}
        viewBox={`0 0 ${width * 2} ${height}`}
        preserveAspectRatio="none"
        className="block"
        style={{ animation: `ptScroll ${duration}s linear infinite` }}
      >
        <polyline
          points={duplicatedPoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}70)` }}
        />
      </svg>

      {/* Edge vignetting masks */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #060910 0%, transparent 8%, transparent 92%, #060910 100%)'
        }}
      />

      {/* Bottom live indicator tag */}
      <div className="absolute bottom-1.5 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-slate-800/60 text-[9.5px] font-mono text-slate-400">
        <span className={`w-1.5 h-1.5 rounded-full ${alert ? 'bg-amber-400 animate-ping' : 'bg-teal-400'}`} />
        <span>50Hz Optical PPG</span>
      </div>
    </div>
  );
};