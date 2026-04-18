from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.chat import CVChatMessage
from app.services.cv_service import get_cv_by_id
from app.schemas.chat import ChatMessageCreate


async def get_chat_messages(db: AsyncSession, user_id: str, cv_id: str):
    cv = await get_cv_by_id(db, user_id, cv_id)
    if not cv:
        return None

    result = await db.execute(
        select(CVChatMessage)
        .where(
            CVChatMessage.cv_id == cv_id,
            CVChatMessage.user_id == user_id,
        )
        .order_by(CVChatMessage.created_at.asc())
    )
    return result.scalars().all()


async def add_chat_message(
    db: AsyncSession,
    user_id: str,
    cv_id: str,
    data: ChatMessageCreate,
):
    cv = await get_cv_by_id(db, user_id, cv_id)
    if not cv:
        return None

    clean_content = data.content.strip()
    if not clean_content:
        return None

    message = CVChatMessage(
        cv_id=cv_id,
        user_id=user_id,
        role=data.role,
        content=clean_content,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
