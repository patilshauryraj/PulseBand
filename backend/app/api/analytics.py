from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db

router = APIRouter()

@router.get("/daily")
async def get_daily_analytics(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    return {
        "days": [
            {"day": "Mon", "avg_hr": 74, "active_mins": 52, "steps": 6840},
            {"day": "Tue", "avg_hr": 76, "active_mins": 68, "steps": 8120},
            {"day": "Wed", "avg_hr": 73, "active_mins": 45, "steps": 5900},
            {"day": "Thu", "avg_hr": 75, "active_mins": 60, "steps": 7400},
            {"day": "Fri", "avg_hr": 78, "active_mins": 80, "steps": 10250},
            {"day": "Sat", "avg_hr": 72, "active_mins": 95, "steps": 11400},
            {"day": "Sun", "avg_hr": 71, "active_mins": 40, "steps": 5100}
        ],
        "insights": [
            "Your activity level was higher on Saturday and Friday than early in the week.",
            "Your heart rate remained stable and close to your personal resting baseline (72 BPM).",
            "Daily step goal was achieved 2 times this week."
        ]
    }

@router.get("/trends")
async def get_health_trends(user_id: int = 1):
    return {
        "heart_rate_trend": "Stable (-1.2% vs last week)",
        "resting_heart_rate": 68,
        "active_time_trend": "+12.5% increase",
        "sleep_recovery_score": "Optimal"
    }
