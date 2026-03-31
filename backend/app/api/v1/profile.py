from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.profile import (
    ProfilePersonalUpdate, ProfilePersonalResponse,
    WorkExperienceCreate, WorkExperienceResponse,
    EducationCreate, EducationResponse,
    SkillCreate, SkillResponse,
    ProjectCreate, ProjectResponse,
    CertificationCreate, CertificationResponse,
    FullProfileResponse
)
from app.services import profile_service
from typing import List

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=FullProfileResponse)
async def get_full_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_full_profile(db, current_user.id)


@router.put("/personal", response_model=ProfilePersonalResponse)
async def update_personal(
    data: ProfilePersonalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.update_personal(db, current_user.id, data)


@router.get("/experience", response_model=List[WorkExperienceResponse])
async def get_experience(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_experience(db, current_user.id)


@router.post("/experience", response_model=WorkExperienceResponse, status_code=201)
async def add_experience(
    data: WorkExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.add_experience(db, current_user.id, data)


@router.put("/experience/{exp_id}", response_model=WorkExperienceResponse)
async def update_experience(
    exp_id: str,
    data: WorkExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await profile_service.update_experience(db, current_user.id, exp_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result


@router.delete("/experience/{exp_id}", status_code=204)
async def delete_experience(
    exp_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await profile_service.delete_experience(db, current_user.id, exp_id)
    if not success:
        raise HTTPException(status_code=404, detail="Experience not found")


@router.get("/education", response_model=List[EducationResponse])
async def get_education(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_education(db, current_user.id)


@router.post("/education", response_model=EducationResponse, status_code=201)
async def add_education(
    data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.add_education(db, current_user.id, data)


@router.put("/education/{edu_id}", response_model=EducationResponse)
async def update_education(
    edu_id: str,
    data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await profile_service.update_education(db, current_user.id, edu_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Education not found")
    return result


@router.delete("/education/{edu_id}", status_code=204)
async def delete_education(
    edu_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await profile_service.delete_education(db, current_user.id, edu_id)
    if not success:
        raise HTTPException(status_code=404, detail="Education not found")


@router.get("/skills", response_model=List[SkillResponse])
async def get_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_skills(db, current_user.id)


@router.post("/skills", response_model=List[SkillResponse])
async def upsert_skills(
    skills: List[SkillCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.bulk_upsert_skills(db, current_user.id, skills)


@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_projects(db, current_user.id)


@router.post("/projects", response_model=ProjectResponse, status_code=201)
async def add_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.add_project(db, current_user.id, data)


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await profile_service.update_project(db, current_user.id, project_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return result


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await profile_service.delete_project(db, current_user.id, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")


@router.get("/certifications", response_model=List[CertificationResponse])
async def get_certifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.get_certifications(db, current_user.id)


@router.post("/certifications", response_model=CertificationResponse, status_code=201)
async def add_certification(
    data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await profile_service.add_certification(db, current_user.id, data)


@router.put("/certifications/{cert_id}", response_model=CertificationResponse)
async def update_certification(
    cert_id: str,
    data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await profile_service.update_certification(db, current_user.id, cert_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Certification not found")
    return result


@router.delete("/certifications/{cert_id}", status_code=204)
async def delete_certification(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await profile_service.delete_certification(db, current_user.id, cert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certification not found")