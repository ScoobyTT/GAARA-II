# GAARA-II — Análise Completa do Código e Fluxo do Sistema

> **Data de análise**: 22/08/2026  
> **Versão analisada**: GAARA-II v2.0.0  
> **Stack**: Python 3.12 + FastAPI (Backend) | Angular 17+ TypeScript (Frontend)

---

## 1. Visão Geral da Arquitetura

O GAARA-II é um sistema web desacoplado em duas camadas independentes:

```
┌──────────────────────────────────────────────────────────┐
│           FRONTEND (Angular 17+)                          │
│  Port 4200  ·  TypeScript + SCSS + Leaflet.js + D3.js    │
│                                                           │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  Dashboard │  │  Alertas     │  │  Simulação        │ │
│  │  Principal │  │  Precoces    │  │  de Cenários      │ │
│  └────────────┘  └──────────────┘  └───────────────────┘ │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP REST JSON
                          ▼
┌──────────────────────────────────────────────────────────┐
│           BACKEND (Python FastAPI)                        │
│  Port 8000  ·  FastAPI + Pydantic v2 + Uvicorn           │
│                                                           │
│  API REST /api/v1/                                        │
│  kpi | temporal | demography | epidemiology               │
│  spatial | alerts | simulation                            │
│           ↓                                               │
│  Camada de Serviços (Lógica Epidemiológica)               │
│           ↓                                               │
│  MockRepository (Singleton em memória)                    │
│  ← MockDataGenerator (dados determinísticos)              │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```
GAARA-II/
├── backend/
│   ├── app/
│   │   ├── main.py                        ← Ponto de entrada FastAPI
│   │   ├── api/v1/
│   │   │   ├── api.py                     ← Router central
│   │   │   └── endpoints/
│   │   │       ├── kpi.py                 ← GET /kpi/summary
│   │   │       ├── temporal.py            ← GET /temporal/evolution
│   │   │       ├── demography.py          ← GET /demography/pyramid
│   │   │       ├── epidemiology.py        ← GET /epidemiology/control-diagram
│   │   │       ├── spatial.py             ← GET /spatial/map
│   │   │       ├── alerts.py              ← GET /alerts/summary
│   │   │       └── simulation.py          ← POST /simulation/predict
│   │   ├── core/
│   │   │   ├── config.py                  ← Configurações (Settings, CORS, flags)
│   │   │   └── constants.py               ← Dados geográficos do Brasil
│   │   ├── mocks/
│   │   │   └── mock_data_generator.py     ← Gerador determinístico de dados mockados
│   │   ├── repositories/
│   │   │   └── mock_repository.py         ← Repositório singleton em memória
│   │   ├── schemas/
│   │   │   ├── kpi.py                     ← Modelo KPISummary
│   │   │   ├── charts.py                  ← Modelos Temporal, Pirâmide, Canal Endêmico
│   │   │   ├── spatial.py                 ← Modelos geoespaciais
│   │   │   ├── alerts.py                  ← Modelos de alertas
│   │   │   ├── filters.py                 ← Schema de filtros
│   │   │   └── simulation.py              ← Request/Response da simulação
│   │   └── services/
│   │       ├── kpi_service.py             ← KPIs agregados
│   │       ├── temporal_service.py        ← Série temporal mensal
│   │       ├── demography_service.py      ← Pirâmide etária
│   │       ├── epidemiology_service.py    ← Canal Endêmico (Q1/Mediana/Q3)
│   │       ├── spatial_service.py         ← Mapa geoespacial
│   │       ├── alerts_service.py          ← Alertas precoces
│   │       └── simulation_service.py      ← Simulação climática
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── models/epidemiology.models.ts   ← Interfaces TypeScript
│       │   └── services/
│       │       ├── epidemiology-api.service.ts ← Cliente HTTP + fallback mockado
│       │       ├── filter-state.service.ts     ← Estado global de filtros (RxJS)
│       │       └── theme.service.ts            ← Gerenciamento de tema
│       ├── features/
│       │   ├── dashboard/
│       │   │   ├── dashboard.component.ts      ← Orquestrador do dashboard
│       │   │   └── components/
│       │   │       ├── kpi-cards/              ← Cards de indicadores KPI
│       │   │       ├── temporal-chart/         ← Gráfico de evolução temporal
│       │   │       ├── control-diagram/        ← Diagrama de controle / Canal endêmico
│       │   │       ├── pyramid-chart/          ← Pirâmide etária
│       │   │       ├── map-view/               ← Mapa coroplético (Leaflet.js)
│       │   │       └── data-table/             ← Tabela de dados por estado
│       │   ├── alerts/alerts-view.component.ts ← Módulo de alertas
│       │   └── simulation/simulation-view.component.ts ← Simulador
│       └── shared/components/
│           ├── filter-bar/                     ← Barra de filtros global
│           ├── navbar/                         ← Navegação principal
│           └── footer/                         ← Rodapé
├── tests__/
│   └── provavel_schema_banco                   ← Esboço do schema do banco futuro
├── run_dev.sh                                  ← Script de inicialização
└── pop_estimativa_2024.xls                     ← Dados populacionais de referência
```

---

## 3. Análise Detalhada — Backend

### 3.1 `backend/app/main.py` — Ponto de Entrada FastAPI

**O que faz**: Inicializa a aplicação FastAPI com configurações de CORS, registra todos os roteadores da API v1 e expõe um endpoint de healthcheck.

- CORS liberado para `localhost:4200` (Angular dev server)
- Healthcheck em `GET /health` → retorna status, nome do projeto, modo mock e versão
- Documentação interativa em `/api/v1/docs` (Swagger UI)

---

### 3.2 `backend/app/core/config.py` — Configurações

Define as configurações da aplicação via Pydantic Settings:

| Configuração | Valor | Descrição |
|---|---|---|
| `PROJECT_NAME` | "GAARA-II: Dashboard... Dengue" | Nome do projeto (ainda dengue-only) |
| `API_V1_STR` | `/api/v1` | Prefixo da API |
| `USE_MOCK_DATA` | `True` | Flag para modo mockado |
| `CORS_ORIGINS` | localhost:4200/3000, * | Origens CORS permitidas |
| `DATA_DIR` | `app/mocks/data` | Diretório de dados |

---

### 3.3 `backend/app/core/constants.py` — Constantes Geográficas e Epidemiológicas

**Conteúdo**:
- `ESTADOS_BRASIL` — Lista com os 27 estados: UF, nome, região e população estimada 2024
- `UF_LIST`, `UF_POPULATION_MAP`, `BRASIL_POPULATION` — Derivados da lista principal
- `REGIOES_MAP` — Mapeamento UF → Região geográfica
- `FAIXAS_ETARIAS` — `0-4`, `5-9`, ..., `80+`
- `RACA_COR_LIST` — Categorias raça/cor (**não usadas nos endpoints atualmente**)
- `FAIXAS_INCIDENCIA` — Classificação de risco (Baixo/Moderado/Alto/Muito Alto/Crítico) com HEX

---

### 3.4 `backend/app/mocks/mock_data_generator.py` — Gerador Determinístico de Dados

**Classe central** que gera **todos os dados mockados** de forma **determinística** (seed fixa = 42 via função seno), garantindo reprodutibilidade.

| Método | Retorno | Descrição |
|---|---|---|
| `generate_kpis()` | Dict[uf → KPIData] | KPIs para 27 UFs + Brasil. Fatores regionais: Centro-Oeste 1.6x, Sudeste 1.4x, Norte 0.7x. |
| `generate_temporal_evolution()` | Dict[uf → List[MontlyPoint]] | Série mensal 2014–2026 com sazonalidade (pico fev-mai) e anos epidêmicos (2024 = 3.8x). |
| `generate_age_pyramids()` | Dict[uf → List[PyramidBar]] | Distribuição por faixa etária e sexo (F=+8%, M=-8% nas notificações). |
| `generate_control_diagrams()` | Dict[uf → List[ControlPoint]] | Canal endêmico semanas 1–52 com Q1, Mediana, Q3 e incidência atual (curva gaussiana centrada semana 14). |
| `generate_spatial_data()` | Dict | Estados classificados + 7 municípios-referência com lat/lon. |
| `generate_alerts()` | List[AlertDict] | 3 alertas hardcoded: DF Crítico, BH Alto, Campinas Moderado. |
| `dump_all_mocks_to_disk()` | – | Salva todos os datasets em JSON. |

**Algoritmo de pseudo-randomização** (determinístico):
```python
def _pseudo_random(self, x: float) -> float:
    val = math.sin(x * 12.9898 + self.seed * 78.233) * 43758.5453
    return val - math.floor(val)
```

---

### 3.5 `backend/app/repositories/mock_repository.py` — Repositório em Memória (Singleton)

Implementa o padrão **Singleton**: carrega os dados gerados **uma única vez** em memória e serve múltiplas requisições sem regenerar.

**Métodos de acesso com lógica de filtro**:
- `get_kpis(uf, ano_inicio, ano_fim)` → Ajusta proporcionalmente pelo período selecionado
- `get_temporal_evolution(uf, ano_inicio, ano_fim)` → Filtra por UF e intervalo de anos
- `get_age_pyramid(uf)` → Pirâmide para UF específica ou Brasil
- `get_control_diagram(uf)` → Canal endêmico semanal para UF
- `get_spatial_map(uf)` → Estados nível nacional, municípios filtrados por UF
- `get_alerts()` → Lista de alertas ativos

---

### 3.6 Camada de Serviços

Todos os serviços seguem o padrão: **repositório** → **lógica de domínio** → **schema Pydantic tipado**.

#### `kpi_service.py` — KPIs e Sumários
Substitui `outputCards.R`. Retorna `KPISummary` com: totais de notificados/confirmados, óbitos, taxa de letalidade e incidência por 100k hab.

#### `temporal_service.py` — Séries Temporais
Substitui `1grafico.R`. Retorna série mensal com pontos `(data, casos_notificados, casos_confirmados)`.

#### `demography_service.py` — Pirâmide Etária
Substitui `2grafico.R`. Distribuição por faixa etária (`0-4` a `80+`) e sexo (`M`/`F`).

#### `epidemiology_service.py` — Canal Endêmico
Substitui `diagramaControle.R`. Calcula Q1, Mediana, Q3 para cada semana epidemiológica. Flag `em_alerta=True` quando `incidencia_atual > q3`.

#### `spatial_service.py` — Geoespacial
Substitui `mapa.R`. Retorna estados com classificação em 5 faixas de incidência ou municípios filtrados por UF.

#### `alerts_service.py` — Sistema de Alerta Precoce
Filtra alertas por UF. Retorna contagem por nível (Crítico/Alto/Moderado) + lista completa com localizações, métricas e ações recomendadas.

#### `simulation_service.py` — Simulação Climática
**Fórmula de impacto bioclimático**:
- `fator_temp = delta_temperatura × 0.08` (+8% casos por +1ºC)
- `fator_prec = (delta_precipitacao/100) × 0.45` (+4.5% a cada +10% de chuva)
- `fator_umid = (delta_umidade/100) × 0.30` (+3% a cada +10% de umidade)

Projeta curva N semanas: baseline vs. simulado. **Placeholder para modelos LSTM/GLMM futuros.**

---

### 3.7 Schemas Pydantic

| Schema | Campos Principais |
|---|---|
| `KPISummary` | total_notificados, confirmados, óbitos, taxa_letalidade, incidencia_por_100k, uf, ano_inicio, ano_fim |
| `TemporalPoint` | data_mes (YYYY-MM-DD), ano, mes, casos_notificados, casos_confirmados |
| `PyramidBar` | faixa_etaria, sexo (M/F), casos_notificados, casos_confirmados |
| `ControlPoint` | semana_epi, q1, mediana, q3, incidencia_atual, em_alerta (bool) |
| `StateIncidence` | uf, nome_estado, regiao, populacao, casos, obitos, incidencia_por_100k, nivel_risco, cor_hex |
| `MunicipalityIncidence` | cod_municipio, nome_municipio, uf, populacao, casos, incidencia_por_100k, lat?, lon? |
| `AlertNotification` | id, uf, municipio?, nivel_risco, titulo, descricao, casos_recentes, limiar_esperado, variacao_percentual, acoes_recomendadas[] |
| `SimulationRequest` | uf, delta_temperatura (-3 a +5ºC), delta_precipitacao (-40 a +60%), delta_umidade (-20 a +30%), semanas_projecao |

---

### 3.8 Endpoints REST

| Endpoint | Método | Parâmetros | Resposta |
|---|---|---|---|
| `/api/v1/kpi/summary` | GET | uf, ano_inicio, ano_fim | KPISummary |
| `/api/v1/temporal/evolution` | GET | uf, ano_inicio, ano_fim | TemporalEvolutionResponse |
| `/api/v1/demography/pyramid` | GET | uf | AgePyramidResponse |
| `/api/v1/epidemiology/control-diagram` | GET | uf | ControlDiagramResponse |
| `/api/v1/spatial/map` | GET | uf | SpatialMapResponse |
| `/api/v1/alerts/summary` | GET | uf | AlertSummaryResponse |
| `/api/v1/simulation/predict` | POST | SimulationRequest (body) | SimulationResponse |
| `/health` | GET | – | status, project, mock_mode, version |

---

## 4. Análise Detalhada — Frontend

### 4.1 `epidemiology-api.service.ts` — Cliente HTTP com Fallback

Serviço singleton que encapsula todas as chamadas HTTP. **Padrão crítico**: usa `catchError` do RxJS para fallback automático em dados mockados embutidos no próprio serviço, permitindo funcionamento sem backend.

> **Nota**: O método `getPrediction()` chama `/api/v1/temporal/prediction` que **não existe no backend** — é um endpoint planejado para o modelo SARIMA/LSTM futuro.

---

### 4.2 `filter-state.service.ts` — Estado Global

Gerencia estado global de filtros via `BehaviorSubject`. Todos os componentes se inscrevem e reagem a mudanças.

---

### 4.3 `dashboard.component.ts` — Orquestrador

Assina `FilterStateService` e dispara **5 chamadas em paralelo** ao detectar mudança de filtro:
1. KPIs → `kpi-cards`  
2. Série Temporal → `temporal-chart`  
3. Pirâmide Etária → `pyramid-chart`  
4. Canal Endêmico → `control-diagram`  
5. Mapa Espacial → `map-view` e `data-table`

---

### 4.4 `alerts-view.component.ts` — Módulo de Alertas

Exibe cards de alertas com:
- Badge de contagem por nível com animação de pulse animado (CSS)
- Cards individuais com: localização, nível, data, métricas comparativas (casos vs. Q3), variação % e ações recomendadas
- Estado vazio ("Nenhum Alerta Ativo") quando não há alertas

---

### 4.5 `simulation-view.component.ts` — Simulador de Cenários

Interface com 3 sliders reativos (température, precipitação, umidade). Resultado exibido como curva SVG manual (sem biblioteca externa) comparando baseline vs. simulado.

---

### 4.6 `epidemiology.models.ts` — Contratos TypeScript

Interfaces TypeScript espelhando os schemas Pydantic. Inclui `PredictionResponse` com `limite_inferior` e `limite_superior` (bandas de confiança) — interface para integração futura de modelos preditivos.

---

## 5. Fluxo Completo de uma Requisição

```
1. Usuário seleciona UF = "SP", Ano 2020-2024 na FilterBar
      ↓
2. FilterStateService emite novo valor via BehaviorSubject
      ↓
3. DashboardComponent.loadDashboardData('SP', 2020, 2024)
   → Despacha 5 Observables em paralelo
      ↓
4. EpidemiologyApiService.getKpiSummary('SP', 2020, 2024)
   → HTTP GET localhost:8000/api/v1/kpi/summary?uf=SP&ano_inicio=2020&ano_fim=2024
   → Se erro: catchError → getMockKpis() [fallback embutido]
      ↓
5. Backend: kpi.py Router → KPIService → MockRepository.get_kpis()
   → Fator de ajuste: (2024-2020+1)/13 anos = 38.5%
   → Retorna KPISummary JSON
      ↓
6. KpiCardsComponent recebe @Input [kpi] → renderiza 4 cards
```

---

## 6. Análise: O GAARA-II Cobre Dengue ou Outras Arboviroses?

### Conclusão: **EXCLUSIVAMENTE DENGUE** no estado atual.

**Evidências no código**:

| Arquivo | Linha | Evidência |
|---|---|---|
| `main.py` | 10 | `"API RESTful de Monitoramento... de Dengue no Brasil"` |
| `config.py` | 5 | `PROJECT_NAME = "...Alerta Precoce de Dengue"` |
| `mock_data_generator.py` | 97 | `# Sazonalidade típica de dengue no Brasil` |
| `epidemiology_service.py` | docstring | `(Substitui diagramaControle.R)` — legado era dengue-only |
| Todos os alertas | – | Referência explícita a "DENV" |
| Todos os schemas | – | Sem campo `agravo` ou `doenca` |
| `constants.py` | – | Sem constante para outros agravos |

**Menções a "arboviroses" sem implementação**:
- `simulation-view.component.ts` linha 22: texto da UI menciona "arboviroses" mas sem distinção real
- A sazonalidade é única e idêntica para todas as UFs, calibrada para dengue

**Portanto**: A arquitetura é genérica o suficiente para expansão, mas **nenhum dado, endpoint, schema ou filtro suporta chikungunya, Zika ou outras arboviroses**.

---

## 7. Comparação com o Projeto Legado (`Scientific_Initiation_Dashboard`)

| Aspecto | Legado (R/Shiny) | GAARA-II (FastAPI+Angular) |
|---|---|---|
| **Stack** | R + Shiny (monolítico) | Python FastAPI + Angular (desacoplado) |
| **Arquitetura** | Servidor único, lógica e UI misturadas | REST API + SPA separados |
| **Escalabilidade** | Limitada pelo Shiny | Horizontal (containers, load balancer) |
| **Gráficos** | ggplot2 (renderizado no servidor) | D3.js/Chart.js (client-side, interativo) |
| **Mapa** | Leaflet (via R) | Leaflet.js (client-side) |
| **Tempo Real** | Recarregamento completo | Atualizações reativas via RxJS |
| **Tipagem** | Sem tipagem forte | TypeScript + Pydantic v2 (end-to-end) |
| **Testes** | Ausentes (diretório _tests vazio) | pytest configurado (em construção) |
| **Dados** | Arquivos .DBC do DataSUS via FTP | REST API com mock determinístico |
| **Dark Mode** | Implementado (comentado/incompleto) | Implementado e funcional |
| **Alerta Precoce** | Ausente | Módulo completo com classificação |
| **Simulação** | Ausente | Simulador climático interativo |
| **Previsão ML** | Interface básica (scatterplotPrev) | Estrutura para SARIMA/LSTM (stub) |
| **Raça/Cor** | Implementado (tabelaRaca.R) | Não implementado (constante definida) |
| **Pipeline ETL** | `sinan_download_data.R` (R) | Não implementado ainda |
| **Banco de Dados** | Arquivo .DBC local | PostgreSQL/PostGIS (planejado) |
