export const T = {
  bg: "#080B12",
  bgOuter: "#04060A",
  surface: "#0E1524",
  surface2: "#162035",
  surface3: "#1F2D48",
  line: "#22324D",
  lineSoft: "#172338",
  teal: "#3EE8D3",
  tealDim: "#1B6E64",
  tealText: "#7CF0DF",
  amber: "#F5AC3C",
  amberText: "#FFCE85",
  red: "#F0555A",
  redText: "#FF9A9D",
  emerald: "#10B981",
  emeraldText: "#6EE7B7",
  textHi: "#EEF2F9",
  textLo: "#94A3B8",
  textFaint: "#64748B",
};

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function fmtClock(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const QUALITY_LABEL = (q: number) => (q >= 90 ? "Excellent" : q >= 75 ? "Good" : q >= 55 ? "Fair" : "Poor");
export const QUALITY_COLOR = (q: number) => (q >= 90 ? T.teal : q >= 75 ? T.tealText : q >= 55 ? T.amber : T.red);