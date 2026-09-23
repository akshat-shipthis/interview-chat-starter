from fastapi import APIRouter

from app.auth.dependencies import CurrentUser
from app.messages import service
from app.messages.models import Conversation, Message, MessageCreate

router = APIRouter(prefix="/api", tags=["messages"])


@router.get("/conversations")
async def list_conversations(current_user: CurrentUser) -> list[Conversation]:
    """List all conversations for the logged-in user."""
    return await service.list_conversations(current_user.id)


@router.post("/conversations/{other_user_id}/messages")
async def send_message(
    other_user_id: str,
    body: MessageCreate,
    current_user: CurrentUser,
) -> Message:
    """Send a message to another user. Creates the conversation if it doesn't exist."""
    conversation = await service.get_or_create_conversation(
        current_user.id, other_user_id
    )
    return await service.create_message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        receiver_id=other_user_id,
        text=body.text,
    )


@router.get("/conversations/{other_user_id}/messages")
async def get_messages(
    other_user_id: str,
    current_user: CurrentUser,
) -> list[Message]:
    """Get all messages in the conversation with another user."""
    conversation = await service.get_or_create_conversation(
        current_user.id, other_user_id
    )
    return await service.list_messages(conversation.id)
