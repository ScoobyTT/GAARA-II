# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.charts import AgePyramidResponse
from app.services.demography_service import demography_service

router = APIRouter()

@router.get("/pyramid", response_model=AgePyramidResponse, summary="Pirâmide etária e distribuição por sexo")
def get_age_pyramid(
    uf: str = Query(default="Todos")
):
    return demography_service.get_pyramid(uf=uf)
