import asyncio
from datetime import UTC, datetime

from app.auth.security import hash_password
from app.db import client, db

PASSWORD = "password123"

USERS = [
    ("Aarti Rao", "aarti@example.com"),
    ("Dev Menon", "dev@example.com"),
    ("Kiran Shah", "kiran@example.com"),
    ("Meera Iyer", "meera@example.com"),
    ("Rohit Nair", "rohit@example.com"),
]


async def seed() -> None:
    now = datetime.now(UTC)
    await db.users.drop()
    await db.users.create_index("email", unique=True)
    await db.users.insert_many(
        {
            "name": name,
            "email": email,
            "password_hash": hash_password(PASSWORD),
            "initials": "".join(part[0] for part in name.split()),
            "created_at": now,
        }
        for name, email in USERS
    )

    # Set up conversations collection
    await db.conversations.drop()
    await db.conversations.create_index("participants")

    # Set up messages collection
    await db.messages.drop()
    await db.messages.create_index([("sender_id", 1), ("receiver_id", 1)])
    await db.messages.create_index([("receiver_id", 1), ("sender_id", 1)])
    await db.messages.create_index("created_at")
    await db.messages.create_index([("conversation_id", 1), ("created_at", 1)])

    await client.close()
    print(f"Seeded {len(USERS)} users into '{db.name}'. Password for all: {PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
