# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import simulation_service

router = APIRouter()

@router.post("/predict", response_model=SimulationResponse, summary="Simulação de cenários climáticos/epidemiológicos")
def simulate_scenario(req: SimulationRequest):
    return simulation_service.simulate_scenario(req)
