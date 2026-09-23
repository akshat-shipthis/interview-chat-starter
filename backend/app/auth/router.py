from fastapi import APIRouter, HTTPException, status

from app.auth import service
from app.auth.dependencies import CurrentUser
from app.auth.models import LoginRequest, LoginResponse
from app.auth.security import create_access_token
from app.users.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(body: LoginRequest) -> LoginResponse:
    user = await service.authenticate_user(body.email, body.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return LoginResponse(access_token=create_access_token(user.id), user=user)


@router.get("/me")
async def me(current_user: CurrentUser) -> User:
    return current_user
