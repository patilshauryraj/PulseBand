export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  resting_hr_bpm: number;
  max_hr_bpm: number;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
    auto_notify: boolean;
  };
  auth_provider?: "email" | "google";
}

export type ActivityState = "RESTING" | "STATIONARY" | "WALKING" | "RUNNING" | "ACTIVE";

export type ClinicalCondition =
  | "NORMAL"
  | "TACHYCARDIA_STRESS"
  | "HYPOXIA_RESPIRATORY_DISTRESS"
  | "FEBRILE_HYPERTHERMIA"
  | "EPILEPTIC_SEIZURE_SURGE";

export interface AnomalyType {
  label: string;
  detail: string;
  severity: "low" | "medium" | "high" | "emergency";
}

export interface AnomalyEvent {
  id: string;
  type: AnomalyType;
  time: Date;
  bpm: number;
  spo2?: number;
  temp?: number;
  confidence: number;
  quality: number;
  reviewed?: boolean;
}

export interface MultiVitalReading {
  bpm: number;
  spo2: number;
  temp: number;
  hrv: number;
  perfusionIndex: number;
  motion_g: number;
  activity: ActivityState;
  condition: ClinicalCondition;
  confidence: number;
  riskScore: number;
  isAnomaly: boolean;
  conclusion: string;
  battery: number;
  quality: number;
  waveformSlice: number[];
}

export interface TrendPoint {
  i: number;
  bpm: number;
  spo2: number;
  temp: number;
  hrv: number;
  motion_g: number;
  riskScore: number;
  isAnomaly: boolean;
  condition: ClinicalCondition;
  quality: number;
  time?: Date;
  label?: string;
}

export type TimeRangeKey = "1H" | "6H" | "24H" | "7D";
export type MetricType = "bpm" | "spo2" | "temp" | "motion";