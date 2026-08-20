"""Constantes e definições de domínio epidemiológico e geográfico do Brasil."""

ESTADOS_BRASIL = [
    {"uf": "AC", "nome": "Acre", "regiao": "Norte", "populacao": 830026},
    {"uf": "AL", "nome": "Alagoas", "regiao": "Nordeste", "populacao": 3127511},
    {"uf": "AP", "nome": "Amapá", "regiao": "Norte", "populacao": 733508},
    {"uf": "AM", "nome": "Amazonas", "regiao": "Norte", "populacao": 3941175},
    {"uf": "BA", "nome": "Bahia", "regiao": "Nordeste", "populacao": 14136417},
    {"uf": "CE", "nome": "Ceará", "regiao": "Nordeste", "populacao": 8791688},
    {"uf": "DF", "nome": "Distrito Federal", "regiao": "Centro-Oeste", "populacao": 2817068},
    {"uf": "ES", "nome": "Espírito Santo", "regiao": "Sudeste", "populacao": 3833486},
    {"uf": "GO", "nome": "Goiás", "regiao": "Centro-Oeste", "populacao": 7055228},
    {"uf": "MA", "nome": "Maranhão", "regiao": "Nordeste", "populacao": 6775152},
    {"uf": "MT", "nome": "Mato Grosso", "regiao": "Centro-Oeste", "populacao": 3658813},
    {"uf": "MS", "nome": "Mato Grosso do Sul", "regiao": "Centro-Oeste", "populacao": 2756700},
    {"uf": "MG", "nome": "Minas Gerais", "regiao": "Sudeste", "populacao": 20538718},
    {"uf": "PA", "nome": "Pará", "regiao": "Norte", "populacao": 8116132},
    {"uf": "PB", "nome": "Paraíba", "regiao": "Nordeste", "populacao": 3974495},
    {"uf": "PR", "nome": "Paraná", "regiao": "Sul", "populacao": 11443208},
    {"uf": "PE", "nome": "Pernambuco", "regiao": "Nordeste", "populacao": 9058155},
    {"uf": "PI", "nome": "Piauí", "regiao": "Nordeste", "populacao": 3269200},
    {"uf": "RJ", "nome": "Rio de Janeiro", "regiao": "Sudeste", "populacao": 16054524},
    {"uf": "RN", "nome": "Rio Grande do Norte", "regiao": "Nordeste", "populacao": 3302406},
    {"uf": "RS", "nome": "Rio Grande do Sul", "regiao": "Sul", "populacao": 10880506},
    {"uf": "RO", "nome": "Rondônia", "regiao": "Norte", "populacao": 1581016},
    {"uf": "RR", "nome": "Roraima", "regiao": "Norte", "populacao": 636303},
    {"uf": "SC", "nome": "Santa Catarina", "regiao": "Sul", "populacao": 7609601},
    {"uf": "SP", "nome": "São Paulo", "regiao": "Sudeste", "populacao": 44420459},
    {"uf": "SE", "nome": "Sergipe", "regiao": "Nordeste", "populacao": 2209558},
    {"uf": "TO", "nome": "Tocantins", "regiao": "Norte", "populacao": 1511459},
]

UF_LIST = [e["uf"] for e in ESTADOS_BRASIL]
UF_POPULATION_MAP = {e["uf"]: e["populacao"] for e in ESTADOS_BRASIL}
BRASIL_POPULATION = sum(UF_POPULATION_MAP.values())

REGIOES_MAP = {e["uf"]: e["regiao"] for e in ESTADOS_BRASIL}

FAIXAS_ETARIAS = [
    "0-4", "5-9", "10-19", "20-29", "30-39", "40-49",
    "50-59", "60-69", "70-79", "80+"
]

RACA_COR_LIST = ["Branca", "Preta", "Amarela", "Parda", "Indigena", "Ignorado"]

FAIXAS_INCIDENCIA = [
    {"label": "0–100", "min": 0, "max": 100, "color": "#fee5d9", "risco": "Baixo"},
    {"label": "101–500", "min": 101, "max": 500, "color": "#fcae91", "risco": "Moderado"},
    {"label": "501–2500", "min": 501, "max": 2500, "color": "#fb6a4a", "risco": "Alto"},
    {"label": "2501–10k", "min": 2501, "max": 10000, "color": "#de2d26", "risco": "Muito Alto"},
    {"label": ">10k", "min": 10001, "max": float("inf"), "color": "#a50f15", "risco": "Crítico"},
]
