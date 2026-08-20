"""Serviço de cálculo e agregação de KPIs gerais (Substitui outputCards.R)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.kpi import KPISummary

class KPIService:
    def get_summary(self, uf: str = "Todos", ano_inicio: int = 2014, ano_fim: int = 2026) -> KPISummary:
        raw = mock_repo.get_kpis(uf=uf, ano_inicio=ano_inicio, ano_fim=ano_fim)
        return KPISummary(**raw)

kpi_service = KPIService()
