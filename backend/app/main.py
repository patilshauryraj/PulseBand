from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.config import settings
from backend.app.database.session import init_db
from backend.app.api import auth, users, devices, health, activity, analytics, notifications, ml, admin, biosensor_hardware
from backend.app.websocket.connection_manager import manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables on startup
    await init_db()
    yield

app = FastAPI(
    title="PulseBand IoT & ML Health Platform API",
    description="Commercial-grade REST & WebSocket telemetry backend for the IndusBoard Coin Health Ecosystem",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(devices.router, prefix="/devices", tags=["Devices"])
app.include_router(health.router, prefix="/health", tags=["Health Telemetry"])
app.include_router(activity.router, prefix="/activity", tags=["Activity Analytics"])
app.include_router(analytics.router, prefix="/analytics", tags=["Health Analytics"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(admin.router, prefix="/admin", tags=["Admin & System Health"])
app.include_router(biosensor_hardware.router, prefix="/api", tags=["Biosensor Hardware Bridge"])
app.include_router(biosensor_hardware.router, prefix="", tags=["Direct Hardware Routes"])

@app.websocket("/ws/device/{device_id}")
async def websocket_device_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(websocket, device_id)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("action") == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, device_id)

@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "service": "PulseBand API",
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/")
async def root():
    return {
        "message": "PulseBand IoT Health Platform API running.",
        "documentation": "/docs",
        "version": settings.VERSION
    }
