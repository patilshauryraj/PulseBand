import math
from typing import List, Dict

def extract_accelerometer_features(x: List[float], y: List[float], z: List[float]) -> Dict[str, float]:
    n = len(x)
    if n == 0:
        return {
            "mean_x": 0.0, "mean_y": 0.0, "mean_z": 1.0,
            "std_x": 0.0, "std_y": 0.0, "std_z": 0.0,
            "magnitude_mean": 1.0, "magnitude_std": 0.0,
            "magnitude_max": 1.0, "magnitude_min": 1.0,
            "signal_energy": 1.0, "variance": 0.0,
            "zero_crossings": 0
        }

    mean_x = sum(x) / n
    mean_y = sum(y) / n
    mean_z = sum(z) / n

    std_x = math.sqrt(sum((val - mean_x) ** 2 for val in x) / n)
    std_y = math.sqrt(sum((val - mean_y) ** 2 for val in y) / n)
    std_z = math.sqrt(sum((val - mean_z) ** 2 for val in z) / n)

    magnitudes = [math.sqrt(x[i]**2 + y[i]**2 + z[i]**2) for i in range(n)]
    mag_mean = sum(magnitudes) / n
    mag_variance = sum((m - mag_mean) ** 2 for m in magnitudes) / n
    mag_std = math.sqrt(mag_variance)
    mag_max = max(magnitudes)
    mag_min = min(magnitudes)
    energy = sum(m**2 for m in magnitudes) / n

    # Zero crossings of mean-centered magnitude
    centered = [m - mag_mean for m in magnitudes]
    zc = sum(1 for i in range(1, n) if (centered[i] * centered[i-1]) < 0)

    return {
        "mean_x": round(mean_x, 4),
        "mean_y": round(mean_y, 4),
        "mean_z": round(mean_z, 4),
        "std_x": round(std_x, 4),
        "std_y": round(std_y, 4),
        "std_z": round(std_z, 4),
        "magnitude_mean": round(mag_mean, 4),
        "magnitude_std": round(mag_std, 4),
        "magnitude_max": round(mag_max, 4),
        "magnitude_min": round(mag_min, 4),
        "signal_energy": round(energy, 4),
        "variance": round(mag_variance, 4),
        "zero_crossings": zc
    }
