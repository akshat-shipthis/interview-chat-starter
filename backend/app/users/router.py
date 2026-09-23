from fastapi import APIRouter

from app.auth.dependencies import CurrentUser
from app.users import service
from app.users.models import User

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
async def list_users(current_user: CurrentUser) -> list[User]:
    return await service.list_users_except(current_user.id)
