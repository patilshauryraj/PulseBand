from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/today")
async def get_today_activity(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    # Aggregated activity metrics
    return {
        "steps": 6840,
        "step_goal": 10000,
        "progress_percent": 68.4,
        "distance_km": 4.82,
        "active_calories_kcal": 345.0,
        "active_minutes": 52,
        "sedentary_minutes": 420,
        "timeline": [
            {"time": "08:10", "activity": "Walking", "duration": "25m"},
            {"time": "08:35", "activity": "Stationary", "duration": "45m"},
            {"time": "09:20", "activity": "Walking", "duration": "15m"},
            {"time": "10:05", "activity": "Active", "duration": "20m"},
            {"time": "10:40", "activity": "Resting", "duration": "1h 10m"}
        ]
    }
