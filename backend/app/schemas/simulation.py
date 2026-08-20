from pydantic import BaseModel, Field
from typing import List

class SimulationRequest(BaseModel):
    uf: str = Field(default="Todos")
    delta_temperatura: float = Field(default=0.0, description="Variação de temperatura em ºC (-5.0 a +5.0)")
    delta_precipitacao: float = Field(default=0.0, description="Variação de precipitação percentual (-50% a +50%)")
    delta_umidade: float = Field(default=0.0, description="Variação de umidade percentual (-30% a +30%)")
    semanas_projecao: int = Field(default=12, description="Número de semanas à frente para projetar")

class SimulationPoint(BaseModel):
    semana_projecao: int
    casos_baseline: int
    casos_simulados: int
    impacto_percentual: float
    risco_estimado: str

class SimulationResponse(BaseModel):
    uf: str
    delta_temperatura: float
    delta_precipitacao: float
    delta_umidade: float
    aumento_medio_casos_pct: float
    curva_projecao: List[SimulationPoint]
    nota_metodologica: str
