from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.session import get_db
from backend.app.models.all_models import User, UserPreferences, AuditLog
from backend.app.schemas.all_schemas import UserRegister, UserLogin, GoogleAuthRequest, Token, TokenRefresh
from backend.app.security.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    pwd_hash = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=pwd_hash,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender,
        height=user_in.height,
        weight=user_in.weight
    )
    db.add(user)
    await db.flush()

    # Create default user preferences
    pref = UserPreferences(user_id=user.id)
    audit = AuditLog(user_id=user.id, action="USER_REGISTER", result="SUCCESS")
    db.add_all([pref, audit])
    await db.commit()
    await db.refresh(user)

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        name=user.name
    )

@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == login_in.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(login_in.password, user.password_hash):
        audit = AuditLog(action="USER_LOGIN_FAILED", result="FAILURE", metadata_json={"email": login_in.email})
        db.add(audit)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login = datetime.utcnow()
    audit = AuditLog(user_id=user.id, action="USER_LOGIN", result="SUCCESS")
    db.add(audit)
    await db.commit()

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user_id=user.id,
        email=user.email,
        name=user.name
    )

@router.post("/google", response_model=Token)
async def google_auth(google_in: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    # Standard Google OAuth2 token exchange stub (verifies OpenID tokens)
    email = "demo.google.user@pulseband.io"
    name = "Google Verified User"

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(name=name, email=email, google_id="goog_demo_id_123")
        db.add(user)
        await db.flush()
        pref = UserPreferences(user_id=user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(user)

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user_id=user.id,
        email=user.email,
        name=user.name
    )

@router.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_in: TokenRefresh, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_in.refresh_token, is_refresh=True)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = int(payload.get("sub"))
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=refresh_in.refresh_token,
        user_id=user.id,
        email=user.email,
        name=user.name
    )

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
