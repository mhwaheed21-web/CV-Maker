import logging
from typing import Optional

from jinja2 import TemplateNotFound
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    AIServiceError,
    CVGenerationError,
    PDFRenderError,
    TemplateNotFoundError,
    format_error_message,
)
from app.models.cv import GeneratedCV
from app.models.user import User
from app.services import ai_service, pdf_service
from app.services.profile_service import get_full_profile

logger = logging.getLogger(__name__)


async def get_user_cvs(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(GeneratedCV)
        .where(GeneratedCV.user_id == user_id)
        .order_by(GeneratedCV.created_at.desc())
    )
    return result.scalars().all()


async def get_cv_by_id(db: AsyncSession, user_id: str, cv_id: str):
    result = await db.execute(
        select(GeneratedCV).where(
            GeneratedCV.id == cv_id,
            GeneratedCV.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def delete_cv(db: AsyncSession, user_id: str, cv_id: str) -> bool:
    cv = await get_cv_by_id(db, user_id, cv_id)
    if not cv:
        return False
    await db.delete(cv)
    await db.commit()
    return True


async def run_generation_pipeline(
    cv_id: str,
    user_id: str,
    job_description: str,
    template_id: str,
    db: AsyncSession,
    user: User,
):
    try:
        if db is None:
            from app.db.session import AsyncSessionLocal

            async with AsyncSessionLocal() as fresh_db:
                await _run_generation_pipeline_impl(
                    cv_id,
                    user_id,
                    job_description,
                    template_id,
                    fresh_db,
                    user,
                )
        else:
            await _run_generation_pipeline_impl(
                cv_id,
                user_id,
                job_description,
                template_id,
                db,
                user,
            )
    except (AIServiceError, PDFRenderError, TemplateNotFoundError, CVGenerationError) as exc:
        logger.error("CV generation failed for %s: %s", cv_id, exc)
        await _mark_cv_failed(cv_id, format_error_message(exc))
    except Exception as exc:
        logger.exception("CV generation failed for %s", cv_id)
        await _mark_cv_failed(cv_id, format_error_message(exc))


async def _mark_cv_failed(cv_id: str, error_message: str):
    try:
        from app.db.session import AsyncSessionLocal

        async with AsyncSessionLocal() as fresh_db:
            cv_result = await fresh_db.execute(
                select(GeneratedCV).where(GeneratedCV.id == cv_id)
            )
            cv = cv_result.scalar_one_or_none()
            if cv:
                cv.status = "failed"
                cv.error_message = error_message
                await fresh_db.commit()
    except Exception:
        logger.exception("Failed to persist CV failure state for %s", cv_id)


async def _run_generation_pipeline_impl(
    cv_id: str,
    user_id: str,
    job_description: str,
    template_id: str,
    db: AsyncSession,
    user: User,
):
    cv_result = await db.execute(select(GeneratedCV).where(GeneratedCV.id == cv_id))
    cv = cv_result.scalar_one_or_none()
    if not cv:
        return

    profile = await get_full_profile(db, user_id)

    profile_dict = {
        "personal": {
            "phone": profile["personal"].phone if profile["personal"] else None,
            "location": profile["personal"].location if profile["personal"] else None,
            "linkedin_url": profile["personal"].linkedin_url if profile["personal"] else None,
            "portfolio_url": profile["personal"].portfolio_url if profile["personal"] else None,
            "professional_summary": profile["personal"].professional_summary if profile["personal"] else None,
        },
        "experience": [
            {
                "job_title": item.job_title,
                "company_name": item.company_name,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "is_current": item.is_current,
                "responsibilities": item.responsibilities or [],
            }
            for item in profile["experience"]
        ],
        "education": [
            {
                "degree": item.degree,
                "institution": item.institution,
                "graduation_year": item.graduation_year,
                "gpa": item.gpa,
            }
            for item in profile["education"]
        ],
        "skills": [
            {"name": item.name, "category": item.category}
            for item in profile["skills"]
        ],
        "projects": [
            {
                "name": item.name,
                "description": item.description,
                "technologies": item.technologies or [],
                "url": item.url,
            }
            for item in profile["projects"]
        ],
        "certifications": [
            {
                "name": item.name,
                "issuer": item.issuer,
                "issue_date": item.issue_date,
            }
            for item in profile["certifications"]
        ],
    }

    try:
        cv_content = await ai_service.generate_cv_content(profile_dict, job_description)
    except AIServiceError:
        raise
    except Exception as exc:
        raise CVGenerationError(str(exc)) from exc

    cv.cv_content = cv_content
    cv.status = "generating"
    await db.commit()

    user_dict = {
        "full_name": user.full_name,
        "email": user.email,
        "personal": profile_dict["personal"],
    }

    try:
        html_content = pdf_service.render_cv_html(cv_content, user_dict, template_id)
    except TemplateNotFound as exc:
        raise TemplateNotFoundError(str(exc)) from exc
    except Exception as exc:
        raise PDFRenderError(str(exc)) from exc

    try:
        _pdf_bytes = pdf_service.generate_pdf(html_content)
    except Exception as exc:
        raise PDFRenderError(str(exc)) from exc

    cv.status = "complete"
    cv.cv_content = {
        **cv_content,
        "_html": html_content,
    }
    await db.commit()

    logger.info("CV %s generated successfully", cv_id)


async def regenerate_cv(
    cv_id: str,
    user_id: str,
    job_description: Optional[str],
    template_id: Optional[str],
    title: Optional[str],
    db: AsyncSession,
    user: User,
):
    """
    Update CV with new parameters and reset status for regeneration.
    The actual generation pipeline is run as a separate background task.
    """
    cv = await get_cv_by_id(db, user_id, cv_id)
    if not cv:
        return None

    new_job_description = job_description or cv.job_description
    new_template_id = template_id or cv.template_id
    new_title = title or cv.title

    cv.job_description = new_job_description
    cv.template_id = new_template_id
    cv.title = new_title
    cv.cv_content = None
    cv.status = "pending"
    cv.error_message = None
    await db.commit()

    return cv