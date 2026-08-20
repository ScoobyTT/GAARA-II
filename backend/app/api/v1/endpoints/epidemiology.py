# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Query
from app.schemas.charts import ControlDiagramResponse
from app.services.epidemiology_service import epidemiology_service

router = APIRouter()

@router.get("/control-diagram", response_model=ControlDiagramResponse, summary="Diagrama de controle e canal endêmico")
def get_control_diagram(
    uf: str = Query(default="Todos")
):
    return epidemiology_service.get_control_diagram(uf=uf)
