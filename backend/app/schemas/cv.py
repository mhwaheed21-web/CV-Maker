from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CVGenerateRequest(BaseModel):
    job_description: str
    template_id: str = "minimal"
    title: Optional[str] = None


class CVRegenerateRequest(BaseModel):
    job_description: Optional[str] = None
    template_id: Optional[str] = None
    title: Optional[str] = None


class CVStatusResponse(BaseModel):
    id: str
    status: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class CVListResponse(BaseModel):
    id: str
    title: str
    status: str
    template_id: str
    job_description: str
    created_at: datetime

    class Config:
        from_attributes = True


class CVDetailResponse(BaseModel):
    id: str
    title: str
    status: str
    template_id: str
    job_description: str
    cv_content: Optional[dict] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True