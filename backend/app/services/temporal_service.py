"""Serviço de séries temporais de casos (Substitui 1grafico.R e graphs.R)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.charts import TemporalEvolutionResponse, TemporalPoint

class TemporalService:
    def get_evolution(self, uf: str = "Todos", ano_inicio: int = 2014, ano_fim: int = 2026) -> TemporalEvolutionResponse:
        raw_list = mock_repo.get_temporal_evolution(uf=uf, ano_inicio=ano_inicio, ano_fim=ano_fim)
        points = [TemporalPoint(**item) for item in raw_list]
        return TemporalEvolutionResponse(uf=uf, dados=points)

temporal_service = TemporalService()

