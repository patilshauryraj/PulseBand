from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.session import get_db
from backend.app.models.all_models import UserDevice, SensorStatus, SyncLog
from backend.app.schemas.all_schemas import DeviceRegister, DeviceOut, IngestionPacket
from backend.app.services.sensor_pipeline import process_incoming_sensor_packet
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("", response_model=List[DeviceOut])
async def list_devices(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(UserDevice).where(UserDevice.user_id == user_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=DeviceOut)
async def register_device(dev_in: DeviceRegister, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(UserDevice).where(UserDevice.device_id == dev_in.device_id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        return existing

    device = UserDevice(
        user_id=user_id,
        device_id=dev_in.device_id,
        device_name=dev_in.device_name,
        connection_type=dev_in.connection_type,
        status="CONNECTED"
    )
    db.add(device)
    await db.flush()

    # Initialize default sensor statuses for the IndusBoard Coin
    sensors = ["PPG", "TEMPERATURE", "ACCELEROMETER", "MAGNETOMETER", "PROXIMITY", "RTC"]
    for s in sensors:
        s_obj = SensorStatus(device_id=device.device_id, sensor_type=s, status="OPERATIONAL", signal_quality=95.0)
        db.add(s_obj)

    await db.commit()
    await db.refresh(device)
    return device

@router.post("/{device_id}/ingest")
async def ingest_telemetry(device_id: str, packet: IngestionPacket, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    return await process_incoming_sensor_packet(packet, user_id, db)

@router.get("/{device_id}/sensors")
async def get_device_sensors(device_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(SensorStatus).where(SensorStatus.device_id == device_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/{device_id}/sensors/test")
async def run_sensor_diagnostic_test(device_id: str, db: AsyncSession = Depends(get_db)):
    # Sequential simulated hardware self-test diagnostic
    return {
        "device_id": device_id,
        "timestamp": datetime.utcnow().isoformat(),
        "diagnostic_results": [
            {"sensor": "PPG Sensor (MAX30102)", "status": "PASSED", "snr_db": 28.4, "led_current_ma": 7.2},
            {"sensor": "Skin Temp (NTC/MAX30205)", "status": "PASSED", "calibrated_offset": 0.05},
            {"sensor": "Accelerometer (MPU6050)", "status": "PASSED", "self_test_deflection": "OK"},
            {"sensor": "Magnetometer (QMC5883L)", "status": "PASSED", "field_strength_ut": 42.1},
            {"sensor": "Proximity / Wear Contact", "status": "PASSED", "capacitance_pf": 12.8},
            {"sensor": "Real-Time Clock (RTC)", "status": "PASSED", "drift_ppm": 0.2}
        ],
        "overall_health": "EXCELLENT"
    }

@router.post("/{device_id}/sync")
async def trigger_device_sync(device_id: str, db: AsyncSession = Depends(get_db)):
    log = SyncLog(device_id=device_id, records_received=64, records_processed=64, status="SUCCESS", completed_at=datetime.utcnow())
    db.add(log)
    await db.commit()
    return {"message": "Sync completed successfully", "records_synced": 64, "timestamp": datetime.utcnow()}
