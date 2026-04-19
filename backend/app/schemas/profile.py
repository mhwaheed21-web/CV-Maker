from pydantic import BaseModel, Field, constr
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
    job_title: constr(strip_whitespace=True, min_length=1)
    company_name: constr(strip_whitespace=True, min_length=1)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    responsibilities: List[str] = Field(default_factory=list)
    display_order: int = 0


class WorkExperienceResponse(WorkExperienceCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class EducationCreate(BaseModel):
    degree: constr(strip_whitespace=True, min_length=1)
    institution: constr(strip_whitespace=True, min_length=1)
    graduation_year: Optional[int] = None
    gpa: Optional[str] = None
    display_order: int = 0


class EducationResponse(EducationCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    name: constr(strip_whitespace=True, min_length=1)
    category: Optional[str] = None
    proficiency: Optional[str] = None


class SkillResponse(SkillCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: constr(strip_whitespace=True, min_length=1)
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = None
    display_order: int = 0


class ProjectResponse(ProjectCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class CertificationCreate(BaseModel):
    name: constr(strip_whitespace=True, min_length=1)
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
    experience: List[WorkExperienceResponse] = Field(default_factory=list)
    education: List[EducationResponse] = Field(default_factory=list)
    skills: List[SkillResponse] = Field(default_factory=list)
    projects: List[ProjectResponse] = Field(default_factory=list)
    certifications: List[CertificationResponse] = Field(default_factory=list)