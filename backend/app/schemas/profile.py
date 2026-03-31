from pydantic import BaseModel
from typing import Optional, List


class ProfilePersonalUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    professional_summary: Optional[str] = None


class ProfilePersonalResponse(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    professional_summary: Optional[str] = None

    class Config:
        from_attributes = True


class WorkExperienceCreate(BaseModel):
    job_title: str
    company_name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    responsibilities: Optional[List[str]] = []
    display_order: int = 0


class WorkExperienceResponse(WorkExperienceCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class EducationCreate(BaseModel):
    degree: str
    institution: str
    graduation_year: Optional[int] = None
    gpa: Optional[str] = None
    display_order: int = 0


class EducationResponse(EducationCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None


class SkillResponse(SkillCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    url: Optional[str] = None
    display_order: int = 0


class ProjectResponse(ProjectCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class CertificationCreate(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None


class CertificationResponse(CertificationCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class FullProfileResponse(BaseModel):
    personal: Optional[ProfilePersonalResponse] = None
    experience: List[WorkExperienceResponse] = []
    education: List[EducationResponse] = []
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []