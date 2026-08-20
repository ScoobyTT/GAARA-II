"""Gerador determinístico de dados mockados realistas para o GAARA-II.
Produz séries temporais, pirâmides etárias, canais endêmicos e indicadores geoespaciais
para o Brasil e todas as 27 Unidades da Federação.
"""

import json
import math
import os
from typing import Dict, List, Any
from app.core.constants import (
    ESTADOS_BRASIL, UF_LIST, UF_POPULATION_MAP, BRASIL_POPULATION,
    FAIXAS_ETARIAS, REGIOES_MAP
)

class MockDataGenerator:
    def __init__(self, seed: int = 42):
        self.seed = seed

    def _pseudo_random(self, x: float) -> float:
        """Função pseudo-randômica determinística baseada em seno."""
        val = math.sin(x * 12.9898 + self.seed * 78.233) * 43758.5453
        return val - math.floor(val)

    def generate_kpis(self) -> Dict[str, Any]:
        """Gera KPIs globais e por UF."""
        kpis = {}
        
        # Gera para o Brasil como um todo
        total_noti_br = 0
        total_conf_br = 0
        total_obit_noti_br = 0
        total_obit_conf_br = 0

        for est in ESTADOS_BRASIL:
            uf = est["uf"]
            pop = est["populacao"]
            pop_factor = pop / BRASIL_POPULATION

            # Fator epidemiológico por estado (ex: Sudeste/Centro-Oeste tiveram picos maiores em 2024)
            regiao_factor = {
                "Sudeste": 1.4,
                "Centro-Oeste": 1.6,
                "Sul": 1.2,
                "Nordeste": 0.8,
                "Norte": 0.7
            }.get(est["regiao"], 1.0)

            base_noti = int(6600000 * pop_factor * regiao_factor * 1.5)
            base_conf = int(base_noti * 0.62)
            base_obit_noti = int(base_conf * 0.0018)
            base_obit_conf = int(base_conf * 0.00095)

            total_noti_br += base_noti
            total_conf_br += base_conf
            total_obit_noti_br += base_obit_noti
            total_obit_conf_br += base_obit_conf

            kpis[uf] = {
                "uf": uf,
                "nome_estado": est["nome"],
                "regiao": est["regiao"],
                "populacao": pop,
                "total_notificados": base_noti,
                "total_confirmados": base_conf,
                "total_obitos_notificados": base_obit_noti,
                "total_obitos_confirmados": base_obit_conf,
                "taxa_letalidade": round((base_obit_conf / max(1, base_conf)) * 100, 3),
                "incidencia_por_100k": round((base_noti / pop) * 100000, 2)
            }

        kpis["Todos"] = {
            "uf": "BR",
            "nome_estado": "Brasil",
            "regiao": "Nacional",
            "populacao": BRASIL_POPULATION,
            "total_notificados": total_noti_br,
            "total_confirmados": total_conf_br,
            "total_obitos_notificados": total_obit_noti_br,
            "total_obitos_confirmados": total_obit_conf_br,
            "taxa_letalidade": round((total_obit_conf_br / max(1, total_conf_br)) * 100, 3),
            "incidencia_por_100k": round((total_noti_br / BRASIL_POPULATION) * 100000, 2)
        }
        kpis["BR"] = kpis["Todos"]
        return kpis

    def generate_temporal_evolution(self) -> Dict[str, List[Dict[str, Any]]]:
        """Gera a série temporal mensal de 2014 a 2026."""
        temporal = {uf: [] for uf in UF_LIST}
        temporal["Todos"] = []
        temporal["BR"] = temporal["Todos"]

        months_list = []
        for ano in range(2014, 2027):
            for mes in range(1, 13):
                months_list.append((ano, mes, f"{ano}-{mes:02d}-01"))

        # Sazonalidade típica de dengue no Brasil: pico entre meses 2 e 5 (fev-mai)
        sazonalidade = {
            1: 1.2, 2: 2.1, 3: 2.8, 4: 2.5, 5: 1.6, 6: 0.8,
            7: 0.4, 8: 0.3, 9: 0.4, 10: 0.6, 11: 0.8, 12: 1.0
        }

        # Multiplicadores de ano epidêmico (ex: 2015, 2019, 2024 = epidemias severas)
        ano_peso = {
            2014: 0.6, 2015: 1.7, 2016: 1.5, 2017: 0.3, 2018: 0.3,
            2019: 1.6, 2020: 0.9, 2021: 0.5, 2022: 1.4, 2023: 1.6,
            2024: 3.8, 2025: 1.8, 2026: 1.2
        }

        for ano, mes, data_str in months_list:
            br_noti = 0
            br_conf = 0

            for est in ESTADOS_BRASIL:
                uf = est["uf"]
                pop = est["populacao"]
                pop_norm = pop / 1000000.0

                rand_factor = 0.85 + 0.3 * self._pseudo_random(ano * 100 + mes + len(uf))
                noti = int(pop_norm * 450 * sazonalidade[mes] * ano_peso[ano] * rand_factor)
                conf = int(noti * (0.55 + 0.15 * self._pseudo_random(ano + mes)))

                temporal[uf].append({
                    "data_mes": data_str,
                    "ano": ano,
                    "mes": mes,
                    "casos_notificados": noti,
                    "casos_confirmados": conf
                })

                br_noti += noti
                br_conf += conf

            temporal["Todos"].append({
                "data_mes": data_str,
                "ano": ano,
                "mes": mes,
                "casos_notificados": br_noti,
                "casos_confirmados": br_conf
            })

        return temporal

    def generate_age_pyramids(self) -> Dict[str, List[Dict[str, Any]]]:
        """Gera distribuição etária e por sexo."""
        pyramids = {}
        faixa_pesos = {
            "0-4": 0.05, "5-9": 0.07, "10-19": 0.16, "20-29": 0.22,
            "30-39": 0.19, "40-49": 0.14, "50-59": 0.09, "60-69": 0.05,
            "70-79": 0.02, "80+": 0.01
        }

        for target in ["Todos", "BR"] + UF_LIST:
            target_list = []
            base_val = 150000 if target in ["Todos", "BR"] else 8000
            
            for faixa in FAIXAS_ETARIAS:
                peso = faixa_pesos[faixa]
                
                # Feminino (costuma ter leve predomínio em notificações)
                f_noti = int(base_val * peso * 1.08)
                f_conf = int(f_noti * 0.65)
                target_list.append({
                    "faixa_etaria": faixa,
                    "sexo": "F",
                    "casos_notificados": f_noti,
                    "casos_confirmados": f_conf
                })

                # Masculino
                m_noti = int(base_val * peso * 0.92)
                m_conf = int(m_noti * 0.62)
                target_list.append({
                    "faixa_etaria": faixa,
                    "sexo": "M",
                    "casos_notificados": m_noti,
                    "casos_confirmados": m_conf
                })

            pyramids[target] = target_list

        return pyramids

    def generate_control_diagrams(self) -> Dict[str, List[Dict[str, Any]]]:
        """Gera o diagrama de controle (Canal Endêmico: Q1, Mediana, Q3 e Incidência Atual)."""
        diagrams = {}

        for target in ["Todos", "BR"] + UF_LIST:
            pop = BRASIL_POPULATION if target in ["Todos", "BR"] else UF_POPULATION_MAP[target]
            target_list = []

            for sem in range(1, 53):
                # Curva sazonal em sino nas semanas 8 a 22 (fev a mai)
                saz = math.exp(-((sem - 14) ** 2) / 60.0) * 120.0 + 15.0
                
                q1 = round(saz * 0.7, 1)
                mediana = round(saz * 1.0, 1)
                q3 = round(saz * 1.45, 1)

                # Incidência do ano recente (com pico epidêmico extrapolando o canal)
                inc_atual = round(saz * (1.1 + 0.8 * math.exp(-((sem - 13) ** 2) / 25.0)), 1)
                em_alerta = inc_atual > q3

                target_list.append({
                    "semana_epi": sem,
                    "q1": q1,
                    "mediana": mediana,
                    "q3": q3,
                    "incidencia_atual": inc_atual,
                    "em_alerta": em_alerta
                })

            diagrams[target] = target_list

        return diagrams

    def generate_spatial_data(self) -> Dict[str, Any]:
        """Gera dados geográficos consolidados por estado e municípios representativos."""
        kpis = self.generate_kpis()
        estados_list = []

        for est in ESTADOS_BRASIL:
            uf = est["uf"]
            k = kpis[uf]
            inc = k["incidencia_por_100k"]

            if inc <= 100:
                faixa = "0–100"
                risco = "Baixo"
                cor = "#fee5d9"
            elif inc <= 500:
                faixa = "101–500"
                risco = "Moderado"
                cor = "#fcae91"
            elif inc <= 2500:
                faixa = "501–2500"
                risco = "Alto"
                cor = "#fb6a4a"
            elif inc <= 10000:
                faixa = "2501–10k"
                risco = "Muito Alto"
                cor = "#de2d26"
            else:
                faixa = ">10k"
                risco = "Crítico"
                cor = "#a50f15"

            estados_list.append({
                "uf": uf,
                "nome_estado": est["nome"],
                "regiao": est["regiao"],
                "populacao": est["populacao"],
                "casos_notificados": k["total_notificados"],
                "casos_confirmados": k["total_confirmados"],
                "obitos": k["total_obitos_confirmados"],
                "incidencia_por_100k": inc,
                "faixa_incidencia": faixa,
                "nivel_risco": risco,
                "cor_hex": cor
            })

        # Municípios mockados principais de referência
        municipios_destaque = [
            {"cod": "5300108", "nome": "Brasília", "uf": "DF", "pop": 2817068, "casos": 285400, "lat": -15.7975, "lon": -47.8919},
            {"cod": "3550308", "nome": "São Paulo", "uf": "SP", "pop": 11451245, "casos": 620000, "lat": -23.5505, "lon": -46.6333},
            {"cod": "3304557", "nome": "Rio de Janeiro", "uf": "RJ", "pop": 6211423, "casos": 310500, "lat": -22.9068, "lon": -43.1729},
            {"cod": "3106200", "nome": "Belo Horizonte", "uf": "MG", "pop": 2315560, "casos": 298000, "lat": -19.9167, "lon": -43.9345},
            {"cod": "2927408", "nome": "Salvador", "uf": "BA", "pop": 2418005, "casos": 78000, "lat": -12.9714, "lon": -38.5014},
            {"cod": "4106902", "nome": "Curitiba", "uf": "PR", "pop": 1773733, "casos": 145000, "lat": -25.4284, "lon": -49.2733},
            {"cod": "5208707", "nome": "Goiânia", "uf": "GO", "pop": 1437237, "casos": 112000, "lat": -16.6869, "lon": -49.2648},
        ]

        muni_res = []
        for m in municipios_destaque:
            inc = round((m["casos"] / m["pop"]) * 100000, 2)
            faixa = ">10k" if inc > 10000 else ("2501–10k" if inc > 2500 else ("501–2500" if inc > 500 else "101–500"))
            muni_res.append({
                "cod_municipio": m["cod"],
                "nome_municipio": m["nome"],
                "uf": m["uf"],
                "populacao": m["pop"],
                "casos": m["casos"],
                "incidencia_por_100k": inc,
                "faixa_incidencia": faixa,
                "lat": m["lat"],
                "lon": m["lon"]
            })

        return {
            "estados": estados_list,
            "municipios": muni_res
        }

    def generate_alerts(self) -> List[Dict[str, Any]]:
        """Gera lista de alertas epidemiológicos ativos."""
        return [
            {
                "id": "ALT-2026-001",
                "uf": "DF",
                "municipio": "Brasília",
                "regiao": "Centro-Oeste",
                "nivel_risco": "CRITICO",
                "titulo": "Surto epidêmico acima do limiar superior (Q3)",
                "descricao": "Taxa de transmissão acelerada nas últimas 3 semanas epidemiológicas com ultrapassagem de 180% do canal endêmico.",
                "casos_recentes": 14820,
                "limiar_esperado": 5200.0,
                "variacao_percentual": 185.0,
                "data_emissao": "2026-04-10",
                "acoes_recomendadas": [
                    "Intensificação imediata do fumacê e bloqueio vetorial em focos residenciais",
                    "Abertura de tendas de hidratação rápida nas UPAs",
                    "Convocação do comitê de emergência de saúde pública"
                ]
            },
            {
                "id": "ALT-2026-002",
                "uf": "MG",
                "municipio": "Belo Horizonte",
                "regiao": "Sudeste",
                "nivel_risco": "ALTO",
                "titulo": "Elevação sustentada da taxa de positividade de DENV",
                "descricao": "Índice de infestação predial (LIRAa) acima de 3.9% com concentração nos distritos centro-sul e leste.",
                "casos_recentes": 22400,
                "limiar_esperado": 14000.0,
                "variacao_percentual": 60.0,
                "data_emissao": "2026-04-08",
                "acoes_recomendadas": [
                    "Mobilização de agentes comunitários de endemias (ACE)",
                    "Alerta para a rede de atenção básica sobre triagem de sinais de alarme"
                ]
            },
            {
                "id": "ALT-2026-003",
                "uf": "SP",
                "municipio": "Campinas",
                "regiao": "Sudeste",
                "nivel_risco": "MODERADO",
                "titulo": "Aumento no índice de notificações precoces",
                "descricao": "Casos notificados semanais crescendo 25% acima da mediana histórica sazonal.",
                "casos_recentes": 8900,
                "limiar_esperado": 7100.0,
                "variacao_percentual": 25.3,
                "data_emissao": "2026-04-05",
                "acoes_recomendadas": [
                    "Reforço de ações educativas nas escolas e mídias locais",
                    "Monitoramento entomológico em armadilhas de oviposição"
                ]
            }
        ]

    def dump_all_mocks_to_disk(self, output_dir: str):
        """Salva todos os datasets gerados em arquivos JSON prontos para consumo."""
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, "kpis.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_kpis(), f, indent=2, ensure_ascii=False)

        with open(os.path.join(output_dir, "temporal.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_temporal_evolution(), f, indent=2, ensure_ascii=False)

        with open(os.path.join(output_dir, "pyramids.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_age_pyramids(), f, indent=2, ensure_ascii=False)

        with open(os.path.join(output_dir, "control_diagrams.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_control_diagrams(), f, indent=2, ensure_ascii=False)

        with open(os.path.join(output_dir, "spatial.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_spatial_data(), f, indent=2, ensure_ascii=False)

        with open(os.path.join(output_dir, "alerts.json"), "w", encoding="utf-8") as f:
            json.dump(self.generate_alerts(), f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    generator = MockDataGenerator()
    generator.dump_all_mocks_to_disk("app/mocks/data")
    print("Mocks gerados com sucesso em app/mocks/data!")
