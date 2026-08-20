# Plano de Implementação: Projeto GAARA-II

> **Sistema Integrado de Dashboard Inteligente e Alerta Precoce para Monitoramento da Dengue no Brasil**  
> **Referência**: Projeto de Pesquisa (Subprojetos 1 e 2) & Migração do Legado (`Scientific_Initiation_Dashboard` [R/Shiny] $\rightarrow$ `GAARA-II` [Python FastAPI + Angular]).

---

## 1. Visão Geral e Contexto

O projeto **GAARA-II** tem por objetivo criar uma plataforma moderna, resiliente e escalável para vigilância e tomada de decisão no combate à dengue no Brasil. 

### Principais Pilares:
1. **Frontend Moderno**: Desenvolvido em **Angular** (TypeScript, componentes reativos, gráficos interativos com D3.js/Chart.js e mapas coropléticos com Leaflet.js).
2. **Backend Robusto e Assíncrono**: Desenvolvido em **Python (FastAPI)**, com suporte a processamento de dados (Pandas/Numpy/GeoPandas) e tarefas em segundo plano (Celery + Redis).
3. **Reaproveitamento de Conhecimento do Legado**: Tradução das regras de cálculo epidemiológico, agregações, filtros e processamento de arquivos SINAN presentes no projeto antigo em R (`Scientific_Initiation_Dashboard`), **mantendo o projeto antigo intacto**.
4. **Independência Imediata de Banco de Dados (Estratégia de Mocks)**: Uso de geradores de dados mockados realistas e repositórios em memória para testar e validar o frontend e os endpoints de backend sem depender do setup final do PostgreSQL/PostGIS.
5. **Isolamento de Modelos Preditivos de IA**: A arquitetura define contratos/interfaces padronizados para predições futuras (SARIMA, GLMM, XGBoost, LSTM), fornecendo respostas simuladas (mockadas) nesta primeira etapa enquanto os modelos científicos são calibrados pelos pesquisadores.

---

## 2. Arquitetura do Sistema

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Angular)                            │
│  ┌──────────────────┐  ┌────────────────────┐  ┌─────────────────────┐  │
│  │ Filtros Globais  │  │ Cards KPIs         │  │ Mapas (Leaflet.js)  │  │
│  │ (UF, Ano, Sem.)  │  │ (Casos / Óbitos)   │  │ (Incidência / Mun.) │  │
│  └────────┬─────────┘  └─────────┬──────────┘  └──────────┬──────────┘  │
│           │                      │                        │             │
│  ┌────────┴─────────┐  ┌─────────┴──────────┐  ┌──────────┴──────────┐  │
│  │ Gráficos (D3.js) │  │ Alertas Precoces   │  │ Simulador Cenários  │  │
│  │ (Evolução/Canal) │  │ (Notificações)     │  │ (Clima / Risco)     │  │
│  └──────────────────┘  └────────────────────┘  └─────────────────────┘  │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ JSON (REST API)
┌────────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND (Python FastAPI)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Routers da API REST (/api/v1/kpi, /temporal, /spatial, /alerts)   │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────┴─────────────────────────────────┐  │
│  │ Camada de Serviços (Lógica Traduzida do R: Canal Endêmico, etc.)  │  │
│  └──────────────────┬───────────────────────────────┬────────────────┘  │
│                     │                               │                   │
│      ┌──────────────▼──────────────┐  ┌─────────────▼─────────────┐     │
│      │ Repositório Mock (Em Uso)   │  │ Repositório PostgreSQL    │     │
│      │ Fixtures JSON/TSV em memória│  │ (Preparado p/ Fase Final) │     │
│      └─────────────────────────────┘  └───────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Tradução: Legado em R $\rightarrow$ Novo Projeto Python

| Módulo Legado (R) | Arquivo Fonte (Legado) | Função / Responsabilidade | Módulo Novo (Python / FastAPI) |
| :--- | :--- | :--- | :--- |
| **KPIs & Totais** | `server/outputCards.R` | Soma agregada de casos/óbitos notificados e confirmados por ano e UF | `app/services/kpi_service.py` |
| **Evolução Temporal** | `server/1grafico.R` & `graphs.R` | Série mensal e semanal de casos notificados vs confirmados | `app/services/temporal_service.py` |
| **Pirâmide Etária** | `server/2grafico.R` & `graphs.R` | Distribuição etária cortada por faixas (0-4, 5-9, ...) e sexo (M/F) | `app/services/demography_service.py` |
| **Diagrama de Controle** | `server/diagramaControle.R` | Cálculo de quartis ($Q_1, \text{Mediana}, Q_3$), canal endêmico e coeficiente de incidência | `app/services/epidemiology_service.py` |
| **Mapa Espacial** | `server/mapa.R` | Junção com malhas geográficas e classificação por faixas de incidência | `app/services/spatial_service.py` |
| **Tabela de Dados** | `server/tabelaDados.R` | Tabela paginada com ranking de estados e regiões | `app/services/table_service.py` |
| **Pipeline ETL / DBC** | `pipeline.R` / `sinan_download_data.R` | Download FTP do DataSUS, leitura de `.dbc` e agregações de base | `app/etl/sinan_extractor.py` & Celery tasks |

---

## 4. Fases de Execução do Plano

### 🟦 FASE 1: Estrutura Inicial e Ambientes (Frontend & Backend)
- [ ] Criar diretórios padronizados em `GAARA-II/backend` e `GAARA-II/frontend`.
- [ ] Configurar ambiente virtual Python, `pyproject.toml` / `requirements.txt` com:
  - `fastapi`, `uvicorn`, `pydantic`, `pandas`, `numpy`, `geopandas`, `scipy`.
- [ ] Configurar projeto Angular com Standalone Components, roteamento, TailwindCSS / SCSS e suporte a temas (Dark/Light).
- [ ] Configurar scripts de inicialização rápida (`Makefile` ou scripts bash para desenvolvimento).

---

### 🟨 FASE 2: Especificação de Contratos de API & Gerador de Dados Mockados
- [ ] **Definir DTOs/Schemas Pydantic & TypeScript**:
  - Parâmetros de filtro (`uf`, `ano_inicio`, `ano_fim`, `semana_inicio`, `semana_fim`).
  - Resumo de KPIs (`notificados`, `confirmados`, `obitos_notificados`, `obitos_confirmados`).
  - Séries temporais (evolução mensal/semanal).
  - Pirâmide demográfica (faixas etárias x sexo x classificação).
  - Diagrama de controle (semanas 1-52, $Q_1$, Mediana, $Q_3$, Incidência atual).
  - Dados geoespaciais (GeoJSON dos estados/municípios com atributos de taxa de incidência).
  - Alertas precoces e cenários hipotéticos.
- [ ] **Criar Gerador de Mocks Python (`app/mocks/`)**:
  - Script gerador de fixtures realistas para o Brasil e todas as 27 UFs.
  - Alternador via variável de ambiente: `USE_MOCK_DATA=True` (permitindo testes imediatos sem banco).

---

### 🟩 FASE 3: Desenvolvimento do Backend (Python / FastAPI)
- [ ] Implementar a lógica dos cálculos traduzida do R:
  - `KPIService`: Filtro vetorial com Pandas para retorno instantâneo dos totais.
  - `TemporalService`: Agrupamentos por ano/mês/semana.
  - `DemographyService`: Categorização etária e contagem por sexo.
  - `EpidemiologyService`: Algoritmo de quantis para canais endêmicos e taxa de incidência por 100k hab.
  - `SpatialService`: Cálculo de incidência e retorno de propriedades GeoJSON.
- [ ] Implementar os Routers FastAPI com documentação OpenAPI (`/docs` interativa).
- [ ] Criar testes unitários com `pytest` para validação matemática das regras traduzidas.

---

### 🟧 FASE 4: Desenvolvimento do Frontend (Angular)
- [ ] **Camada de Serviços & Estado**:
  - `FilterStateService`: Gerenciamento centralizado de filtros com RxJS `BehaviorSubject`.
  - `ApiService`: Cliente HTTP tipado com tratamento de erros e loading states.
- [ ] **Componentes Visuais**:
  - **Barra Superior**: Seletor de UF (Brasil / Estados), Slider de Anos, Toggle Dark/Light Mode.
  - **Cards de Indicadores**: Exibição dos 4 grandes KPIs com ícones e variações percentuais.
  - **Gráfico de Evolução de Casos**: Componente com gráfico combinado (Barras + Linha).
  - **Gráfico de Pirâmide Etária**: Gráfico de barras bidirecional espelhado.
  - **Gráfico de Diagrama de Controle**: Gráfico de área (Canal Endêmico) com linha de mediana e incidência real sobreposta.
  - **Mapa Coroplético Interativo**: Integração com Leaflet.js, coloração por faixa de incidência, popups com dados do município/estado e zoom dinâmico.
  - **Tabela de Dados Analíticos**: Tabela responsiva com busca, ordenação e exportação (CSV).

---

### 🟪 FASE 5: Sistema de Alerta Precoce & Simulador de Cenários
- [ ] **Módulo de Alertas**:
  - Lógica heurística: detecção de ultrapassagem do limiar superior ($Q_3$ ou limites críticos).
  - Interface com visualização de notificações, níveis de risco (Baixo, Moderado, Alto, Crítico) e recomendações de controle vetorial.
- [ ] **Simulador de Cenários**:
  - Interface com sliders de parâmetros climáticos/ambientais (variação de temperatura, precipitação e umidade).
  - Endpoint de simulação mockada com resposta reativa imediata.

---

### 🟫 FASE 6: Pipeline ETL & Preparação para Banco de Dados
- [ ] Traduzir scripts de download e conversão SINAN (`sinan_download_data.R` $\rightarrow$ Python).
- [ ] Estruturar modelos de dados SQLAlchemy alinhados ao schema dimensional (`dim_tempo`, `dim_municipio`, `dim_agravo`, `dim_demografia`, `fato_casos`).
- [ ] Implementar padrão *Repository* desacoplado (`MockRepository` $\leftrightarrow$ `PostgresRepository`), permitindo plugar o banco assim que estiver provisionado.

---

### ⬛ FASE 7: Preparação para Integração Futura dos Modelos Preditivos de IA
- [ ] Estabelecer contratos de interface para os modelos de Machine Learning / Séries Temporais:
  - `SARIMAModel`, `GLMMModel`, `XGBoostModel`, `LSTMModel`, `HybridSarimaLstmModel`.
- [ ] Manter *stubs* no backend que entregam predições estruturadas para o frontend até que a equipe científica conclua o treinamento e validação dos modelos com as métricas definitivas (RMSE, MAE, R², AUC-ROC, F1).

---

## 5. Estrutura de Arquivos Planejada em `GAARA-II`

```text
GAARA-II/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── kpi.py
│   │   │   │   │   ├── temporal.py
│   │   │   │   │   ├── demography.py
│   │   │   │   │   ├── control_diagram.py
│   │   │   │   │   ├── spatial.py
│   │   │   │   │   ├── alerts.py
│   │   │   │   │   └── simulation.py
│   │   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── constants.py
│   │   ├── mocks/
│   │   │   ├── mock_data_generator.py
│   │   │   └── data/
│   │   ├── schemas/
│   │   │   ├── filters.py
│   │   │   ├── kpi.py
│   │   │   ├── charts.py
│   │   │   ├── spatial.py
│   │   │   └── alerts.py
│   │   ├── services/
│   │   │   ├── kpi_service.py
│   │   │   ├── temporal_service.py
│   │   │   ├── demography_service.py
│   │   │   ├── epidemiology_service.py
│   │   │   └── spatial_service.py
│   │   ├── repositories/
│   │   │   ├── base.py
│   │   │   ├── mock_repository.py
│   │   │   └── postgres_repository.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── kpi-card/
│   │   │   │   │   ├── filter-bar/
│   │   │   │   │   └── navbar/
│   │   │   └── features/
│   │   │       ├── dashboard/
│   │   │       │   ├── components/
│   │   │       │   │   ├── temporal-chart/
│   │   │       │   │   ├── pyramid-chart/
│   │   │       │   │   ├── control-diagram/
│   │   │       │   │   ├── map-view/
│   │   │       │   │   └── data-table/
│   │   │       ├── alerts/
│   │   │       └── simulation/
│   │   ├── assets/
│   │   │   └── geo/
│   │   └── styles.scss
│   ├── angular.json
│   └── package.json
└── PLANO_IMPLEMENTACAO.md
```
