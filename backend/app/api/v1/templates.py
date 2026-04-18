from fastapi import APIRouter

from app.utils.templates import TEMPLATE_METADATA

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/")
async def list_templates():
    return TEMPLATE_METADATA
