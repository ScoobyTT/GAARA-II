# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import List

# --- Gráfico 1: Evolução Temporal de Casos ---
class TemporalPoint(BaseModel):
    data_mes: str = Field(description="Data no formato YYYY-MM-DD")
    ano: int
    mes: int
    casos_notificados: int
    casos_confirmados: int

class TemporalEvolutionResponse(BaseModel):
    uf: str
    dados: List[TemporalPoint]

# --- Gráfico 2: Pirâmide Etária ---
class PyramidBar(BaseModel):
    faixa_etaria: str
    sexo: str = Field(description="'M' ou 'F'")
    casos_notificados: int
    casos_confirmados: int

class AgePyramidResponse(BaseModel):
    uf: str
    dados: List[PyramidBar]

# --- Gráfico 3: Diagrama de Controle / Canal Endêmico ---
class ControlPoint(BaseModel):
    semana_epi: int = Field(description="Semana Epidemiológica (1 a 52)")
    q1: float = Field(description="Primeiro quartil (limite inferior do canal)")
    mediana: float = Field(description="Mediana histórica")
    q3: float = Field(description="Terceiro quartil (limite superior do canal / alerta)")
    incidencia_atual: float = Field(description="Coeficiente de incidência por 100 mil hab. atual")
    em_alerta: bool = Field(description="True se incidência atual ultrapassa Q3")

class ControlDiagramResponse(BaseModel):
    uf: str
    populacao_base: int
    dados: List[ControlPoint]
