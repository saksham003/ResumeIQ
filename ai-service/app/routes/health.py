from fastapi import APIRouter
from app.models.resume import HealthResponse
from app.utils.config import get_settings

router = APIRouter(tags=["Health"])

settings = get_settings()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the current health status and version of the service.",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        service=settings.app_name,
    )
