import os
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routes import router as api_router, UPLOAD_DIR

app = FastAPI(
    title="VLM Intelligent Hallucination Studio API",
    description="Real-Time Multimodal Vision-Language Model Hallucination Extraction & Training Platform",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded media directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Router
app.include_router(api_router)

# Mount frontend production build if dist directory exists
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static_frontend")


@app.on_event("startup")
def on_startup():
    init_db()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive ping / pulse control message
            data = await websocket.receive_text()
            # Send real-time pulse metric update
            await websocket.send_json({
                "type": "heartbeat",
                "status": "active",
                "active_listeners": len(manager.active_connections)
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
