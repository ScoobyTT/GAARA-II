# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import List, Optional

class AlertNotification(BaseModel):
    id: str
    uf: str
    municipio: Optional[str] = None
    regiao: str
    nivel_risco: str = Field(description="'CRITICO', 'ALTO', 'MODERADO', 'BAIXO'")
    titulo: str
    descricao: str
    casos_recentes: int
    limiar_esperado: float
    variacao_percentual: float
    data_emissao: str
    acoes_recomendadas: List[str]

class AlertSummaryResponse(BaseModel):
    total_alertas_ativos: int
    alertas_criticos: int
    alertas_altos: int
    alertas_moderados: int
    alertas: List[AlertNotification]
