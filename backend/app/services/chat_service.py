from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from email_validator import validate_email, EmailNotValidError

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

    profile = await get_or_create_profile(db, current_user.id)
    current_contact_info = {
        "email": current_user.email,
        "phone": profile.phone,
        "location": profile.location,
        "linkedin_url": profile.linkedin_url,
        "portfolio_url": profile.portfolio_url,
    }

    ai_result = await ai_service.generate_chat_action(clean_current_cv, current_contact_info, clean_content)
    assistant_reply = ai_result.get("assistant_reply") or "I reviewed your request."
    target = ai_result.get("target") or "none"
    ai_cv_updated = bool(ai_result.get("cv_updated"))
    proposed_content = ai_result.get("updated_cv_content") or clean_current_cv
    proposed_profile_updates = ai_result.get("profile_updates") or {}

    summary = proposed_content.get("summary")
    sections = proposed_content.get("sections")
    valid_shape = isinstance(summary, str) and isinstance(sections, list)

    cv_updated = target == "cv_content" and ai_cv_updated and valid_shape
    profile_updated = False

    if target == "profile":
        allowed_profile_fields = ["phone", "location", "linkedin_url", "portfolio_url"]

        email_update = proposed_profile_updates.get("email")
        if isinstance(email_update, str) and email_update.strip() and email_update.strip() != current_user.email:
            try:
                normalized_email = validate_email(email_update.strip(), check_deliverability=False).normalized
                current_user.email = normalized_email
                profile_updated = True
            except EmailNotValidError:
                assistant_reply = "I could not update the email because the format looks invalid."

        for field in allowed_profile_fields:
            new_value = proposed_profile_updates.get(field)
            if isinstance(new_value, str):
                new_value = new_value.strip()
            if isinstance(new_value, str) and new_value:
                if getattr(profile, field) != new_value:
                    setattr(profile, field, new_value)
                    profile_updated = True

    if cv_updated:
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
        "profile_updated": profile_updated,
    }
