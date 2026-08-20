# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.alerts import AlertSummaryResponse
from app.services.alerts_service import alerts_service

router = APIRouter()

@router.get("/summary", response_model=AlertSummaryResponse, summary="Alertas precoces ativos")
def get_alerts(
    uf: str = Query(default="Todos")
):
    return alerts_service.get_alerts_summary(uf=uf)
