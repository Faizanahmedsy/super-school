import os
import django
from django.core.asgi import get_asgi_application
import socketio
from socketio import ASGIApp
from channels.routing import ProtocolTypeRouter

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "LMS.settings")
django.setup()

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socketio_app = ASGIApp(sio)

# Django ASGI app
django_asgi_app = get_asgi_application()

# ASGI application
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": socketio_app,  # Handles WebSocket requests for /socket.io/
    }
)


# Socket.IO Event Handlers
@sio.event
async def connect(sid, environ):
    print(f"✅ WebSocket Client Connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ WebSocket Client Disconnected: {sid}")

@sio.on("notification")
async def handle_notification(sid, data):
    print(f"📢 Notification received: {data}")
    await sio.emit("notification", {"message": "Notification received!"})
