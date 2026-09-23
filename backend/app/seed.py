import asyncio
from datetime import UTC, datetime

from bson import ObjectId

from app.auth.security import hash_password
from app.db import client, db

PASSWORD = "password123"

# Fixed ids so tokens stay valid after a reseed.
USERS = [
    ("66f000000000000000000001", "Aarti Rao", "aarti@example.com"),
    ("66f000000000000000000002", "Dev Menon", "dev@example.com"),
    ("66f000000000000000000003", "Kiran Shah", "kiran@example.com"),
    ("66f000000000000000000004", "Meera Iyer", "meera@example.com"),
    ("66f000000000000000000005", "Rohit Nair", "rohit@example.com"),
]


async def seed() -> None:
    password_hash = hash_password(PASSWORD)
    now = datetime.now(UTC)
    await db.users.drop()
    await db.users.create_index("email", unique=True)
    await db.users.insert_many(
        {
            "_id": ObjectId(user_id),
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "initials": "".join(part[0] for part in name.split()),
            "created_at": now,
        }
        for user_id, name, email in USERS
    )
    await client.close()
    print(f"Seeded {len(USERS)} users into '{db.name}'. Password for all: {PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
