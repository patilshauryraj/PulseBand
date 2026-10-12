import { ActivityState, ClinicalCondition, MultiVitalReading } from '../types';

export class SensorSimulationEngine {
  private currentActivity: ActivityState = "WALKING";
  private currentBpm: number = 74;
  private currentSpo2: number = 98.2;
  private currentTemp: number = 36.8;
  private currentHrv: number = 48;
  private currentPi: number = 3.2;
  private currentMotion: number = 0.05;
  private currentCondition: ClinicalCondition = "NORMAL";
  private currentConfidence: number = 98;
  private currentRisk: number = 10;
  private batteryPct: number = 84;
  private phase: number = 0;
  private forcedCondition: ClinicalCondition | null = null;
  private forcedCounter: number = 0;

  // External live hardware packet override
  private liveHardwareReading: MultiVitalReading | null = null;

  setActivity(activity: ActivityState) {
    this.currentActivity = activity;
  }

  getActivity(): ActivityState {
    return this.currentActivity;
  }

  injectCondition(condition: ClinicalCondition, durationTicks: number = 15) {
    this.forcedCondition = condition;
    this.forcedCounter = durationTicks;
  }

  injectLiveHardwarePacket(packet: Partial<MultiVitalReading>) {
    const bpm = packet.bpm ?? 75;
    const spo2 = packet.spo2 ?? 98.0;
    const temp = packet.temp ?? 36.8;
    const motion = packet.motion_g ?? 0.05;

    let cond: ClinicalCondition = "NORMAL";
    let conclusion = "Vitals within optimal physiological homeostasis.";
    let risk = 10;
    let isAnom = false;

    if (motion > 2.0 && bpm > 135) {
      cond = "EPILEPTIC_SEIZURE_SURGE";
      conclusion = "EMERGENCY: Autonomic surge with violent motor convulsion and hypoxia detected. Caregivers alerted!";
      risk = 98;
      isAnom = true;
    } else if (spo2 < 89) {
      cond = "HYPOXIA_RESPIRATORY_DISTRESS";
      conclusion = "CRITICAL: Oxygen saturation compromised (SpO2 < 89%). Verify airway patency.";
      risk = 82;
      isAnom = true;
    } else if (temp > 38.3) {
      cond = "FEBRILE_HYPERTHERMIA";
      conclusion = "WARNING: Core body hyperthermia detected (>38.3°C). Initiate fever protocol.";
      risk = 65;
      isAnom = true;
    } else if (bpm > 115) {
      cond = "TACHYCARDIA_STRESS";
      conclusion = "WARNING: Cardiac rate elevated outside resting corridor.";
      risk = 55;
      isAnom = true;
    }

    this.liveHardwareReading = {
      bpm,
      spo2,
      temp,
      hrv: packet.hrv ?? 45,
      perfusionIndex: packet.perfusionIndex ?? 2.8,
      motion_g: motion,
      activity: motion > 0.8 ? "RUNNING" : motion > 0.2 ? "WALKING" : "RESTING",
      condition: cond,
      confidence: 96,
      riskScore: risk,
      isAnomaly: isAnom,
      conclusion,
      battery: this.batteryPct,
      quality: 95,
      waveformSlice: this.generateWaveform(bpm)
    };
  }

  clearLiveHardware() {
    this.liveHardwareReading = null;
  }

  private generateWaveform(bpm: number): number[] {
    this.phase += (bpm / 60) * 0.4;
    const waveformSlice: number[] = [];
    for (let i = 0; i < 40; i++) {
      const t = this.phase + (i * 0.15);
      const cardiac = Math.sin(t) * 12 + Math.sin(2 * t) * 6 + (Math.random() - 0.5) * 2;
      waveformSlice.push(cardiac);
    }
    return waveformSlice;
  }

  // Generates next realistic telemetry packet
  step(): MultiVitalReading {
    if (this.liveHardwareReading) {
      return this.liveHardwareReading;
    }

    if (this.forcedCounter > 0) {
      this.forcedCounter--;
      if (this.forcedCounter === 0) {
        this.forcedCondition = null;
      }
    }

    const activeCond = this.forcedCondition || "NORMAL";

    if (activeCond === "EPILEPTIC_SEIZURE_SURGE") {
      this.currentBpm = Math.round(152 + (Math.random() - 0.5) * 8);
      this.currentSpo2 = Math.round((82.5 + (Math.random() - 0.5) * 2.0) * 10) / 10;
      this.currentTemp = Math.round((38.1 + (Math.random() - 0.5) * 0.3) * 10) / 10;
      this.currentHrv = Math.round(8 + (Math.random() - 0.5) * 2);
      this.currentPi = 0.4;
      this.currentMotion = Math.round((3.2 + (Math.random() - 0.5) * 0.8) * 100) / 100;
      this.currentCondition = "EPILEPTIC_SEIZURE_SURGE";
      this.currentConfidence = 99;
      this.currentRisk = 97;
    } else if (activeCond === "HYPOXIA_RESPIRATORY_DISTRESS") {
      this.currentBpm = Math.round(108 + (Math.random() - 0.5) * 6);
      this.currentSpo2 = Math.round((82.8 + (Math.random() - 0.5) * 2.2) * 10) / 10;
      this.currentTemp = 36.6;
      this.currentHrv = Math.round(22 + (Math.random() - 0.5) * 4);
      this.currentPi = 0.8;
      this.currentMotion = 0.05;
      this.currentCondition = "HYPOXIA_RESPIRATORY_DISTRESS";
      this.currentConfidence = 97;
      this.currentRisk = 84;
    } else if (activeCond === "TACHYCARDIA_STRESS") {
      this.currentBpm = Math.round(136 + (Math.random() - 0.5) * 10);
      this.currentSpo2 = Math.round((96.2 + (Math.random() - 0.5) * 1.0) * 10) / 10;
      this.currentTemp = 37.2;
      this.currentHrv = Math.round(16 + (Math.random() - 0.5) * 3);
      this.currentPi = 1.8;
      this.currentMotion = 0.45;
      this.currentCondition = "TACHYCARDIA_STRESS";
      this.currentConfidence = 95;
      this.currentRisk = 58;
    } else if (activeCond === "FEBRILE_HYPERTHERMIA") {
      this.currentBpm = Math.round(116 + (Math.random() - 0.5) * 6);
      this.currentSpo2 = Math.round((95.0 + (Math.random() - 0.5) * 1.2) * 10) / 10;
      this.currentTemp = Math.round((39.2 + (Math.random() - 0.5) * 0.3) * 10) / 10;
      this.currentHrv = Math.round(25 + (Math.random() - 0.5) * 3);
      this.currentPi = 2.0;
      this.currentMotion = 0.04;
      this.currentCondition = "FEBRILE_HYPERTHERMIA";
      this.currentConfidence = 96;
      this.currentRisk = 68;
    } else {
      // Normal homeostasis drift
      const targetBpm = this.currentActivity === "RUNNING" ? 135 : this.currentActivity === "WALKING" ? 90 : 72;
      this.currentBpm += (targetBpm - this.currentBpm) * 0.12 + (Math.random() - 0.5) * 2;
      this.currentBpm = Math.round(Math.max(58, Math.min(105, this.currentBpm)));

      this.currentSpo2 += (98.4 - this.currentSpo2) * 0.1 + (Math.random() - 0.5) * 0.3;
      this.currentSpo2 = Math.round(Math.max(96.0, Math.min(99.6, this.currentSpo2)) * 10) / 10;

      this.currentTemp += (36.8 - this.currentTemp) * 0.05 + (Math.random() - 0.5) * 0.03;
      this.currentTemp = Math.round(Math.max(36.4, Math.min(37.2, this.currentTemp)) * 10) / 10;

      this.currentHrv = Math.round(50 + (Math.random() - 0.5) * 6);
      this.currentPi = 3.2;
      this.currentMotion = this.currentActivity === "RUNNING" ? 0.75 : this.currentActivity === "WALKING" ? 0.18 : 0.04;
      this.currentCondition = "NORMAL";
      this.currentConfidence = 99;
      this.currentRisk = 12;
    }

    const conclusions: Record<ClinicalCondition, string> = {
      NORMAL: "Vitals within optimal physiological homeostasis. Background ML monitoring active.",
      TACHYCARDIA_STRESS: "Atypical tachycardia spike detected. Pulse elevation exceeds resting corridor.",
      HYPOXIA_RESPIRATORY_DISTRESS: "CRITICAL: Oxygen saturation compromised (SpO2 < 88%). Verify airway patency.",
      FEBRILE_HYPERTHERMIA: "WARNING: Elevated core body temperature detected (>38.5°C). Initiate fever protocol.",
      EPILEPTIC_SEIZURE_SURGE: "EMERGENCY: Autonomic surge with violent motor convulsion and hypoxia detected. Potential seizure in progress. Caregivers alerted!"
    };

    const isAnomaly = this.currentCondition !== "NORMAL";
    const quality = Math.max(78, Math.min(99, Math.round(92 + (Math.random() - 0.4) * 8)));

    return {
      bpm: this.currentBpm,
      spo2: this.currentSpo2,
      temp: this.currentTemp,
      hrv: this.currentHrv,
      perfusionIndex: this.currentPi,
      motion_g: this.currentMotion,
      activity: this.currentActivity,
      condition: this.currentCondition,
      confidence: this.currentConfidence,
      riskScore: this.currentRisk,
      isAnomaly,
      conclusion: conclusions[this.currentCondition],
      battery: this.batteryPct,
      quality,
      waveformSlice: this.generateWaveform(this.currentBpm)
    };
  }
}

export const simulator = new SensorSimulationEngine();
