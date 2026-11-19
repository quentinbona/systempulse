from fastapi import APIRouter

from app.models.schemas import HealthResponse, MetricsResponse, SystemResponse
from app.services import metrics

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/system")
def system() -> SystemResponse:
    return metrics.collect_system()


@router.get("/metrics")
def snapshot() -> MetricsResponse:
    """Sample CPU, physical memory, and the filesystem containing the system root."""
    # FastAPI runs synchronous route handlers in its worker thread pool.
    return metrics.collect_metrics()
