from app.auth.security import verify_password
from app.db import db
from app.users.models import User
from app.users.service import to_user


async def authenticate_user(email: str, password: str) -> User | None:
    document = await db.users.find_one({"email": email.lower()})
    if document is None or not verify_password(password, document["password_hash"]):
        return None
    return to_user(document)
