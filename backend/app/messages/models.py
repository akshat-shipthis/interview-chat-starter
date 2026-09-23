from datetime import datetime

from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    participants: list[str]
    created_at: datetime
    updated_at: datetime


class Message(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    receiver_id: str
    text: str
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    receiver_id: str
    text: str

