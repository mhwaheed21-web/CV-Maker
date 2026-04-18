from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ChatMessageCreate(BaseModel):
    content: str = Field(min_length=1)
    role: Literal["user", "assistant", "system"] = "user"


class ChatMessageResponse(BaseModel):
    id: str
    cv_id: str
    user_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
