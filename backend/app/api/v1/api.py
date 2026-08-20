# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.api.v1.endpoints import kpi, temporal, demography, epidemiology, spatial, alerts, simulation

api_router = APIRouter()

api_router.include_router(kpi.router, prefix="/kpi", tags=["KPIs & Sumários"])
api_router.include_router(temporal.router, prefix="/temporal", tags=["Séries Temporais"])
api_router.include_router(demography.router, prefix="/demography", tags=["Demografia & Pirâmide Etária"])
api_router.include_router(epidemiology.router, prefix="/epidemiology", tags=["Epidemiologia & Canal Endêmico"])
api_router.include_router(spatial.router, prefix="/spatial", tags=["Geoespacial & Mapas"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Sistema de Alerta Precoce"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulação de Cenários"])
