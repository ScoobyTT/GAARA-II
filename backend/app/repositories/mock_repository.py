"""Repositório de dados em memória utilizando gerador determinístico de mocks."""

from typing import Dict, List, Any, Optional
from app.mocks.mock_data_generator import MockDataGenerator
from app.core.constants import ESTADOS_BRASIL, UF_LIST

class MockRepository:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MockRepository, cls).__new__(cls)
            cls._instance._init_data()
        return cls._instance

    def _init_data(self):
        generator = MockDataGenerator()
        self.kpis_data = generator.generate_kpis()
        self.temporal_data = generator.generate_temporal_evolution()
        self.pyramid_data = generator.generate_age_pyramids()
        self.control_data = generator.generate_control_diagrams()
        self.spatial_data = generator.generate_spatial_data()
        self.alerts_data = generator.generate_alerts()

    def get_kpis(self, uf: str = "Todos", ano_inicio: int = 2014, ano_fim: int = 2026) -> Dict[str, Any]:
        target = "Todos" if uf in ["Todos", "BR", ""] else uf
        base = self.kpis_data.get(target, self.kpis_data["Todos"]).copy()

        # Ajusta proporcionalmente para o intervalo de anos selecionado
        anos_total = 13  # 2014 a 2026
        anos_filtrados = max(1, min(ano_fim, 2026) - max(ano_inicio, 2014) + 1)
        fator_ano = anos_filtrados / anos_total

        # Cálculo dinâmico ajustado
        notificados = int(base["total_notificados"] * fator_ano)
        confirmados = int(base["total_confirmados"] * fator_ano)
        obitos_noti = int(base["total_obitos_notificados"] * fator_ano)
        obitos_conf = int(base["total_obitos_confirmados"] * fator_ano)
        populacao = base["populacao"]

        return {
            "uf": target,
            "total_notificados": notificados,
            "total_confirmados": confirmados,
            "total_obitos_notificados": obitos_noti,
            "total_obitos_confirmados": obitos_conf,
            "taxa_letalidade": round((obitos_conf / max(1, confirmados)) * 100, 3),
            "incidencia_por_100k": round((notificados / populacao) * 100000, 2),
            "ano_inicio": ano_inicio,
            "ano_fim": ano_fim
        }

    def get_temporal_evolution(self, uf: str = "Todos", ano_inicio: int = 2014, ano_fim: int = 2026) -> List[Dict[str, Any]]:
        target = "Todos" if uf in ["Todos", "BR", ""] else uf
        serie = self.temporal_data.get(target, self.temporal_data["Todos"])
        
        # Filtra por período de anos
        filtrados = [
            item for item in serie
            if ano_inicio <= item["ano"] <= ano_fim
        ]
        return filtrados

    def get_age_pyramid(self, uf: str = "Todos") -> List[Dict[str, Any]]:
        target = "Todos" if uf in ["Todos", "BR", ""] else uf
        return self.pyramid_data.get(target, self.pyramid_data["Todos"])

    def get_control_diagram(self, uf: str = "Todos") -> List[Dict[str, Any]]:
        target = "Todos" if uf in ["Todos", "BR", ""] else uf
        return self.control_data.get(target, self.control_data["Todos"])

    def get_spatial_map(self, uf: str = "Todos") -> Dict[str, Any]:
        estados = self.spatial_data["estados"]
        municipios = self.spatial_data["municipios"]
        if uf not in ["Todos", "BR", ""]:
            municipios = [m for m in municipios if m["uf"] == uf]
        return {
            "nivel": "estado" if uf in ["Todos", "BR", ""] else "municipio",
            "uf_selecionada": uf,
            "estados": estados,
            "municipios": municipios
        }

    def get_alerts(self) -> List[Dict[str, Any]]:
        return self.alerts_data

mock_repo = MockRepository()
