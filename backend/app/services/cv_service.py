from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.cv import GeneratedCV
from app.models.user import User
from app.services import ai_service, pdf_service
from app.services.profile_service import get_full_profile
from typing import Optional
import logging

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
            GeneratedCV.user_id == user_id
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
        # If db is None, create a fresh session (for background tasks)
        if db is None:
            from app.db.session import AsyncSessionLocal
            async with AsyncSessionLocal() as fresh_db:
                await _run_generation_pipeline_impl(cv_id, user_id, job_description, template_id, fresh_db, user)
        else:
            await _run_generation_pipeline_impl(cv_id, user_id, job_description, template_id, db, user)
    except Exception as e:
        import traceback
        logger.error(f"CV generation failed for {cv_id}: {e}")
        logger.error(traceback.format_exc())
        # Try to update error status
        try:
            from app.db.session import AsyncSessionLocal
            async with AsyncSessionLocal() as fresh_db:
                cv_result = await fresh_db.execute(
                    select(GeneratedCV).where(GeneratedCV.id == cv_id)
                )
                cv = cv_result.scalar_one_or_none()
                if cv:
                    cv.status = "failed"
                    cv.error_message = str(e)
                    await fresh_db.commit()
        except Exception:
            pass


async def _run_generation_pipeline_impl(
    cv_id: str,
    user_id: str,
    job_description: str,
    template_id: str,
    db: AsyncSession,
    user: User,
):
    cv_result = await db.execute(
        select(GeneratedCV).where(GeneratedCV.id == cv_id)
    )
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
                "job_title": e.job_title,
                "company_name": e.company_name,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "is_current": e.is_current,
                "responsibilities": e.responsibilities or [],
            }
            for e in profile["experience"]
        ],
        "education": [
            {
                "degree": e.degree,
                "institution": e.institution,
                "graduation_year": e.graduation_year,
                "gpa": e.gpa,
            }
            for e in profile["education"]
        ],
        "skills": [
            {"name": s.name, "category": s.category}
            for s in profile["skills"]
        ],
        "projects": [
            {
                "name": p.name,
                "description": p.description,
                "technologies": p.technologies or [],
                "url": p.url,
            }
            for p in profile["projects"]
        ],
        "certifications": [
            {
                "name": c.name,
                "issuer": c.issuer,
                "issue_date": c.issue_date,
            }
            for c in profile["certifications"]
        ],
    }

    cv_content = await ai_service.generate_cv_content(profile_dict, job_description)

    cv.cv_content = cv_content
    cv.status = "generating"
    await db.commit()

    user_dict = {
        "full_name": user.full_name,
        "email": user.email,
        "personal": profile_dict["personal"],
    }

    html_content = pdf_service.render_cv_html(cv_content, user_dict, template_id)

    pdf_bytes = pdf_service.generate_pdf(html_content)

    cv.status = "complete"
    cv.cv_content = {
        **cv_content,
        "_html": html_content,
    }
    await db.commit()

    logger.info(f"CV {cv_id} generated successfully")


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

    # Use provided values or fall back to existing
    new_job_description = job_description or cv.job_description
    new_template_id = template_id or cv.template_id
    new_title = title or cv.title

    # Update CV and reset status for regeneration
    cv.job_description = new_job_description
    cv.template_id = new_template_id
    cv.title = new_title
    cv.cv_content = None
    cv.status = "pending"
    cv.error_message = None
    await db.commit()

    return cv