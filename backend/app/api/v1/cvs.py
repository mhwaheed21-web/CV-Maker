from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.cv import GeneratedCV
from app.schemas.cv import (
    CVGenerateRequest, CVStatusResponse,
    CVListResponse, CVDetailResponse
)
from app.services import cv_service
from app.services.pdf_service import render_cv_html, generate_pdf
from typing import List
import uuid

router = APIRouter(prefix="/cvs", tags=["cvs"])


@router.post("/generate", response_model=CVStatusResponse, status_code=202)
async def generate_cv(
    payload: CVGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    title = payload.title or f"CV — {payload.job_description[:40]}..."

    cv = GeneratedCV(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=title,
        job_description=payload.job_description,
        template_id=payload.template_id,
        status="pending",
    )
    db.add(cv)
    await db.commit()
    await db.refresh(cv)

    background_tasks.add_task(
        cv_service.run_generation_pipeline,
        cv_id=cv.id,
        user_id=current_user.id,
        job_description=payload.job_description,
        template_id=payload.template_id,
        db=db,
        user=current_user,
    )

    return cv


@router.get("/", response_model=List[CVListResponse])
async def list_cvs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await cv_service.get_user_cvs(db, current_user.id)


@router.get("/{cv_id}", response_model=CVDetailResponse)
async def get_cv(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cv = await cv_service.get_cv_by_id(db, current_user.id, cv_id)
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


@router.get("/{cv_id}/status", response_model=CVStatusResponse)
async def get_cv_status(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cv = await cv_service.get_cv_by_id(db, current_user.id, cv_id)
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


@router.get("/{cv_id}/download")
async def download_cv(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cv = await cv_service.get_cv_by_id(db, current_user.id, cv_id)
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    if cv.status != "complete":
        raise HTTPException(status_code=400, detail="CV is not ready yet")

    cv_content = cv.cv_content or {}

    user_result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = user_result.scalar_one_or_none()

    from app.services.profile_service import get_or_create_profile
    profile = await get_or_create_profile(db, current_user.id)

    user_dict = {
        "full_name": user.full_name,
        "email": user.email,
        "personal": {
            "phone": profile.phone,
            "location": profile.location,
            "linkedin_url": profile.linkedin_url,
            "portfolio_url": profile.portfolio_url,
        }
    }

    clean_content = {k: v for k, v in cv_content.items() if not k.startswith("_")}
    html_content = render_cv_html(clean_content, user_dict, cv.template_id)
    pdf_bytes = generate_pdf(html_content)

    filename = f"cv_{cv_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{cv_id}/preview")
async def preview_cv(
    cv_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GeneratedCV).where(GeneratedCV.id == cv_id)
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    if cv.status != "complete":
        raise HTTPException(status_code=400, detail="CV is not ready yet")

    cv_content = cv.cv_content or {}

    user_result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = user_result.scalar_one_or_none()

    from app.services.profile_service import get_or_create_profile
    profile = await get_or_create_profile(db, current_user.id)

    user_dict = {
        "full_name": user.full_name,
        "email": user.email,
        "personal": {
            "phone": profile.phone,
            "location": profile.location,
            "linkedin_url": profile.linkedin_url,
            "portfolio_url": profile.portfolio_url,
        }
    }

    clean_content = {k: v for k, v in cv_content.items() if not k.startswith("_")}
    html_content = render_cv_html(clean_content, user_dict, cv.template_id)

    return Response(content=html_content, media_type="text/html")


@router.delete("/{cv_id}", status_code=204)
async def delete_cv(
    cv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success = await cv_service.delete_cv(db, current_user.id, cv_id)
    if not success:
        raise HTTPException(status_code=404, detail="CV not found")