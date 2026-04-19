from pydantic import BaseModel, EmailStr, constr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(strip_whitespace=True, min_length=8)
    full_name: constr(strip_whitespace=True, min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: constr(strip_whitespace=True, min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str

    class Config:
        from_attributes = True