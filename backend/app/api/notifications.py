from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.database.session import get_db
from backend.app.models.all_models import Notification
from typing import List

router = APIRouter()

@router.get("")
async def get_notifications(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(desc(Notification.created_at))
    res = await db.execute(stmt)
    notifs = res.scalars().all()
    if not notifs:
        return [
            {"id": 1, "type": "BAND_CONNECTED", "title": "Band Connected", "message": "PulseBand IndusBoard Coin paired and syncing.", "read": False},
            {"id": 2, "type": "GOAL_ACHIEVED", "title": "Daily Goal Milestone", "message": "You reached 68% of your daily steps.", "read": True}
        ]
    return notifs

@router.patch("/{notif_id}/read")
async def mark_notification_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.id == notif_id)
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()
    if notif:
        notif.read = True
        await db.commit()
    return {"status": "success"}
