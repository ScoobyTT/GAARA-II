# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.spatial import SpatialMapResponse
from app.services.spatial_service import spatial_service

router = APIRouter()

@router.get("/map", response_model=SpatialMapResponse, summary="Dados espaciais para mapas e tabelas territoriais")
def get_spatial_map(
    uf: str = Query(default="Todos")
):
    return spatial_service.get_map_data(uf=uf)
