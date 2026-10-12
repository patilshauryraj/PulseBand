from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Map device_id to list of active WebSockets
        self.device_connections: Dict[str, List[WebSocket]] = {}
        # Map user_id to list of active WebSockets
        self.user_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, device_id: str, user_id: int = 1):
        await websocket.accept()
        if device_id not in self.device_connections:
            self.device_connections[device_id] = []
        self.device_connections[device_id].append(websocket)

        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, device_id: str, user_id: int = 1):
        if device_id in self.device_connections and websocket in self.device_connections[device_id]:
            self.device_connections[device_id].remove(websocket)
            if not self.device_connections[device_id]:
                del self.device_connections[device_id]

        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast_to_device(self, device_id: str, message: dict):
        if device_id in self.device_connections:
            for connection in list(self.device_connections[device_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.user_connections:
            for connection in list(self.user_connections[user_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()
