# GAARA-II — Análise de Conformidade com o Projeto de Pesquisa e Lacunas

> **Referência**: "Projeto de Pesquisa (2).pdf" — *Desenvolvimento de um Dashboard Inteligente para Monitoramento e Previsão de Vírus Emergentes no Brasil*  
> **Data**: 22/08/2026

---

## 1. Resumo do Projeto de Pesquisa (PDF)

O projeto de pesquisa propõe o desenvolvimento de um **dashboard inteligente e preditivo** para monitoramento e previsão da **dengue no Brasil**, com possibilidade de expansão futura para outras arboviroses (chikungunya, Zika, febre amarela). Estrutura-se em dois subprojetos:

- **Subprojeto 1 (Modelagem Preditiva)**: Pipeline ETL + Banco de Dados Integrado + Suite de Modelos (SARIMA, GLMM, Random Forest, XGBoost, LSTM, Híbrido SARIMA-LSTM)
- **Subprojeto 2 (Dashboard e Alertas)**: Dashboard interativo Angular + FastAPI + Sistema de Alerta Precoce + Simulação de Cenários

---

## 2. Matriz de Conformidade — Funcionalidades Implementadas vs. Requisitadas

### 2.1 Interface e Visualizações

| Funcionalidade Requisitada (PDF) | Status no GAARA-II | Detalhes |
|---|:---:|---|
| Dashboard interativo com filtros por UF e ano | ✅ **IMPLEMENTADO** | `filter-bar.component.ts` com BehaviorSubject |
| Cards KPI: total notificados, confirmados, óbitos | ✅ **IMPLEMENTADO** | `kpi-cards` com 4 indicadores principais + incidência e letalidade |
| Gráfico de séries temporais (evolução histórica) | ✅ **IMPLEMENTADO** | `temporal-chart` — barras + linha mensal 2014–2026 |
| Mapa coroplético georreferenciado interativo | ✅ **IMPLEMENTADO** | `map-view` com Leaflet.js, 5 faixas de incidência |
| Diagrama de Controle / Canal Endêmico (Q1/Med/Q3) | ✅ **IMPLEMENTADO** | `control-diagram` com Q1, Mediana, Q3 e incidência atual |
| Pirâmide etária por sexo e faixa etária | ✅ **IMPLEMENTADO** | `pyramid-chart` com faixas 0-4 a 80+ |
| Tabela de dados analíticos com ranking de estados | ✅ **IMPLEMENTADO** | `data-table` com estados e indicadores |
| Simulação de cenários climáticos interativa | ✅ **IMPLEMENTADO** | `simulation-view` com 3 sliders (temperatura, chuva, umidade) |
| Sistema de Alerta Precoce com níveis de risco | ✅ **IMPLEMENTADO** | `alerts-view` com classificação Crítico/Alto/Moderado/Baixo |
| Dark/Light Mode | ✅ **IMPLEMENTADO** | `theme.service.ts` com toggle e persistência |
| Filtro por semana epidemiológica | ⚠️ **PARCIAL** | Interface tem `semana_inicio/semana_fim` mas não exposto na FilterBar |
| Gráfico de evolução com sobreposição de variáveis climáticas | ❌ **AUSENTE** | PDF pede sobreposição de temperatura/chuva nos gráficos temporais |
| Painel customizável por usuário | ❌ **AUSENTE** | PDF menciona "painéis customizáveis pelo usuário" |
| Análise por raça/cor | ❌ **AUSENTE** | Constante definida (`RACA_COR_LIST`) mas nenhum endpoint ou componente |
| Visualização de hotspots de transmissão | ❌ **AUSENTE** | PDF menciona identificação de hotspots via modelos preditivos |
| Análise socioeconômica integrada | ❌ **AUSENTE** | Nenhum dado ou visualização socioeconômica |

---

### 2.2 Dados e Backend

| Requisito (PDF) | Status no GAARA-II | Detalhes |
|---|:---:|---|
| Backend em Python + FastAPI | ✅ **IMPLEMENTADO** | FastAPI v2, Uvicorn, Pydantic v2 |
| Frontend em Angular | ✅ **IMPLEMENTADO** | Angular 17+ com Standalone Components |
| API RESTful para comunicação | ✅ **IMPLEMENTADO** | 7 endpoints documentados com Swagger |
| Comunicação assíncrona via Celery + Redis | ❌ **AUSENTE** | Mencionado no requirements mas não implementado |
| Banco PostgreSQL + PostGIS | ❌ **AUSENTE** | Apenas MockRepository em memória |
| Pipeline ETL (SINAN/DataSUS) | ❌ **AUSENTE** | Não traduzido do R ainda |
| Dados climáticos integrados (INMET, CPTEC, NOAA) | ❌ **AUSENTE** | Sem integração com dados meteorológicos reais |
| Dados socioeconômicos (IBGE) | ❌ **AUSENTE** | Sem integração com dados do IBGE |
| Atualização periódica automatizada | ❌ **AUSENTE** | Sistema não tem agendamento de atualizações |
| Alertas por e-mail para autoridades | ❌ **AUSENTE** | Alertas apenas na interface, sem notificação externa |
| Painel de gerenciamento de histórico de alertas | ❌ **AUSENTE** | Sistema de alertas não persiste histórico |

---

### 2.3 Modelos Preditivos

| Modelo (PDF) | Status no GAARA-II | Detalhes |
|---|:---:|---|
| SARIMA (previsão sazonal) | ❌ **STUB** | Interface `PredictionResponse` definida, endpoint não existe no backend |
| GLMM (análise espaço-temporal) | ❌ **AUSENTE** | Apenas mencionado na nota metodológica |
| Random Forest | ❌ **AUSENTE** | Não implementado |
| XGBoost | ❌ **AUSENTE** | Não implementado |
| LSTM (dependências temporais) | ❌ **STUB** | Citado na `nota_metodologica` do `SimulationResponse` |
| Modelo Híbrido SARIMA-LSTM | ❌ **STUB** | `getMockPrediction()` menciona "Híbrido SARIMA-LSTM (Stub/Mock)" |
| Validação por RMSE, MAE, R² | ❌ **AUSENTE** | Sem métricas de validação |
| Validação por AUC-ROC, F1-score | ❌ **AUSENTE** | Sem métricas de classificação |
| Curva preditiva com bandas de confiança | ⚠️ **PARCIAL** | Interface TypeScript tem `limite_inferior/limite_superior` mas não há endpoint funcional |

---

### 2.4 Expansão para Outras Arboviroses

| Requisito (PDF) | Status no GAARA-II | Detalhes |
|---|:---:|---|
| Suporte a dengue | ✅ **IMPLEMENTADO** | Sistema inteiro construído para dengue |
| Suporte a chikungunya | ❌ **AUSENTE** | Nenhum dado, endpoint ou filtro |
| Suporte a Zika | ❌ **AUSENTE** | Nenhum dado, endpoint ou filtro |
| Suporte a febre amarela | ❌ **AUSENTE** | Nenhum dado, endpoint ou filtro |
| Filtro por tipo de agravo/doença | ❌ **AUSENTE** | Nenhum campo `agravo` em nenhum schema |
| Sazonalidade diferenciada por arbovirose | ❌ **AUSENTE** | Sazonalidade única e hardcoded para dengue |

---

### 2.5 Validação e Qualidade

| Requisito (PDF) | Status no GAARA-II | Detalhes |
|---|:---:|---|
| Testes automatizados (pytest) | ⚠️ **PARCIAL** | Diretório `backend/tests/` configurado com `pytest.ini`, mas implementação pendente |
| Testes com profissionais de saúde (SUS) | ❌ **FUTURO** | Fase piloto não iniciada |
| Documentação OpenAPI | ✅ **IMPLEMENTADO** | Swagger em `/api/v1/docs`, ReDoc em `/api/v1/redoc` |
| Repositório científico aberto | ❌ **AUSENTE** | Git privado, sem publicação open source ainda |

---

## 3. Lacunas Críticas por Prioridade

### 🔴 CRÍTICAS (Bloqueiam funcionalidade core)

1. **Banco de Dados PostgreSQL/PostGIS**: Todo o sistema usa dados mockados. Sem banco real, as visualizações não refletem dados epidemiológicos verdadeiros.

2. **Pipeline ETL (SINAN/DataSUS)**: O script `sinan_download_data.R` do projeto legado não foi traduzido para Python. Sem ETL, nenhum dado real pode ser ingerido.

3. **Modelos Preditivos**: SARIMA, GLMM, XGBoost, Random Forest e LSTM foram prometidos como produto core do projeto. Atualmente são apenas stubs/placeholders.

4. **Suporte a Múltiplas Arboviroses**: O PDF é claro que o sistema deve ser expansível. Atualmente é 100% dengue-específico em dados, schemas e lógica.

---

### 🟡 IMPORTANTES (Comprometem completude)

5. **Processamento Assíncrono (Celery + Redis)**: Necessário para atualização periódica de previsões e envio de alertas automáticos.

6. **Integração de Dados Climáticos**: INMET, CPTEC e NOAA mencionados como fontes obrigatórias para alimentar os modelos preditivos.

7. **Dados Socioeconômicos (IBGE)**: Variáveis socioeconômicas são determinantes importantes dos modelos.

8. **Sistema de Notificação por E-mail**: Alertas automáticos a autoridades sanitárias são um produto esperado.

9. **Análise por Raça/Cor**: Constante definida no backend mas sem endpoint ou componente visual.

10. **Sobreposição de Variáveis Climáticas nos Gráficos**: PDF pede contextualização climática nos gráficos temporais.

---

### 🟢 PLANEJADAS (Próximos ciclos)

11. **Testes Piloto com Profissionais de Saúde**: Protocolo SUS (System Usability Scale) descrito no PDF.

12. **Painel de Histórico de Alertas**: Gerenciamento de notificações com rastreamento de ações.

13. **Análise de Hotspots**: Identificação de clusters de transmissão via modelos preditivos.

14. **Website Oficial do Projeto**: Produto 8 do PDF.

15. **Material de Capacitação**: Guias de uso, tutoriais em vídeo, infográficos.

---

## 4. O que Está Bem Implementado

O GAARA-II atinge com excelência a **camada de visualização e arquitetura de software** exigida pelo PDF:

- ✅ Arquitetura modular desacoplada (Angular + FastAPI)
- ✅ API RESTful documentada com 7 endpoints distintos
- ✅ Design system com Dark/Light mode, tipografia moderna, design premium
- ✅ Filtros globais reativos (BehaviorSubject / RxJS)
- ✅ Todos os 6 gráficos/visualizações básicas implementados
- ✅ Sistema de alertas com classificação de risco e ações recomendadas
- ✅ Simulador de cenários climáticos interativo
- ✅ Estratégia de mock determinístico que permite desenvolvimento sem banco de dados
- ✅ Contratos TypeScript + Pydantic end-to-end tipados
- ✅ Estrutura preparada para conectar banco de dados (padrão Repository)
- ✅ Interfaces para modelos preditivos (stubs com contratos definidos)

---

## 5. Roadmap de Conformidade

Para o GAARA-II atingir 100% dos requisitos do Projeto de Pesquisa:

```
FASE ATUAL → Dashboard funcional com dados mockados
     ↓
FASE 1: Banco de Dados + ETL
  - PostgreSQL + PostGIS setup
  - Pipeline ETL (tradução do sinan_download_data.R → Python)
  - Dados climáticos INMET/CPTEC/NOAA
  - Dados socioeconômicos IBGE
     ↓
FASE 2: Múltiplas Arboviroses
  - Suporte a chikungunya, Zika, febre amarela no schema
  - Filtro por agravo na API e UI
  - Sazonalidade diferenciada por doença
     ↓
FASE 3: Modelos Preditivos
  - SARIMA para previsão sazonal
  - GLMM para análise espaço-temporal
  - XGBoost + Random Forest para variáveis múltiplas
  - LSTM para dependências temporais longas
  - Modelo híbrido SARIMA-LSTM
     ↓
FASE 4: Sistema Operacional
  - Celery + Redis para processamento assíncrono
  - Notificações por e-mail para autoridades
  - Histórico e gerenciamento de alertas
     ↓
FASE 5: Validação e Publicação
  - Testes piloto com profissionais de saúde (SUS)
  - Publicações científicas
  - Website oficial e material de capacitação
```
