from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.cv import GeneratedCV
from app.models.user import User
from app.services import ai_service, pdf_service
from app.services.profile_service import get_full_profile
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

    except Exception as e:
        import traceback
        logger.error(f"CV generation failed for {cv_id}: {e}")
        logger.error(traceback.format_exc())
        try:
            cv_result = await db.execute(
                select(GeneratedCV).where(GeneratedCV.id == cv_id)
            )
            cv = cv_result.scalar_one_or_none()
            if cv:
                cv.status = "failed"
                cv.error_message = str(e)
                await db.commit()
        except Exception:
            pass