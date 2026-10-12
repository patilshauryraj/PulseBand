"""
Biosensor Hardware Ingestion Router for PulseBand.
Accepts live telemetry from ESP32, Arduino, and mobile simulation.
Runs through the multi-class Random Forest + Anomaly Detection model.
"""

import asyncio
import csv
import json
import os
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
weights_file = os.path.join(PROJECT_ROOT, "app", "ml", "biosensor", "model_weights.json")
dataset_file = os.path.join(PROJECT_ROOT, "data", "biosensor_vital_signs_dataset.csv")

# Initialize ML inference engine
from backend.app.ml.biosensor.inference_engine import BiosensorInferenceEngine
engine = BiosensorInferenceEngine(weights_path=weights_file)

# Load dataset records
dataset_records = []
if os.path.exists(dataset_file):
    with open(dataset_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        dataset_records = list(reader)

# Global State for Hardware Ingestion
hardware_state = {
    "mode": "SIMULATION",  # "SIMULATION" or "LIVE_HARDWARE"
    "simulation_speed_sec": 1.2,
    "current_dataset_index": 0,
    "recent_history": [],  # Max 60 points
    "total_hardware_packets_received": 0,
    "last_packet_source": "INITIALIZATION",
    "latest_record": None
}

class SensorDataPacket(BaseModel):
    heart_rate: Optional[float] = None
    heart_beat: Optional[float] = None
    spo2: Optional[float] = None
    o2: Optional[float] = None
    temperature: Optional[float] = None
    temp: Optional[float] = None
    hrv_rmssd: Optional[float] = None
    hrv: Optional[float] = None
    perfusion_index: Optional[float] = None
    pi: Optional[float] = None
    motion_g: Optional[float] = None
    device_id: Optional[str] = "PULSEBAND_ESP32_01"

def process_and_record_reading(raw_dict: Dict[str, Any], source: str = "HARDWARE"):
    timestamp = time.strftime("%H:%M:%S")
    inference_result = engine.predict(raw_dict)

    record = {
        "timestamp": timestamp,
        "unix_time": time.time(),
        "source": source,
        "vitals": inference_result["processed_vitals"],
        "prediction": inference_result["prediction"]
    }

    hardware_state["recent_history"].append(record)
    if len(hardware_state["recent_history"]) > 60:
        hardware_state["recent_history"].pop(0)

    hardware_state["last_packet_source"] = source
    hardware_state["latest_record"] = record
    if source == "LIVE_HARDWARE":
        hardware_state["total_hardware_packets_received"] += 1

    return record

# Seed initial history with dataset records
if dataset_records:
    for i in range(min(15, len(dataset_records))):
        process_and_record_reading(dataset_records[i], source="DATASET_HISTORY")

@router.get("/status")
async def get_hardware_pipeline_status():
    latest = hardware_state["latest_record"]
    return {
        "status": "OPERATIONAL",
        "mode": hardware_state["mode"],
        "total_dataset_samples": len(dataset_records),
        "total_hardware_packets_received": hardware_state["total_hardware_packets_received"],
        "last_packet_source": hardware_state["last_packet_source"],
        "latest_vitals": latest["vitals"] if latest else None,
        "latest_prediction": latest["prediction"] if latest else None,
        "history_buffer_length": len(hardware_state["recent_history"])
    }

@router.post("/sensor-data")
@router.post("/ingest")
async def ingest_sensor_data(packet: SensorDataPacket):
    """Primary endpoint for live ESP32/Arduino hardware sensor telemetry"""
    raw_dict = packet.model_dump(exclude_unset=True)
    record = process_and_record_reading(raw_dict, source="LIVE_HARDWARE")
    return {
        "status": "PROCESSED",
        "message": "Hardware biometrics classified by Random Forest model",
        "record": record
    }

@router.post("/predict")
async def predict_custom_vitals(packet: SensorDataPacket):
    raw_dict = packet.model_dump(exclude_unset=True)
    return engine.predict(raw_dict)

@router.post("/simulation/mode")
async def set_hardware_mode(payload: Dict[str, Any]):
    new_mode = payload.get("mode", "SIMULATION")
    if new_mode in ["SIMULATION", "LIVE_HARDWARE"]:
        hardware_state["mode"] = new_mode
    return {"mode": hardware_state["mode"]}

@router.post("/simulation/inject")
async def inject_hardware_event(payload: Dict[str, Any]):
    condition = payload.get("condition", "NORMAL")
    event_profiles = {
        "NORMAL": {"heart_rate": 74.0, "spo2": 98.4, "temperature": 36.8, "motion_g": 0.05, "hrv_rmssd": 55.0},
        "TACHYCARDIA_STRESS": {"heart_rate": 138.0, "spo2": 96.2, "temperature": 37.3, "motion_g": 0.45, "hrv_rmssd": 16.0},
        "HYPOXIA_RESPIRATORY_DISTRESS": {"heart_rate": 112.0, "spo2": 82.5, "temperature": 36.6, "motion_g": 0.08, "hrv_rmssd": 22.0},
        "FEBRILE_HYPERTHERMIA": {"heart_rate": 118.0, "spo2": 94.8, "temperature": 39.4, "motion_g": 0.04, "hrv_rmssd": 24.0},
        "EPILEPTIC_SEIZURE_SURGE": {"heart_rate": 158.0, "spo2": 83.0, "temperature": 38.1, "motion_g": 3.45, "hrv_rmssd": 7.5}
    }
    raw = event_profiles.get(condition, event_profiles["NORMAL"])
    record = process_and_record_reading(raw, source=f"EVENT_{condition}")
    return {"status": "INJECTED", "record": record}

@router.get("/history")
async def get_hardware_history():
    return {
        "count": len(hardware_state["recent_history"]),
        "records": hardware_state["recent_history"]
    }

@router.get("/stream")
async def sse_stream(request: Request):
    """Server-Sent Events stream for mobile UI real-time chart updates"""
    async def event_generator():
        last_yielded = 0
        while True:
            if await request.is_disconnected():
                break

            now = time.time()
            if hardware_state["mode"] == "SIMULATION" and dataset_records:
                if now - last_yielded >= hardware_state["simulation_speed_sec"]:
                    hardware_state["current_dataset_index"] = (hardware_state["current_dataset_index"] + 1) % len(dataset_records)
                    sample = dataset_records[hardware_state["current_dataset_index"]]
                    process_and_record_reading(sample, source="DATASET_SIMULATION")
                    last_yielded = now

            payload = {
                "server_time": time.strftime("%H:%M:%S"),
                "mode": hardware_state["mode"],
                "latest": hardware_state["latest_record"],
                "history": hardware_state["recent_history"][-25:]
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
