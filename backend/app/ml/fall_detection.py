from typing import List, Tuple
import math

class FallDetectionEngine:
    """
    Hybrid Fall Detection:
    1. Impact Peak Acceleration Threshold (> 2.8G vector magnitude)
    2. Post-Impact Immobility / Stillness Window (< 0.18G standard deviation)
    """
    def __init__(self, impact_threshold_g: float = 2.8, stillness_threshold_g: float = 0.18):
        self.impact_threshold = impact_threshold_g
        self.stillness_threshold = stillness_threshold_g

    def evaluate_motion_window(self, magnitude_series: List[float]) -> Tuple[bool, float, float]:
        if len(magnitude_series) < 20:
            return False, 0.0, 1.0

        max_impact = max(magnitude_series)
        impact_idx = magnitude_series.index(max_impact)

        # Check for sudden impact
        if max_impact >= self.impact_threshold:
            # Check post-impact period for stillness
            post_impact = magnitude_series[impact_idx + 1: impact_idx + 25]
            if len(post_impact) >= 5:
                mean_post = sum(post_impact) / len(post_impact)
                var_post = sum((x - mean_post) ** 2 for x in post_impact) / len(post_impact)
                std_post = math.sqrt(var_post)

                if std_post <= self.stillness_threshold:
                    confidence = min(0.96, 0.65 + (max_impact / 10.0))
                    return True, round(confidence * 100, 1), round(max_impact, 2)

        return False, 0.0, round(max_impact, 2)
