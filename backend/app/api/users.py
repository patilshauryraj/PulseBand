from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.session import get_db
from backend.app.models.all_models import User
from backend.app.schemas.all_schemas import UserProfile
from backend.app.security.security import decode_token

router = APIRouter()

async def get_current_user(authorization: str = Header(...), db: AsyncSession = Depends(get_db)) -> User:
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = int(payload.get("sub"))
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.delete("/me")
async def delete_account(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted successfully"}
