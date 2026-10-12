from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.schemas.all_schemas import IngestionPacket
from backend.app.services.dsp_service import PPGSignalProcessor
from backend.app.ml.activity_classifier import ActivityClassifier
from backend.app.ml.fall_detection import FallDetectionEngine
from backend.app.ml.health_anomaly import HealthAnomalyDetector
from backend.app.ml.feature_engineering import extract_accelerometer_features
from backend.app.websocket.connection_manager import manager
from backend.app.models.all_models import (
    SensorReading, HeartRateRecord, TemperatureRecord, ActivityRecord, FallEvent, Notification, UserDevice
)
from sqlalchemy import select
from datetime import datetime
import math

ppg_processor = PPGSignalProcessor()
activity_model = ActivityClassifier()
fall_engine = FallDetectionEngine()
anomaly_detector = HealthAnomalyDetector()

# In-memory window buffers for continuous timeseries per device
device_buffers = {}

async def process_incoming_sensor_packet(packet: IngestionPacket, user_id: int, db: AsyncSession):
    dev_id = packet.device_id
    if dev_id not in device_buffers:
        device_buffers[dev_id] = {
            "ppg": [],
            "accel_x": [],
            "accel_y": [],
            "accel_z": [],
            "mag_series": []
        }

    buf = device_buffers[dev_id]
    buf["ppg"].append(packet.ppg_raw)
    buf["accel_x"].append(packet.accelerometer.x)
    buf["accel_y"].append(packet.accelerometer.y)
    buf["accel_z"].append(packet.accelerometer.z)
    
    # Calculate magnitude
    mag = math.sqrt(packet.accelerometer.x**2 + packet.accelerometer.y**2 + packet.accelerometer.z**2)
    buf["mag_series"].append(mag)

    # Maintain sliding window sizes
    for k in buf:
        if len(buf[k]) > 120:
            buf[k] = buf[k][-120:]

    # 1. DSP Heart Rate & SQI
    dsp_results = ppg_processor.calculate_metrics(buf["ppg"])
    bpm = dsp_results["bpm"]
    sqi = dsp_results["signal_quality"]

    # 2. ML Activity Classification
    features = extract_accelerometer_features(buf["accel_x"], buf["accel_y"], buf["accel_z"])
    activity_state, activity_conf = activity_model.predict(features)

    # 3. Fall Detection Assessment
    is_fall, fall_conf, impact_score = fall_engine.evaluate_motion_window(buf["mag_series"])

    # 4. Anomaly Check
    is_anomaly, anomaly_msg = anomaly_detector.evaluate_heart_rate(bpm, baseline_mean=72.0, baseline_std=7.0)

    # 5. Database Commit
    hr_rec = HeartRateRecord(user_id=user_id, device_id=dev_id, bpm=bpm, quality=dsp_results["quality_label"], timestamp=packet.timestamp)
    temp_rec = TemperatureRecord(user_id=user_id, device_id=dev_id, temperature=packet.temperature, timestamp=packet.timestamp)
    db.add_all([hr_rec, temp_rec])

    if is_fall:
        fall_rec = FallEvent(user_id=user_id, device_id=dev_id, impact_level=impact_score, confidence=fall_conf, timestamp=packet.timestamp)
        notif = Notification(user_id=user_id, type="FALL_ALERT", title="Possible Fall Detected", message="Sudden impact registered. Please confirm safety status.")
        db.add_all([fall_rec, notif])

    if is_anomaly:
        notif = Notification(user_id=user_id, type="ANOMALY", title="Heart Rate Insight", message=anomaly_msg)
        db.add(notif)

    # Update Device last sync & battery
    dev_query = select(UserDevice).where(UserDevice.device_id == dev_id)
    result = await db.execute(dev_query)
    dev_obj = result.scalar_one_or_none()
    if dev_obj:
        dev_obj.battery_level = packet.battery_level
        dev_obj.last_sync = packet.timestamp
        dev_obj.status = "CONNECTED"

    await db.commit()

    # 6. WebSocket Live Payload Broadcast
    payload = {
        "type": "health_update",
        "device_id": dev_id,
        "timestamp": packet.timestamp.isoformat(),
        "heart_rate": bpm,
        "signal_quality": sqi,
        "quality_label": dsp_results["quality_label"],
        "filtered_waveform": dsp_results["filtered_signal"],
        "temperature": packet.temperature,
        "activity": activity_state,
        "activity_confidence": activity_conf,
        "motion_magnitude": round(mag, 2),
        "is_fall_detected": is_fall,
        "battery_level": packet.battery_level,
        "wear_status": packet.proximity_wear,
        "source": packet.source
    }
    await manager.broadcast_to_user(user_id, payload)
    await manager.broadcast_to_device(dev_id, payload)
    return payload
