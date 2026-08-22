# GAARA-II — Plano de Implementação: Expansão para Múltiplas Arboviroses

> **Contexto**: Atualmente o GAARA-II é exclusivamente focado em **dengue**. O Projeto de Pesquisa requisita que a plataforma seja **escalável e expansível** para monitorar outras arboviroses (chikungunya, Zika, febre amarela e potencialmente outras no futuro).  
> **Data**: 22/08/2026

---

## 1. Diagnóstico Atual: Por que Só Funciona com Dengue?

Após análise completa do código, identificamos os seguintes pontos de acoplamento com dengue:

### 1.1 Backend — Pontos de Acoplamento

| Arquivo | Linha | Problema |
|---|---|---|
| `main.py` | 10 | Descrição da API menciona "Dengue" |
| `config.py` | 5 | `PROJECT_NAME` menciona "Dengue" |
| `mock_data_generator.py` | 97–108 | Sazonalidade e pesos de anos epidêmicos hardcoded para dengue |
| `mock_data_generator.py` | 294–349 | Alertas hardcoded com referência a "DENV" |
| Todos os schemas | – | Sem campo `agravo` (tipo de doença) |
| Todos os endpoints | – | Sem parâmetro `agravo` nas queries |
| `constants.py` | – | Sem constante para arboviroses ou agravos |

### 1.2 Frontend — Pontos de Acoplamento

| Arquivo | Problema |
|---|---|
| Todas as interfaces TypeScript | Sem campo `agravo` |
| `filter-bar.component.ts` | Sem seletor de doença |
| `epidemiology-api.service.ts` | Nenhum parâmetro `agravo` nas chamadas |
| Textos da UI | Menções explícitas a "dengue" e "DENV" |

---

## 2. Arboviroses Alvo

Baseado no PDF do Projeto de Pesquisa e relevância epidemiológica no Brasil:

| Agravo | Sigla | Vetor | SINAN Code | Características Epidemiológicas |
|---|---|---|---|---|
| **Dengue** | DENV | Aedes aegypti | A90/A91 | Pico fev-mai; 4 sorotipos; epidêmica |
| **Chikungunya** | CHIKV | Aedes aegypti/albopictus | A92.0 | Sazonalidade semelhante à dengue; artralgia persistente |
| **Zika** | ZIKV | Aedes aegypti | A92.8 | Risco de microcefalia; pico 2015-2016; menor incidência atual |
| **Febre Amarela** | YFV | Aedes/Haemagogus | A95 | Endêmica Norte/Nordeste; vacinação; alta letalidade |

---

## 3. Análise de Impacto das Mudanças

### 3.1 Mudanças de Alta Complexidade (Reestruturação)

#### Backend
- **Schemas Pydantic**: Adicionar campo `agravo: ArbovirusEnum` em todos os schemas
- **MockRepository**: Separar dados por agravo (atualmente tudo junto)
- **MockDataGenerator**: Implementar sazonalidade e parâmetros específicos por doença
- **Todos os endpoints**: Adicionar query param `agravo` opcional (default: `DENV`)

#### Frontend
- **Interfaces TypeScript**: Adicionar `agravo` a todos os modelos
- **FilterBarComponent**: Adicionar seletor de doença (Dengue / Chikungunya / Zika / Febre Amarela)
- **API Service**: Passar `agravo` em todas as chamadas HTTP
- **Dashboard**: Adaptar labels e cores por doença

### 3.2 Mudanças de Média Complexidade

- **Sazonalidade por doença**: Criar perfis epidemiológicos distintos no gerador de mocks
- **Alertas por doença**: Configurar limiares e ações específicas para cada agravo
- **Paletas de cores**: Diferenciação visual por doença (ex.: dengue = vermelho, zika = roxo, chikungunya = laranja)
- **Constantes de domínio**: Adicionar `ARBOVIROSES` com parâmetros por doença

### 3.3 Mudanças de Baixa Complexidade (Configuração)

- `config.py`: Atualizar `PROJECT_NAME` para nome genérico
- `main.py`: Atualizar `description` da API
- Labels/textos da UI: Substituir "Dengue" por nome dinâmico baseado no filtro

---

## 4. Plano de Implementação Detalhado

### FASE 1: Definição de Domínio e Infraestrutura (Estimativa: 1 semana)

#### 1.1 Criar constantes de arboviroses (`backend/app/core/constants.py`)

```python
# Adicionar ao constants.py:

from enum import Enum

class ArbovirusEnum(str, Enum):
    DENGUE = "DENV"
    CHIKUNGUNYA = "CHIKV"
    ZIKA = "ZIKV"
    FEBRE_AMARELA = "YFV"

ARBOVIROSES = {
    "DENV": {
        "nome": "Dengue",
        "sinan_code": "A90/A91",
        "vetor": "Aedes aegypti",
        "cor_primaria": "#ef4444",   # vermelho
        "sazonalidade": {
            1: 1.2, 2: 2.1, 3: 2.8, 4: 2.5, 5: 1.6, 6: 0.8,
            7: 0.4, 8: 0.3, 9: 0.4, 10: 0.6, 11: 0.8, 12: 1.0
        },
        "ano_peso": {
            2014: 0.6, 2015: 1.7, 2016: 1.5, 2017: 0.3,
            2018: 0.3, 2019: 1.6, 2020: 0.9, 2021: 0.5,
            2022: 1.4, 2023: 1.6, 2024: 3.8, 2025: 1.8, 2026: 1.2
        }
    },
    "CHIKV": {
        "nome": "Chikungunya",
        "sinan_code": "A92.0",
        "vetor": "Aedes aegypti / Aedes albopictus",
        "cor_primaria": "#f97316",   # laranja
        "sazonalidade": {
            1: 1.1, 2: 1.9, 3: 2.5, 4: 2.3, 5: 1.5, 6: 0.9,
            7: 0.5, 8: 0.4, 9: 0.5, 10: 0.7, 11: 0.9, 12: 1.0
        },
        "ano_peso": {
            2014: 0.1, 2015: 0.8, 2016: 2.1, 2017: 1.8, 2018: 1.2,
            2019: 1.0, 2020: 0.7, 2021: 0.6, 2022: 1.1, 2023: 1.3,
            2024: 2.2, 2025: 1.5, 2026: 1.1
        }
    },
    "ZIKV": {
        "nome": "Zika",
        "sinan_code": "A92.8",
        "vetor": "Aedes aegypti",
        "cor_primaria": "#8b5cf6",   # roxo
        "sazonalidade": {
            1: 1.3, 2: 2.4, 3: 2.9, 4: 2.2, 5: 1.3, 6: 0.7,
            7: 0.4, 8: 0.3, 9: 0.4, 10: 0.6, 11: 0.8, 12: 1.1
        },
        "ano_peso": {
            2014: 0.2, 2015: 1.5, 2016: 4.2, 2017: 1.1, 2018: 0.4,
            2019: 0.3, 2020: 0.3, 2021: 0.2, 2022: 0.3, 2023: 0.4,
            2024: 0.5, 2025: 0.4, 2026: 0.4
        }
    },
    "YFV": {
        "nome": "Febre Amarela",
        "sinan_code": "A95",
        "vetor": "Aedes / Haemagogus",
        "cor_primaria": "#eab308",   # amarelo
        "sazonalidade": {
            1: 1.8, 2: 2.2, 3: 2.0, 4: 1.4, 5: 0.8, 6: 0.4,
            7: 0.3, 8: 0.3, 9: 0.4, 10: 0.7, 11: 1.2, 12: 1.5
        },
        "ano_peso": {
            2014: 0.3, 2015: 0.4, 2016: 0.5, 2017: 2.8, 2018: 3.5,
            2019: 1.2, 2020: 0.4, 2021: 0.3, 2022: 0.3, 2023: 0.4,
            2024: 0.5, 2025: 0.4, 2026: 0.4
        }
    }
}

DEFAULT_AGRAVO = "DENV"
```

---

### FASE 2: Atualização dos Schemas Pydantic (Estimativa: 2-3 dias)

#### 2.1 Atualizar `backend/app/schemas/filters.py`

```python
# Adicionar campo agravo ao DashboardFilter:

from app.core.constants import ArbovirusEnum, DEFAULT_AGRAVO

class DashboardFilter(BaseModel):
    uf: str = "Todos"
    ano_inicio: int = 2014
    ano_fim: int = 2026
    semana_inicio: Optional[int] = None
    semana_fim: Optional[int] = None
    agravo: ArbovirusEnum = ArbovirusEnum.DENGUE  # NOVO CAMPO
```

#### 2.2 Propagar para todos os schemas de resposta

Adicionar campo `agravo: str` em:
- `KPISummary`
- `TemporalEvolutionResponse`
- `AgePyramidResponse`
- `ControlDiagramResponse`
- `SpatialMapResponse`
- `AlertSummaryResponse`
- `SimulationResponse`

---

### FASE 3: Refatoração do MockDataGenerator (Estimativa: 3-5 dias)

#### 3.1 Parametrizar o gerador por agravo

```python
# Refatoração do mock_data_generator.py:

class MockDataGenerator:
    def __init__(self, seed: int = 42):
        self.seed = seed

    def _get_arbo_config(self, agravo: str) -> dict:
        from app.core.constants import ARBOVIROSES, DEFAULT_AGRAVO
        return ARBOVIROSES.get(agravo, ARBOVIROSES[DEFAULT_AGRAVO])

    def generate_kpis(self, agravo: str = "DENV") -> Dict[str, Any]:
        config = self._get_arbo_config(agravo)
        # Fator de escala base por doença:
        # Dengue: 6.6M casos 2024; Chikungunya: ~600k; Zika: ~200k; FA: ~15k
        escala_base = {"DENV": 6600000, "CHIKV": 600000, "ZIKV": 200000, "YFV": 15000}
        base = escala_base.get(agravo, 1000000)
        # ...restante da lógica com config["sazonalidade"] e config["ano_peso"]

    def generate_temporal_evolution(self, agravo: str = "DENV") -> ...:
        config = self._get_arbo_config(agravo)
        sazonalidade = config["sazonalidade"]
        ano_peso = config["ano_peso"]
        # ...usando parâmetros específicos da doença

    def generate_alerts(self, agravo: str = "DENV") -> List[Dict]:
        config = self._get_arbo_config(agravo)
        # Alertas contextualizados por doença
        nome_agravo = config["nome"]
        # ...

    def generate_control_diagrams(self, agravo: str = "DENV") -> ...:
        # Curva sazonal diferenciada por doença
        config = self._get_arbo_config(agravo)
        # ...
```

---

### FASE 4: Atualização do MockRepository (Estimativa: 1-2 dias)

#### 4.1 Separar dados por agravo no repositório

```python
# mock_repository.py — Novo _init_data():

def _init_data(self):
    from app.core.constants import ARBOVIROSES
    self._data_by_agravo = {}
    
    for agravo_code in ARBOVIROSES.keys():
        generator = MockDataGenerator(seed=hash(agravo_code) % 1000)
        self._data_by_agravo[agravo_code] = {
            "kpis": generator.generate_kpis(agravo=agravo_code),
            "temporal": generator.generate_temporal_evolution(agravo=agravo_code),
            "pyramids": generator.generate_age_pyramids(),  # Não muda por doença
            "control": generator.generate_control_diagrams(agravo=agravo_code),
            "spatial": generator.generate_spatial_data(agravo=agravo_code),
            "alerts": generator.generate_alerts(agravo=agravo_code),
        }

def get_kpis(self, uf: str = "Todos", ano_inicio: int = 2014,
             ano_fim: int = 2026, agravo: str = "DENV") -> Dict:
    data = self._data_by_agravo.get(agravo, self._data_by_agravo["DENV"])
    # ...restante do filtro por UF e ano
```

---

### FASE 5: Atualização dos Endpoints e Serviços (Estimativa: 2-3 dias)

#### 5.1 Adicionar parâmetro `agravo` em todos os endpoints

```python
# Exemplo: kpi.py
@router.get("/summary", response_model=KPISummary)
def get_kpi_summary(
    uf: str = Query(default="Todos"),
    ano_inicio: int = Query(default=2014, ge=2014, le=2026),
    ano_fim: int = Query(default=2026, ge=2014, le=2026),
    agravo: str = Query(default="DENV", description="Código da arbovirose: DENV, CHIKV, ZIKV, YFV")
):
    return kpi_service.get_summary(uf=uf, ano_inicio=ano_inicio, 
                                   ano_fim=ano_fim, agravo=agravo)
```

Repetir para: `temporal.py`, `demography.py`, `epidemiology.py`, `spatial.py`, `alerts.py`, `simulation.py`.

---

### FASE 6: Atualização do Frontend (Estimativa: 3-4 dias)

#### 6.1 Adicionar interface `ArbovirusInfo` aos modelos TypeScript

```typescript
// epidemiology.models.ts — Adicionar:

export type ArbovirusCode = 'DENV' | 'CHIKV' | 'ZIKV' | 'YFV';

export interface ArbovirusInfo {
  code: ArbovirusCode;
  nome: string;
  corPrimaria: string;
}

export const ARBOVIROSES: ArbovirusInfo[] = [
  { code: 'DENV', nome: 'Dengue', corPrimaria: '#ef4444' },
  { code: 'CHIKV', nome: 'Chikungunya', corPrimaria: '#f97316' },
  { code: 'ZIKV', nome: 'Zika', corPrimaria: '#8b5cf6' },
  { code: 'YFV', nome: 'Febre Amarela', corPrimaria: '#eab308' },
];

// Atualizar DashboardFilter:
export interface DashboardFilter {
  uf: string;
  ano_inicio: number;
  ano_fim: number;
  semana_inicio?: number;
  semana_fim?: number;
  agravo: ArbovirusCode;  // NOVO CAMPO
}
```

#### 6.2 Atualizar `filter-state.service.ts`

```typescript
// Adicionar agravo ao estado inicial:
private filterSubject = new BehaviorSubject<DashboardFilter>({
  uf: 'Todos',
  ano_inicio: 2014,
  ano_fim: 2026,
  agravo: 'DENV'   // Default: Dengue
});
```

#### 6.3 Adicionar seletor de doença ao `filter-bar.component.ts`

```html
<!-- Seletor de arbovirose na FilterBar: -->
<div class="disease-selector">
  <button 
    *ngFor="let arbo of arboviroses"
    [class.active]="currentFilter.agravo === arbo.code"
    (click)="selectAgravo(arbo.code)"
    [style.borderColor]="currentFilter.agravo === arbo.code ? arbo.corPrimaria : 'transparent'"
  >
    <span class="dot" [style.background]="arbo.corPrimaria"></span>
    {{ arbo.nome }}
  </button>
</div>
```

#### 6.4 Propagar `agravo` em `epidemiology-api.service.ts`

```typescript
// Atualizar todos os métodos para incluir agravo:
getKpiSummary(uf = 'Todos', anoInicio = 2014, anoFim = 2026, agravo = 'DENV'): Observable<KPISummary> {
  const params = new HttpParams()
    .set('uf', uf)
    .set('ano_inicio', anoInicio.toString())
    .set('ano_fim', anoFim.toString())
    .set('agravo', agravo);  // NOVO
  
  return this.http.get<KPISummary>(`${this.baseUrl}/kpi/summary`, { params }).pipe(
    catchError(() => of(this.getMockKpis(uf, anoInicio, anoFim, agravo)))
  );
}
```

#### 6.5 Adaptar visual por doença

```typescript
// theme.service.ts — Adicionar variáveis CSS por doença:
setDiseaseTheme(agravo: ArbovirusCode): void {
  const colors = {
    'DENV': { primary: '#ef4444', soft: 'rgba(239,68,68,0.1)' },
    'CHIKV': { primary: '#f97316', soft: 'rgba(249,115,22,0.1)' },
    'ZIKV': { primary: '#8b5cf6', soft: 'rgba(139,92,246,0.1)' },
    'YFV': { primary: '#eab308', soft: 'rgba(234,179,8,0.1)' }
  };
  const { primary, soft } = colors[agravo];
  document.documentElement.style.setProperty('--dengue-red', primary);
  document.documentElement.style.setProperty('--dengue-red-soft', soft);
}
```

---

### FASE 7: Preparação para Dados Reais (Estimativa: paralela às outras)

#### 7.1 Adicionar campo `agravo` no schema do banco (PostgreSQL)

```sql
-- dim_agravo: tabela de dimensão para tipos de arbovirose
CREATE TABLE dim_agravo (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(10) UNIQUE NOT NULL,  -- 'DENV', 'CHIKV', 'ZIKV', 'YFV'
    nome        VARCHAR(100) NOT NULL,
    sinan_code  VARCHAR(20),
    vetor       VARCHAR(200),
    cor_hex     VARCHAR(7)
);

-- fato_casos: adicionar FK para agravo
ALTER TABLE fato_casos ADD COLUMN agravo_id INTEGER REFERENCES dim_agravo(id);
```

#### 7.2 Pipeline ETL por agravo

O `sinan_download_data.R` do legado deve ser traduzido para Python com suporte a múltiplos agravos:

```python
# app/etl/sinan_extractor.py

SINAN_DATASETS = {
    "DENV": ["DENGBR{year}.dbc", "DENG{year}.dbc"],   # Dengue
    "CHIKV": ["CHIKBR{year}.dbc"],                     # Chikungunya
    "ZIKV": ["ZIKABR{year}.dbc"],                      # Zika
    "YFV": ["FEBRBR{year}.dbc"],                       # Febre Amarela
}

def extract_sinan_data(agravo_code: str, year: int, output_dir: str):
    """Baixa e processa dados DBC do DataSUS para um agravo específico."""
    ...
```

---

## 5. Estimativa de Esforço Total

| Fase | Descrição | Complexidade | Dias Estimados |
|---|---|---|---|
| 1 | Constantes e domínio das arboviroses | Baixa | 3-5 dias |
| 2 | Schemas Pydantic + TypeScript | Média | 2-3 dias |
| 3 | MockDataGenerator multi-doença | Alta | 3-5 dias |
| 4 | MockRepository multi-doença | Média | 1-2 dias |
| 5 | Endpoints + Serviços com `agravo` | Baixa | 2-3 dias |
| 6 | Frontend: FilterBar + API Service + Visual | Alta | 3-4 dias |
| 7 | Schema banco + ETL multi-agravo | Alta | 5-10 dias |
| **TOTAL** | | | **~19-32 dias úteis** |

---

## 6. Ordem de Prioridade de Implementação

**Para entregar o mínimo viável (MVP multi-arbovirose) — ~2 semanas**:

```
1. constants.py → Adicionar ARBOVIROSES dict (Fase 1)
2. schemas → Adicionar campo agravo (Fase 2)
3. mock_data_generator.py → Parametrizar por agravo (Fase 3)
4. mock_repository.py → Separar dados por agravo (Fase 4)
5. Endpoints → Adicionar query param agravo (Fase 5)
6. FilterBar → Seletor de doença (Fase 6.3)
7. API Service → Propagar agravo (Fase 6.4)
8. Validação → Testar chikungunya, zika e febre amarela
```

**Para completude total (incluindo banco real) — +2-4 semanas**:

```
9. Schema PostgreSQL → dim_agravo + FK em fato_casos (Fase 7.1)
10. ETL Python → Traduzir sinan_download_data.R com multi-agravo (Fase 7.2)
11. Visual theme → Adaptar cores por doença (Fase 6.5)
```

---

## 7. Checklist de Arquivos a Modificar

### Backend
- [ ] `app/core/constants.py` — Adicionar `ArbovirusEnum`, `ARBOVIROSES`, `DEFAULT_AGRAVO`
- [ ] `app/schemas/filters.py` — Adicionar campo `agravo`
- [ ] `app/schemas/kpi.py` — Adicionar campo `agravo`
- [ ] `app/schemas/charts.py` — Adicionar campo `agravo` nas responses
- [ ] `app/schemas/spatial.py` — Adicionar campo `agravo`
- [ ] `app/schemas/alerts.py` — Adicionar campo `agravo`
- [ ] `app/schemas/simulation.py` — Adicionar campo `agravo`
- [ ] `app/mocks/mock_data_generator.py` — Parametrizar todos os métodos por `agravo`
- [ ] `app/repositories/mock_repository.py` — Separar dados por agravo
- [ ] `app/services/kpi_service.py` — Passar `agravo` ao repositório
- [ ] `app/services/temporal_service.py` — Passar `agravo` ao repositório
- [ ] `app/services/demography_service.py` — Manter (pirâmide é igual por doença)
- [ ] `app/services/epidemiology_service.py` — Passar `agravo` ao repositório
- [ ] `app/services/spatial_service.py` — Passar `agravo` ao repositório
- [ ] `app/services/alerts_service.py` — Filtrar alertas por `agravo`
- [ ] `app/services/simulation_service.py` — Usar parâmetros da doença
- [ ] `app/api/v1/endpoints/kpi.py` — Adicionar query param `agravo`
- [ ] `app/api/v1/endpoints/temporal.py` — Adicionar query param `agravo`
- [ ] `app/api/v1/endpoints/epidemiology.py` — Adicionar query param `agravo`
- [ ] `app/api/v1/endpoints/spatial.py` — Adicionar query param `agravo`
- [ ] `app/api/v1/endpoints/alerts.py` — Adicionar query param `agravo`
- [ ] `app/api/v1/endpoints/simulation.py` — Adicionar campo `agravo` no body
- [ ] `app/main.py` — Atualizar descrição da API para "Arboviroses"
- [ ] `app/core/config.py` — Atualizar `PROJECT_NAME`
- [ ] **[NOVO]** `app/etl/sinan_extractor.py` — Pipeline ETL multi-agravo

### Frontend
- [ ] `src/app/core/models/epidemiology.models.ts` — Adicionar `ArbovirusCode`, `ARBOVIROSES`, atualizar `DashboardFilter`
- [ ] `src/app/core/services/filter-state.service.ts` — Adicionar `agravo` ao estado inicial
- [ ] `src/app/core/services/epidemiology-api.service.ts` — Adicionar `agravo` em todos os métodos
- [ ] `src/app/shared/components/filter-bar/filter-bar.component.ts` — Adicionar seletor de doença
- [ ] `src/app/core/services/theme.service.ts` — Adaptar cores por doença selecionada
- [ ] Componentes de dashboard — Adaptar labels dinâmicos por doença

### Banco de Dados (futuro)
- [ ] Schema SQL — Adicionar `dim_agravo` e FK em `fato_casos`
- [ ] Índices — Adicionar índice por `agravo_id`
- [ ] ETL — Suporte a múltiplos datasets DBC por agravo
