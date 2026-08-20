# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.kpi import KPISummary
from app.services.kpi_service import kpi_service

router = APIRouter()

@router.get("/summary", response_model=KPISummary, summary="Obter sumário de KPIs e indicadores")
def get_kpi_summary(
    uf: str = Query(default="Todos", description="UF ou 'Todos'"),
    ano_inicio: int = Query(default=2014, ge=2014, le=2026),
    ano_fim: int = Query(default=2026, ge=2014, le=2026)
):
    return kpi_service.get_summary(uf=uf, ano_inicio=ano_inicio, ano_fim=ano_fim)
