import json
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from app.auth.security import decode_access_token
from app.messages import service
from app.users.service import get_user_by_id

logger = logging.getLogger(__name__)

# Maps user_id -> list of WebSocket connections for that user (supports multiple tabs)
connected_users: dict[str, list[WebSocket]] = {}


async def authenticate(websocket: WebSocket) -> str | None:
    """Validate the JWT passed as a query param and return the user_id."""
    token = websocket.query_params.get("token")
    if not token:
        return None
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    user = await get_user_by_id(user_id)
    return user.id if user else None


async def handle_message(sender_id: str, data: dict[str, Any]) -> None:
    """Process an incoming chat message: persist and forward to the receiver."""
    receiver_id = data.get("receiver_id")
    text = data.get("text", "").strip()
    if not receiver_id or not text:
        return

    # Persist conversation + message
    conversation = await service.get_or_create_conversation(sender_id, receiver_id)
    message = await service.create_message(conversation.id, sender_id, receiver_id, text)

    payload = json.dumps(
        {
            "type": "message",
            "conversation_id": conversation.id,
            "message": message.model_dump(mode="json"),
        }
    )

    # Send to all receiver's connections (multiple tabs)
    receiver_sockets = connected_users.get(receiver_id, [])
    for ws in receiver_sockets[:]:  # Copy list to safely modify during iteration
        try:
            await ws.send_text(payload)
        except Exception:
            logger.warning("Failed to send to user %s, removing stale connection", receiver_id)
            receiver_sockets.remove(ws)
    
    # Clean up empty lists
    if receiver_id in connected_users and not connected_users[receiver_id]:
        del connected_users[receiver_id]

    # Echo back to all sender's connections (multiple tabs)
    sender_sockets = connected_users.get(sender_id, [])
    for ws in sender_sockets[:]:  # Copy list to safely modify during iteration
        try:
            await ws.send_text(payload)
        except Exception:
            logger.warning("Failed to echo to sender %s, removing stale connection", sender_id)
            sender_sockets.remove(ws)
    
    # Clean up empty lists
    if sender_id in connected_users and not connected_users[sender_id]:
        del connected_users[sender_id]


async def websocket_endpoint(websocket: WebSocket) -> None:
    user_id = await authenticate(websocket)
    if user_id is None:
        await websocket.close(code=401, reason="Unauthorized")
        return

    await websocket.accept()
    
    # Add this connection to the user's list of connections
    if user_id not in connected_users:
        connected_users[user_id] = []
    connected_users[user_id].append(websocket)
    
    logger.info("User %s connected via WebSocket (total connections: %d)", 
                user_id, len(connected_users[user_id]))

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")
            if msg_type == "message":
                await handle_message(user_id, data)
    except WebSocketDisconnect:
        pass
    finally:
        # Remove this specific connection
        if user_id in connected_users:
            try:
                connected_users[user_id].remove(websocket)
            except ValueError:
                pass  # Already removed
            
            # Clean up empty lists
            if not connected_users[user_id]:
                del connected_users[user_id]
        
        logger.info("User %s disconnected", user_id)
