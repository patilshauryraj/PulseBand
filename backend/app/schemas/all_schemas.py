from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import uuid

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    name: str

class TokenRefresh(BaseModel):
    refresh_token: str

class UserProfile(BaseModel):
    id: int
    uuid: str
    name: str
    email: str
    role: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_goal: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- SENSOR & INGESTION SCHEMAS ---
class Vector3D(BaseModel):
    x: float
    y: float
    z: float

class IngestionPacket(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=64)
    timestamp: datetime
    ppg_raw: float = Field(..., description="Raw optical photodiode ADC")
    temperature: float = Field(..., ge=20.0, le=48.0, description="Celsius")
    accelerometer: Vector3D
    magnetometer: Optional[Vector3D] = None
    battery_level: int = Field(100, ge=0, le=100)
    proximity_wear: bool = True
    source: str = Field("HARDWARE", pattern="^(HARDWARE|DEMO_SIMULATION)$")

# --- DEVICE SCHEMAS ---
class DeviceRegister(BaseModel):
    device_id: str
    device_name: Optional[str] = "PulseBand IndusBoard Coin"
    connection_type: Optional[str] = "BLUETOOTH"

class DeviceOut(BaseModel):
    id: int
    device_id: str
    device_name: str
    firmware_version: str
    battery_level: int
    connection_type: str
    status: str
    last_sync: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- HEALTH & ACTIVITY SCHEMAS ---
class HeartRatePoint(BaseModel):
    bpm: float
    quality: str
    timestamp: datetime

class TemperaturePoint(BaseModel):
    temperature: float
    timestamp: datetime

class ActivityPoint(BaseModel):
    activity_type: str
    confidence: float
    duration_seconds: int
    start_time: datetime
    end_time: datetime

class LiveHealthResponse(BaseModel):
    device_id: str
    heart_rate: float
    temperature: float
    activity: str
    activity_confidence: float
    signal_quality: float
    quality_label: str
    battery_level: int
    wear_status: bool
    filtered_waveform: List[float]
    timestamp: datetime

# --- ML INFERENCE SCHEMAS ---
class ActivityPredictRequest(BaseModel):
    accel_x: List[float]
    accel_y: List[float]
    accel_z: List[float]

class ActivityPredictResponse(BaseModel):
    activity: str
    confidence: float
    model_name: str = "ActivityRandomForest"
    model_version: str = "v1.0"
    timestamp: datetime

class FallDetectRequest(BaseModel):
    magnitude_series: List[float]

class FallDetectResponse(BaseModel):
    is_fall: bool
    confidence: float
    impact_score: float
    model_name: str = "HybridFallDetector"
    timestamp: datetime

class AnomalyDetectRequest(BaseModel):
    heart_rate: float
    temperature: float
    baseline_hr_mean: float = 72.0
    baseline_hr_std: float = 7.0

class AnomalyDetectResponse(BaseModel):
    is_anomaly: bool
    insight: str
    timestamp: datetime
