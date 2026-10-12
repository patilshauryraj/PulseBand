import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="USER") # USER or ADMIN
    profile_photo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # cm
    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # kg
    activity_goal: Mapped[int] = mapped_column(Integer, default=10000)   # daily steps
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    preferences: Mapped["UserPreferences"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    devices: Mapped[List["UserDevice"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    daily_summaries: Mapped[List["DailySummary"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class UserPreferences(Base, TimestampMixin):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    theme: Mapped[str] = mapped_column(String(20), default="system")
    units: Mapped[str] = mapped_column(String(20), default="metric")
    language: Mapped[str] = mapped_column(String(10), default="en")
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_sync: Mapped[bool] = mapped_column(Boolean, default=True)
    sync_interval: Mapped[int] = mapped_column(Integer, default=60) # seconds

    user: Mapped["User"] = relationship(back_populates="preferences")

class UserDevice(Base, TimestampMixin):
    __tablename__ = "user_devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    device_name: Mapped[str] = mapped_column(String(100), default="PulseBand IndusBoard Coin")
    firmware_version: Mapped[str] = mapped_column(String(30), default="v1.0.0")
    battery_level: Mapped[int] = mapped_column(Integer, default=100)
    connection_type: Mapped[str] = mapped_column(String(20), default="BLUETOOTH")
    last_connected: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DISCONNECTED") # CONNECTED, SYNCING, DISCONNECTED

    user: Mapped["User"] = relationship(back_populates="devices")
    sensor_statuses: Mapped[List["SensorStatus"]] = relationship(back_populates="device", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String(64), ForeignKey("user_devices.device_id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    sensor_type: Mapped[str] = mapped_column(String(30), index=True) # ppg, temp, accel, mag, proximity
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20))
    signal_quality: Mapped[float] = mapped_column(Float, default=100.0)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    source: Mapped[str] = mapped_column(String(30), default="HARDWARE") # HARDWARE or DEMO_SIMULATION

    __table_args__ = (
        Index("ix_sensor_readings_device_time", "device_id", "timestamp"),
    )

class HeartRateRecord(Base):
    __tablename__ = "heart_rate_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    bpm: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[str] = mapped_column(String(20), default="good")
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)

class TemperatureRecord(Base):
    __tablename__ = "temperature_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(5), default="C")
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)

class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    activity_type: Mapped[str] = mapped_column(String(30), index=True) # RESTING, WALKING, RUNNING, ACTIVE, STATIONARY
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime)

class FallEvent(Base):
    __tablename__ = "fall_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    impact_level: Mapped[float] = mapped_column(Float) # Peak G magnitude
    confidence: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    response_status: Mapped[str] = mapped_column(String(30), default="PENDING") # OK, NEED_HELP, TIMEOUT_CANCELLED

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    avg_heart_rate: Mapped[float] = mapped_column(Float)
    min_heart_rate: Mapped[float] = mapped_column(Float)
    max_heart_rate: Mapped[float] = mapped_column(Float)
    activity_minutes: Mapped[int] = mapped_column(Integer, default=0)
    steps: Mapped[int] = mapped_column(Integer, default=0)
    distance_meters: Mapped[float] = mapped_column(Float, default=0.0)
    calories_estimated: Mapped[float] = mapped_column(Float, default=0.0)

    user: Mapped["User"] = relationship(back_populates="daily_summaries")

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(50)) # FALL_ALERT, LOW_BATTERY, WEAK_PPG, ANOMALY, GOAL_REACHED
    title: Mapped[str] = mapped_column(String(150))
    message: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="notifications")

class SensorStatus(Base):
    __tablename__ = "sensor_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[str] = mapped_column(String(64), ForeignKey("user_devices.device_id"), index=True)
    sensor_type: Mapped[str] = mapped_column(String(30)) # PPG, TEMPERATURE, ACCELEROMETER, MAGNETOMETER, PROXIMITY, RTC
    status: Mapped[str] = mapped_column(String(20)) # OPERATIONAL, DEGRADED, FAULT, DISCONNECTED
    signal_quality: Mapped[float] = mapped_column(Float, default=100.0)
    last_reading: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    device: Mapped["UserDevice"] = relationship(back_populates="sensor_statuses")

class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    model_name: Mapped[str] = mapped_column(String(64), index=True)
    model_version: Mapped[str] = mapped_column(String(20))
    prediction: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Float)
    features_snapshot: Mapped[dict] = mapped_column(JSON)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    records_received: Mapped[int] = mapped_column(Integer, default=0)
    records_processed: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="SUCCESS")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    result: Mapped[str] = mapped_column(String(20)) # SUCCESS, FAILURE, REJECTED
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
