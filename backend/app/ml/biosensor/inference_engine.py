"""
Real-Time Inference Engine for Biosensor Pipeline.
Loads serialized models and provides deterministic sub-millisecond predictions
for incoming live hardware sensor packets (ESP32 / Arduino / RPi).
"""

import json
import os
import math
import numpy as np

class BiosensorInferenceEngine:
    def __init__(self, weights_path="ml/model_weights.json"):
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model weights file not found: {weights_path}")

        with open(weights_path, "r", encoding="utf-8") as f:
            self.model_data = json.load(f)

        self.feature_names = self.model_data["metadata"]["feature_names"]
        self.class_names = self.model_data["metadata"]["class_names"]
        self.mean = np.array(self.model_data["scaler"]["mean"])
        self.scale = np.array(self.model_data["scaler"]["scale"])

        # Softmax weights
        self.W = np.array(self.model_data["softmax_weights"]["W"])
        self.b = np.array(self.model_data["softmax_weights"]["b"])

        # Anomaly parameters
        self.anomaly_mean = np.array(self.model_data["anomaly_detector"]["mean"])
        self.anomaly_var = np.array(self.model_data["anomaly_detector"]["var"])
        self.anomaly_thresh = float(self.model_data["anomaly_detector"]["threshold"])

        # Random Forest trees
        self.trees = self.model_data["random_forest"]["trees"]
        self.n_classes = len(self.class_names)

    def _traverse_tree(self, node, x):
        if "value" in node:
            return np.array(node["value"])
        feat = node["feature"]
        thresh = node["threshold"]
        if x[feat] <= thresh:
            return self._traverse_tree(node["left"], x)
        else:
            return self._traverse_tree(node["right"], x)

    def _rf_predict_proba(self, x_scaled):
        probs = np.zeros(self.n_classes)
        for tree_root in self.trees:
            probs += self._traverse_tree(tree_root, x_scaled)
        return probs / len(self.trees)

    def _impute_sensor_defaults(self, raw_data):
        """Intelligently autofill unmeasured biosensor features from core vitals if missing"""
        hr = float(raw_data.get("heart_rate", raw_data.get("heart_beat", 75.0)))
        spo2 = float(raw_data.get("spo2", raw_data.get("o2", 98.0)))
        temp = float(raw_data.get("temperature", raw_data.get("temp", 36.8)))

        # Default or derived HRV RMSSD (ms)
        hrv = raw_data.get("hrv_rmssd", raw_data.get("hrv", None))
        if hrv is None:
            # Baseline physiological inverse relation with HR
            hrv = max(10.0, min(80.0, 100.0 - (hr * 0.6)))
        else:
            hrv = float(hrv)

        # Default Perfusion Index (%)
        pi = raw_data.get("perfusion_index", raw_data.get("pi", None))
        if pi is None:
            pi = 3.0 if spo2 > 95 else 0.8
        else:
            pi = float(pi)

        # Default Blood Pressure estimate
        sbp = raw_data.get("systolic_bp", raw_data.get("sbp", None))
        dbp = raw_data.get("diastolic_bp", raw_data.get("dbp", None))
        if sbp is None or dbp is None:
            sbp = round(115.0 + max(0.0, (hr - 75.0) * 0.4), 1)
            dbp = round(75.0 + max(0.0, (hr - 75.0) * 0.2), 1)
        else:
            sbp = float(sbp)
            dbp = float(dbp)

        # Motion intensity (g)
        motion = float(raw_data.get("motion_g", raw_data.get("motion", 0.05)))

        return {
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": temp,
            "hrv_rmssd": hrv,
            "perfusion_index": pi,
            "systolic_bp": sbp,
            "diastolic_bp": dbp,
            "motion_g": motion
        }

    def predict(self, raw_sensor_dict):
        clean_input = self._impute_sensor_defaults(raw_sensor_dict)

        # Construct feature vector
        x_vec = np.array([clean_input[f] for f in self.feature_names], dtype=float)

        # Scale features
        x_scaled = (x_vec - self.mean) / self.scale

        # Random Forest Inference
        rf_probs = self._rf_predict_proba(x_scaled)
        pred_idx = int(np.argmax(rf_probs))
        pred_class = self.class_names[pred_idx]
        confidence = float(rf_probs[pred_idx])

        # Anomaly Score
        log_prob = -0.5 * np.sum(np.log(2 * np.pi * self.anomaly_var) + ((x_scaled - self.anomaly_mean) ** 2) / self.anomaly_var)
        is_anomaly = bool(log_prob < self.anomaly_thresh)

        # Clinical Severity & Actionable Conclusion
        severity_map = {
            "NORMAL": "NORMAL",
            "TACHYCARDIA_STRESS": "WARNING",
            "HYPOXIA_RESPIRATORY_DISTRESS": "CRITICAL",
            "FEBRILE_HYPERTHERMIA": "WARNING",
            "EPILEPTIC_SEIZURE_SURGE": "EMERGENCY"
        }

        recommendations = {
            "NORMAL": "Vitals within optimal physiological homeostasis. Continuous background monitoring active.",
            "TACHYCARDIA_STRESS": "Cardiac rate elevated. Check patient activity level, hydration, anxiety, or supraventricular arrhythmia.",
            "HYPOXIA_RESPIRATORY_DISTRESS": "CRITICAL: Oxygen saturation compromised. Verify airway patency, supplemental O2, and sensor contact.",
            "FEBRILE_HYPERTHERMIA": "Elevated core body temperature detected. Initiate cooling protocol and assess for infectious etiology.",
            "EPILEPTIC_SEIZURE_SURGE": "EMERGENCY: Autonomic surge with violent motor motion and hypoxia detected. Potential ictal seizure in progress. Alert caregivers!"
        }

        # Calculate a composite health risk score (0 to 100)
        risk_score = 10.0
        if pred_class == "TACHYCARDIA_STRESS":
            risk_score = 45.0 + min(35.0, (clean_input["heart_rate"] - 100) * 0.5)
        elif pred_class == "FEBRILE_HYPERTHERMIA":
            risk_score = 50.0 + min(35.0, (clean_input["temperature"] - 37.5) * 15.0)
        elif pred_class == "HYPOXIA_RESPIRATORY_DISTRESS":
            risk_score = 75.0 + min(24.0, (90.0 - clean_input["spo2"]) * 2.0)
        elif pred_class == "EPILEPTIC_SEIZURE_SURGE":
            risk_score = 96.0 + min(4.0, clean_input["motion_g"] * 0.5)

        return {
            "processed_vitals": clean_input,
            "prediction": {
                "condition": pred_class,
                "confidence": round(confidence * 100, 1),
                "severity": severity_map.get(pred_class, "NORMAL"),
                "risk_score": round(float(np.clip(risk_score, 0.0, 100.0)), 1),
                "is_anomaly": is_anomaly,
                "anomaly_score": round(float(log_prob), 2),
                "class_probabilities": {
                    self.class_names[i]: round(float(rf_probs[i]) * 100, 1)
                    for i in range(self.n_classes)
                },
                "conclusion": recommendations.get(pred_class, "Monitor patient vital signs.")
            }
        }

# Quick test helper
if __name__ == "__main__":
    engine = BiosensorInferenceEngine()
    test_normal = {"heart_rate": 72, "spo2": 98.5, "temperature": 36.7}
    print("Test Normal:", engine.predict(test_normal)["prediction"])

    test_seizure = {"heart_rate": 155, "spo2": 82.0, "temperature": 38.0, "motion_g": 3.2}
    print("Test Seizure:", engine.predict(test_seizure)["prediction"])
