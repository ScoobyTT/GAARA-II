"""Serviço geoespacial de mapas e tabelas de ranking estadual (Substitui mapa.R e tabelaDados.R)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.spatial import SpatialMapResponse, StateIncidence, MunicipalityIncidence

class SpatialService:
    def get_map_data(self, uf: str = "Todos") -> SpatialMapResponse:
        raw = mock_repo.get_spatial_map(uf=uf)
        estados = [StateIncidence(**e) for e in raw["estados"]]
        municipios = [MunicipalityIncidence(**m) for m in raw["municipios"]]
        return SpatialMapResponse(
            nivel=raw["nivel"],
            uf_selecionada=uf,
            estados=estados,
            municipios=municipios
        )

spatial_service = SpatialService()
