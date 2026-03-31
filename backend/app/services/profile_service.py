from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.profile import (
    Profile, WorkExperience, Education,
    Skill, Project, Certification
)
from app.schemas.profile import (
    ProfilePersonalUpdate, WorkExperienceCreate,
    EducationCreate, SkillCreate, ProjectCreate, CertificationCreate
)


async def get_or_create_profile(db: AsyncSession, user_id: str) -> Profile:
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def update_personal(db: AsyncSession, user_id: str, data: ProfilePersonalUpdate) -> Profile:
    profile = await get_or_create_profile(db, user_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_experience(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(WorkExperience)
        .where(WorkExperience.user_id == user_id)
        .order_by(WorkExperience.display_order)
    )
    return result.scalars().all()


async def add_experience(db: AsyncSession, user_id: str, data: WorkExperienceCreate) -> WorkExperience:
    exp = WorkExperience(user_id=user_id, **data.model_dump())
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp


async def update_experience(db: AsyncSession, user_id: str, exp_id: str, data: WorkExperienceCreate):
    result = await db.execute(
        select(WorkExperience).where(
            WorkExperience.id == exp_id,
            WorkExperience.user_id == user_id
        )
    )
    exp = result.scalar_one_or_none()
    if not exp:
        return None
    for field, value in data.model_dump().items():
        setattr(exp, field, value)
    await db.commit()
    await db.refresh(exp)
    return exp


async def delete_experience(db: AsyncSession, user_id: str, exp_id: str) -> bool:
    result = await db.execute(
        select(WorkExperience).where(
            WorkExperience.id == exp_id,
            WorkExperience.user_id == user_id
        )
    )
    exp = result.scalar_one_or_none()
    if not exp:
        return False
    await db.delete(exp)
    await db.commit()
    return True


async def get_education(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Education)
        .where(Education.user_id == user_id)
        .order_by(Education.display_order)
    )
    return result.scalars().all()


async def add_education(db: AsyncSession, user_id: str, data: EducationCreate) -> Education:
    edu = Education(user_id=user_id, **data.model_dump())
    db.add(edu)
    await db.commit()
    await db.refresh(edu)
    return edu


async def update_education(db: AsyncSession, user_id: str, edu_id: str, data: EducationCreate):
    result = await db.execute(
        select(Education).where(
            Education.id == edu_id,
            Education.user_id == user_id
        )
    )
    edu = result.scalar_one_or_none()
    if not edu:
        return None
    for field, value in data.model_dump().items():
        setattr(edu, field, value)
    await db.commit()
    await db.refresh(edu)
    return edu


async def delete_education(db: AsyncSession, user_id: str, edu_id: str) -> bool:
    result = await db.execute(
        select(Education).where(
            Education.id == edu_id,
            Education.user_id == user_id
        )
    )
    edu = result.scalar_one_or_none()
    if not edu:
        return False
    await db.delete(edu)
    await db.commit()
    return True


async def get_skills(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Skill).where(Skill.user_id == user_id)
    )
    return result.scalars().all()


async def bulk_upsert_skills(db: AsyncSession, user_id: str, skills: list[SkillCreate]):
    await db.execute(delete(Skill).where(Skill.user_id == user_id))
    new_skills = [Skill(user_id=user_id, **s.model_dump()) for s in skills]
    db.add_all(new_skills)
    await db.commit()
    result = await db.execute(select(Skill).where(Skill.user_id == user_id))
    return result.scalars().all()


async def get_projects(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.display_order)
    )
    return result.scalars().all()


async def add_project(db: AsyncSession, user_id: str, data: ProjectCreate) -> Project:
    project = Project(user_id=user_id, **data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, user_id: str, project_id: str, data: ProjectCreate):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        return None
    for field, value in data.model_dump().items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, user_id: str, project_id: str) -> bool:
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        return False
    await db.delete(project)
    await db.commit()
    return True


async def get_certifications(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Certification).where(Certification.user_id == user_id)
    )
    return result.scalars().all()


async def add_certification(db: AsyncSession, user_id: str, data: CertificationCreate) -> Certification:
    cert = Certification(user_id=user_id, **data.model_dump())
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def update_certification(db: AsyncSession, user_id: str, cert_id: str, data: CertificationCreate):
    result = await db.execute(
        select(Certification).where(
            Certification.id == cert_id,
            Certification.user_id == user_id
        )
    )
    cert = result.scalar_one_or_none()
    if not cert:
        return None
    for field, value in data.model_dump().items():
        setattr(cert, field, value)
    await db.commit()
    await db.refresh(cert)
    return cert


async def delete_certification(db: AsyncSession, user_id: str, cert_id: str) -> bool:
    result = await db.execute(
        select(Certification).where(
            Certification.id == cert_id,
            Certification.user_id == user_id
        )
    )
    cert = result.scalar_one_or_none()
    if not cert:
        return False
    await db.delete(cert)
    await db.commit()
    return True


async def get_full_profile(db: AsyncSession, user_id: str) -> dict:
    profile = await get_or_create_profile(db, user_id)
    experience = await get_experience(db, user_id)
    education = await get_education(db, user_id)
    skills = await get_skills(db, user_id)
    projects = await get_projects(db, user_id)
    certifications = await get_certifications(db, user_id)

    return {
        "personal": profile,
        "experience": experience,
        "education": education,
        "skills": skills,
        "projects": projects,
        "certifications": certifications,
    }