from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

from app.db import db
from app.messages.models import Conversation, Message


def to_conversation(document: dict[str, Any]) -> Conversation:
    return Conversation(
        id=str(document["_id"]),
        participants=[str(pid) for pid in document["participants"]],
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


def to_message(document: dict[str, Any]) -> Message:
    return Message(
        id=str(document["_id"]),
        conversation_id=str(document["conversation_id"]),
        sender_id=str(document["sender_id"]),
        receiver_id=str(document["receiver_id"]),
        text=document["text"],
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


async def get_or_create_conversation(user_id: str, other_user_id: str) -> Conversation:
    """Find the existing conversation between two users, or create one."""
    try:
        participant_ids = [ObjectId(user_id), ObjectId(other_user_id)]
    except InvalidId as e:
        raise ValueError("Invalid user ID format") from e
    
    document = await db.conversations.find_one(
        {"participants": {"$all": participant_ids, "$size": 2}}
    )
    if document:
        return to_conversation(document)

    now = datetime.now(UTC)
    result = await db.conversations.insert_one(
        {
            "participants": participant_ids,
            "created_at": now,
            "updated_at": now,
        }
    )
    document = await db.conversations.find_one({"_id": result.inserted_id})
    return to_conversation(document)


async def list_conversations(user_id: str) -> list[Conversation]:
    """List all conversations the user is part of, most recent first."""
    try:
        user_oid = ObjectId(user_id)
    except InvalidId as e:
        raise ValueError("Invalid user ID format") from e
    
    cursor = db.conversations.find(
        {"participants": user_oid}
    ).sort("updated_at", -1)
    return [to_conversation(doc) async for doc in cursor]


async def create_message(
    conversation_id: str, sender_id: str, receiver_id: str, text: str
) -> Message:
    """Insert a message and bump the conversation's updated_at timestamp."""
    try:
        conv_oid = ObjectId(conversation_id)
        sender_oid = ObjectId(sender_id)
        receiver_oid = ObjectId(receiver_id)
    except InvalidId as e:
        raise ValueError("Invalid ID format") from e
    
    now = datetime.now(UTC)
    result = await db.messages.insert_one(
        {
            "conversation_id": conv_oid,
            "sender_id": sender_oid,
            "receiver_id": receiver_oid,
            "text": text,
            "created_at": now,
            "updated_at": now,
        }
    )
    # Bump the conversation's updated_at so it sorts to the top
    await db.conversations.update_one(
        {"_id": conv_oid},
        {"$set": {"updated_at": now}},
    )
    document = await db.messages.find_one({"_id": result.inserted_id})
    return to_message(document)


async def list_messages(conversation_id: str) -> list[Message]:
    """Fetch all messages in a conversation, oldest first."""
    try:
        conv_oid = ObjectId(conversation_id)
    except InvalidId as e:
        raise ValueError("Invalid conversation ID format") from e
    
    cursor = db.messages.find(
        {"conversation_id": conv_oid}
    ).sort("created_at", 1)
    return [to_message(doc) async for doc in cursor]
