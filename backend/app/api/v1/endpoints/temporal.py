# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.charts import TemporalEvolutionResponse
from app.services.temporal_service import temporal_service

router = APIRouter()

@router.get("/evolution", response_model=TemporalEvolutionResponse, summary="Evolução temporal histórica dos casos")
def get_temporal_evolution(
    uf: str = Query(default="Todos"),
    ano_inicio: int = Query(default=2014, ge=2014, le=2026),
    ano_fim: int = Query(default=2026, ge=2014, le=2026)
):
    return temporal_service.get_evolution(uf=uf, ano_inicio=ano_inicio, ano_fim=ano_fim)

