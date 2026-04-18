from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.chat import CVChatMessage
from app.services.cv_service import get_cv_by_id
from app.schemas.chat import ChatMessageCreate
from app.services import ai_service
from app.services.pdf_service import render_cv_html
from app.services.profile_service import get_or_create_profile
from app.models.user import User


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


async def process_chat_message(
    db: AsyncSession,
    current_user: User,
    cv_id: str,
    data: ChatMessageCreate,
):
    cv = await get_cv_by_id(db, current_user.id, cv_id)
    if not cv:
        return None

    clean_content = data.content.strip()
    if not clean_content:
        return "empty"

    user_message = CVChatMessage(
        cv_id=cv_id,
        user_id=current_user.id,
        role="user",
        content=clean_content,
    )
    db.add(user_message)
    await db.flush()

    current_cv_content = cv.cv_content or {"summary": "", "sections": []}
    clean_current_cv = {
        "summary": current_cv_content.get("summary", ""),
        "sections": current_cv_content.get("sections", []),
    }

    ai_result = await ai_service.generate_chat_edit(clean_current_cv, clean_content)
    assistant_reply = ai_result.get("assistant_reply") or "I reviewed your request."
    ai_cv_updated = bool(ai_result.get("cv_updated"))
    proposed_content = ai_result.get("updated_cv_content") or clean_current_cv

    summary = proposed_content.get("summary")
    sections = proposed_content.get("sections")
    valid_shape = isinstance(summary, str) and isinstance(sections, list)

    cv_updated = ai_cv_updated and valid_shape
    if cv_updated:
        profile = await get_or_create_profile(db, current_user.id)
        user_dict = {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "personal": {
                "phone": profile.phone,
                "location": profile.location,
                "linkedin_url": profile.linkedin_url,
                "portfolio_url": profile.portfolio_url,
            },
        }

        html_content = render_cv_html(proposed_content, user_dict, cv.template_id)
        cv.cv_content = {
            **proposed_content,
            "_html": html_content,
        }

    assistant_message = CVChatMessage(
        cv_id=cv_id,
        user_id=current_user.id,
        role="assistant",
        content=assistant_reply,
    )
    db.add(assistant_message)

    await db.commit()
    await db.refresh(user_message)
    await db.refresh(assistant_message)

    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
        "cv_updated": cv_updated,
    }
