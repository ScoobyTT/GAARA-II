"""Serviço epidemiológico para Diagrama de Controle e Canais Endêmicos (Substitui diagramaControle.R)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.charts import ControlDiagramResponse, ControlPoint
from app.core.constants import BRASIL_POPULATION, UF_POPULATION_MAP

class EpidemiologyService:
    def get_control_diagram(self, uf: str = "Todos") -> ControlDiagramResponse:
        raw_list = mock_repo.get_control_diagram(uf=uf)
        pop = BRASIL_POPULATION if uf in ["Todos", "BR", ""] else UF_POPULATION_MAP.get(uf, BRASIL_POPULATION)
        points = [ControlPoint(**item) for item in raw_list]
        return ControlDiagramResponse(uf=uf, populacao_base=pop, dados=points)

epidemiology_service = EpidemiologyService()
