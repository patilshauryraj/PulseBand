from typing import Tuple

class HealthAnomalyDetector:
    """
    Personalized statistical baseline anomaly detector.
    Evaluates rolling deviations against 7-day user mean and standard deviation.
    """
    def __init__(self, z_score_threshold: float = 2.4):
        self.threshold = z_score_threshold

    def evaluate_heart_rate(self, current_hr: float, baseline_mean: float = 72.0, baseline_std: float = 7.0) -> Tuple[bool, str]:
        if baseline_std < 1.0:
            baseline_std = 6.0
        
        z_score = (current_hr - baseline_mean) / baseline_std

        if z_score > self.threshold:
            return True, f"Heart rate ({int(current_hr)} BPM) is elevated compared to your recent baseline ({int(baseline_mean)} BPM)."
        elif z_score < -self.threshold:
            return True, f"Heart rate ({int(current_hr)} BPM) is lower than your recent baseline."
        
        return False, "Heart rate is within your normal range."

    def evaluate_temperature(self, current_temp: float, baseline_temp: float = 36.5) -> Tuple[bool, str]:
        diff = current_temp - baseline_temp
        if diff > 1.2:
            return True, f"Skin temperature ({current_temp:.1f}°C) is warmer than your typical baseline."
        return False, "Temperature is within your normal baseline."
