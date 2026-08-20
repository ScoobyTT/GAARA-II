# GAARA-II: Dashboard Inteligente e Sistema de Alerta Precoce para Dengue no Brasil

Sistema avançado de vigilância epidemiológica, análise de séries temporais e alerta precoce de arboviroses no Brasil, desenvolvido com base no **Projeto de Pesquisa (Subprojetos 1 e 2)** e migrado da arquitetura legada em R/Shiny para uma moderna stack desacoplada com **Python (FastAPI)** e **Angular 17+**.

---

## 🏛️ Arquitetura do Projeto

- **Backend**: Python 3.12 + FastAPI + Pydantic v2 + Pandas/NumPy/SciPy + Celery/Redis
- **Frontend**: Angular 17+ (Standalone Components, TypeScript, SCSS, Leaflet.js, D3.js)
- **Dados Mockados**: Gerador determinístico de fixtures para testes imediatos sem necessidade de aguardar o provisionamento do PostgreSQL/PostGIS.
- **Isolamento de Modelos Preditivos de IA**: Interfaces e *stubs* desacoplados para futura conexão dos modelos SARIMA, GLMM, XGBoost e LSTM.

---

## 📂 Estrutura de Diretórios

```text
GAARA-II/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Endpoints REST (KPIs, Temporal, Demografia, Epidemiologia, Espacial, Alertas, Simulação)
│   │   ├── core/              # Configurações e constantes territoriais do Brasil
│   │   ├── mocks/             # Gerador de dados determinísticos
│   │   ├── repositories/      # Camada de repositório em memória
│   │   ├── schemas/           # Schemas Pydantic tipados
│   │   ├── services/          # Lógica epidemiológica traduzida do R (Canal endêmico, quartis, etc.)
│   │   └── main.py            # Ponto de entrada FastAPI
│   ├── tests/                 # Suíte de testes automatizados com pytest
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Modelos TypeScript e Serviços HTTP/State
│   │   │   ├── shared/        # Navbar, FilterBar, Footer
│   │   │   └── features/      # Dashboard, Sistema de Alertas, Simulador de Cenários
│   │   ├── styles.scss        # Design System (Dark/Light mode, HSL tokens)
│   │   └── index.html
│   └── package.json
├── PLANO_IMPLEMENTACAO.md     # Plano detalhado em 7 fases
├── run_dev.sh                 # Script de inicialização simultânea (Front + Back)
└── README.md
```

---

## 🚀 Como Executar em Desenvolvimento

### Opção 1: Inicialização Unificada (Recomendada)
Execute o script bash na raiz de `GAARA-II`:
```bash
./run_dev.sh
```

Isso iniciará:
- **Backend FastAPI**: [http://localhost:8000](http://localhost:8000) (Docs interativas: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs))
- **Frontend Angular**: [http://localhost:4200](http://localhost:4200)

---

### Opção 2: Inicialização Individual

#### 1. Backend (Python / FastAPI)
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --reload --port 8000
```

Para rodar a suíte de testes do backend:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/
```

#### 2. Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Acesse [http://localhost:4200](http://localhost:4200).

---

## 📊 Mapeamento de Regras do Legado em R $\rightarrow$ Python

- **`outputCards.R` $\rightarrow$ `kpi_service.py`**: Consolidação de casos e óbitos notificados/confirmados, cálculo de letalidade e taxa de incidência por 100k hab.
- **`1grafico.R` $\rightarrow$ `temporal_service.py`**: Série temporal mensal de casos com agregação nacional e estadual.
- **`2grafico.R` $\rightarrow$ `demography_service.py`**: Pirâmide etária com cortes padronizados (`0-4`, `5-9`, ..., `80+`) e estratificação por sexo (M/F).
- **`diagramaControle.R` $\rightarrow$ `epidemiology_service.py`**: Cálculo de quartis ($Q_1, \text{Mediana}, Q_3$) para definição do canal endêmico e identificação de surtos.
- **`mapa.R` $\rightarrow$ `spatial_service.py` & Leaflet**: Agrupamento geoespacial em faixas de incidência (`0-100`, `101-500`, `501-2500`, `2501-10k`, `>10k`).