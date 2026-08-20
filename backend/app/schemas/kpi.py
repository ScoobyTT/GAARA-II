from pydantic import BaseModel, Field

class KPISummary(BaseModel):
    total_notificados: int = Field(description="Total acumulado de casos notificados")
    total_confirmados: int = Field(description="Total acumulado de casos confirmados")
    total_obitos_notificados: int = Field(description="Total de óbitos sob suspeita/notificados")
    total_obitos_confirmados: int = Field(description="Total de óbitos confirmados por dengue")
    taxa_letalidade: float = Field(description="Taxa de letalidade percentual (%)")
    incidencia_por_100k: float = Field(description="Taxa de incidência por 100 mil habitantes")
    uf: str = Field(description="UF selecionada ou 'BR'")
    ano_inicio: int = Field(description="Ano de início considerado")
    ano_fim: int = Field(description="Ano de término considerado")
