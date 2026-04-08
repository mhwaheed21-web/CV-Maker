from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.cvs import router as cvs_router

app = FastAPI(
    title="CV Maker API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(cvs_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"status": "ok", "message": "CV Maker API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}