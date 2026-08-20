"""Serviço de análise demográfica e pirâmide etária (Substitui 2grafico.R e tabelaRaca.R)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.charts import AgePyramidResponse, PyramidBar

class DemographyService:
    def get_pyramid(self, uf: str = "Todos") -> AgePyramidResponse:
        raw_list = mock_repo.get_age_pyramid(uf=uf)
        bars = [PyramidBar(**item) for item in raw_list]
        return AgePyramidResponse(uf=uf, dados=bars)

demography_service = DemographyService()
