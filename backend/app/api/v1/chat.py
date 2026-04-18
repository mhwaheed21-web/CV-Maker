from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.services import chat_service

router = APIRouter(prefix="/cvs/{cv_id}/chat", tags=["chat"])


@router.get("/", response_model=List[ChatMessageResponse])
async def list_chat_messages(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    messages = await chat_service.get_chat_messages(db, current_user.id, cv_id)
    if messages is None:
        raise HTTPException(status_code=404, detail="CV not found")
    return messages


@router.post("/", response_model=ChatMessageResponse, status_code=201)
async def create_chat_message(
    cv_id: str,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.content.strip():
        raise HTTPException(status_code=422, detail="Message content cannot be empty")

    message = await chat_service.add_chat_message(db, current_user.id, cv_id, payload)
    if not message:
        raise HTTPException(status_code=404, detail="CV not found")
    return message
