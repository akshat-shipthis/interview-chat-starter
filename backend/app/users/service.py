from typing import Any

from bson import ObjectId

from app.db import db
from app.users.models import User


def to_user(document: dict[str, Any]) -> User:
    return User(
        id=str(document["_id"]),
        name=document["name"],
        email=document["email"],
        initials=document["initials"],
    )


async def get_user_by_id(user_id: str) -> User | None:
    document = await db.users.find_one({"_id": ObjectId(user_id)})
    return to_user(document) if document else None


async def list_users_except(user_id: str) -> list[User]:
    cursor = db.users.find({"_id": {"$ne": ObjectId(user_id)}}).sort("name")
    return [to_user(document) async for document in cursor]
