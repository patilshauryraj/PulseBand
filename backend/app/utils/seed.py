import asyncio
from datetime import datetime, timedelta, date
from backend.app.database.session import AsyncSessionLocal, init_db
from backend.app.models.all_models import (
    User, UserPreferences, UserDevice, SensorStatus, HeartRateRecord, TemperatureRecord, DailySummary, Notification
)
from backend.app.security.security import hash_password
from sqlalchemy import select

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Check if user already exists
        res = await db.execute(select(User).where(User.email == "demo@pulseband.io"))
        if res.scalar_one_or_none():
            print("Seed data already present.")
            return

        print("Seeding PulseBand demo database...")
        # 1. Create Demo User
        user = User(
            name="Alex Morgan",
            email="demo@pulseband.io",
            password_hash=hash_password("pulseband123"),
            date_of_birth=date(1994, 6, 15),
            gender="Male",
            height=178.0,
            weight=72.5,
            activity_goal=10000,
            is_active=True
        )
        db.add(user)
        await db.flush()

        # 2. Preferences
        pref = UserPreferences(user_id=user.id, theme="system", units="metric", notifications_enabled=True)
        db.add(pref)

        # 3. Device: IndusBoard Coin
        dev_id = "COIN-INDUS-01"
        device = UserDevice(
            user_id=user.id,
            device_id=dev_id,
            device_name="PulseBand IndusBoard Coin",
            firmware_version="v1.0.4",
            battery_level=85,
            connection_type="BLUETOOTH",
            status="CONNECTED",
            last_sync=datetime.utcnow()
        )
        db.add(device)
        await db.flush()

        # 4. Sensor Statuses
        sensors = [
            ("PPG", "MAX30102 Optical Sensor", 96.0),
            ("TEMPERATURE", "NTC / MAX30205 Sensor", 99.5),
            ("ACCELEROMETER", "MPU6050 6-Axis Motion", 98.0),
            ("MAGNETOMETER", "QMC5883L Orientation", 95.0),
            ("PROXIMITY", "Capacitive Skin Contact", 100.0),
            ("RTC", "Hardware Real-Time Clock", 100.0)
        ]
        for s_type, name, sqi in sensors:
            db.add(SensorStatus(device_id=dev_id, sensor_type=s_type, status="OPERATIONAL", signal_quality=sqi, last_reading="Active"))

        # 5. Heart Rate & Temperature history (24 hours)
        now = datetime.utcnow()
        for i in range(24):
            t = now - timedelta(hours=23-i)
            # Realistic diurnal variation (lower at night, active morning/evening)
            base_hr = 62.0 if (i < 7) else (85.0 if (i in [9, 17, 18]) else 73.0)
            db.add(HeartRateRecord(user_id=user.id, device_id=dev_id, bpm=base_hr + (i % 5), quality="Good", timestamp=t))
            db.add(TemperatureRecord(user_id=user.id, device_id=dev_id, temperature=round(36.3 + (i % 3)*0.1, 1), timestamp=t))

        # 6. Notifications
        db.add(Notification(user_id=user.id, type="BAND_CONNECTED", title="IndusBoard Coin Paired", message="Bluetooth connection active. Live telemetry syncing."))
        db.add(Notification(user_id=user.id, type="GOAL_ACHIEVED", title="Active Milestone", message="You reached your afternoon active movement goal."))

        await db.commit()
        print("PulseBand demo seed complete! User: demo@pulseband.io / pulseband123")

if __name__ == "__main__":
    asyncio.run(seed_data())
