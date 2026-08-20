from pydantic import BaseModel, Field
from typing import Optional

class DashboardFilter(BaseModel):
    uf: str = Field(default="Todos", description="Sigla da UF (ex: 'SP', 'BA', 'DF') ou 'Todos' para o Brasil")
    ano_inicio: Optional[int] = Field(default=2014, description="Ano inicial do período")
    ano_fim: Optional[int] = Field(default=2026, description="Ano final do período")
    semana_inicio: Optional[int] = Field(default=1, description="Semana epidemiológica inicial (1-52)")
    semana_fim: Optional[int] = Field(default=52, description="Semana epidemiológica final (1-52)")
