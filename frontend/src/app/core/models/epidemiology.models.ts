export interface DashboardFilter {
  uf: string;
  ano_inicio: number;
  ano_fim: number;
  semana_inicio?: number;
  semana_fim?: number;
}

export interface KPISummary {
  total_notificados: number;
  total_confirmados: number;
  total_obitos_notificados: number;
  total_obitos_confirmados: number;
  taxa_letalidade: number;
  incidencia_por_100k: number;
  uf: string;
  ano_inicio: number;
  ano_fim: number;
}

export interface TemporalPoint {
  data_mes: string;
  ano: number;
  mes: number;
  casos_notificados: number;
  casos_confirmados: number;
}

export interface TemporalEvolutionResponse {
  uf: string;
  dados: TemporalPoint[];
}

export interface PredictionPoint {
  semana: string;
  casos: number;
  limite_inferior?: number;
  limite_superior?: number;
  fonte: 'historico_completo' | 'historico_treino' | 'previsao';
}

export interface PredictionResponse {
  uf: string;
  modelo_utilizado: string;
  dados: PredictionPoint[];
}

export interface PyramidBar {
  faixa_etaria: string;
  sexo: 'M' | 'F';
  casos_notificados: number;
  casos_confirmados: number;
}

export interface AgePyramidResponse {
  uf: string;
  dados: PyramidBar[];
}

export interface ControlPoint {
  semana_epi: number;
  q1: number;
  mediana: number;
  q3: number;
  incidencia_atual: number;
  em_alerta: boolean;
}

export interface ControlDiagramResponse {
  uf: string;
  populacao_base: number;
  dados: ControlPoint[];
}

export interface StateIncidence {
  uf: string;
  nome_estado: string;
  regiao: string;
  populacao: number;
  casos_notificados: number;
  casos_confirmados: number;
  obitos: number;
  incidencia_por_100k: number;
  faixa_incidencia: string;
  nivel_risco: string;
  cor_hex: string;
}

export interface MunicipalityIncidence {
  cod_municipio: string;
  nome_municipio: string;
  uf: string;
  populacao: number;
  casos: number;
  incidencia_por_100k: number;
  faixa_incidencia: string;
  lat?: number;
  lon?: number;
}

export interface SpatialMapResponse {
  nivel: 'estado' | 'municipio';
  uf_selecionada: string;
  estados: StateIncidence[];
  municipios: MunicipalityIncidence[];
}

export interface AlertNotification {
  id: string;
  uf: string;
  municipio?: string;
  regiao: string;
  nivel_risco: 'CRITICO' | 'ALTO' | 'MODERADO' | 'BAIXO';
  titulo: string;
  descricao: string;
  casos_recentes: number;
  limiar_esperado: number;
  variacao_percentual: number;
  data_emissao: string;
  acoes_recomendadas: string[];
}

export interface AlertSummaryResponse {
  total_alertas_ativos: number;
  alertas_criticos: number;
  alertas_altos: number;
  alertas_moderados: number;
  alertas: AlertNotification[];
}

export interface SimulationRequest {
  uf: string;
  delta_temperatura: number;
  delta_precipitacao: number;
  delta_umidade: number;
  semanas_projecao: number;
}

export interface SimulationPoint {
  semana_projecao: number;
  casos_baseline: number;
  casos_simulados: number;
  impacto_percentual: number;
  risco_estimado: string;
}

export interface SimulationResponse {
  uf: string;
  delta_temperatura: number;
  delta_precipitacao: number;
  delta_umidade: number;
  aumento_medio_casos_pct: number;
  curva_projecao: SimulationPoint[];
  nota_metodologica: string;
}
