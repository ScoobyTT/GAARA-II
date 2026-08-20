from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class StateIncidence(BaseModel):
    uf: str
    nome_estado: str
    regiao: str
    populacao: int
    casos_notificados: int
    casos_confirmados: int
    obitos: int
    incidencia_por_100k: float
    faixa_incidencia: str
    nivel_risco: str
    cor_hex: str

class MunicipalityIncidence(BaseModel):
    cod_municipio: str
    nome_municipio: str
    uf: str
    populacao: int
    casos: int
    incidencia_por_100k: float
    faixa_incidencia: str
    lat: Optional[float] = None
    lon: Optional[float] = None

class SpatialMapResponse(BaseModel):
    nivel: str = Field(description="'estado' ou 'municipio'")
    uf_selecionada: str
    estados: List[StateIncidence]
    municipios: List[MunicipalityIncidence] = []
