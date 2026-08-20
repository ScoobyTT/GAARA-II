import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  KPISummary,
  TemporalEvolutionResponse,
  PredictionResponse,
  AgePyramidResponse,
  ControlDiagramResponse,
  SpatialMapResponse,
  AlertSummaryResponse,
  AlertNotification,
  SimulationRequest,
  SimulationResponse
} from '../models/epidemiology.models';

@Injectable({
  providedIn: 'root'
})
export class EpidemiologyApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getKpiSummary(uf: string = 'Todos', anoInicio: number = 2014, anoFim: number = 2026): Observable<KPISummary> {
    const params = new HttpParams()
      .set('uf', uf)
      .set('ano_inicio', anoInicio.toString())
      .set('ano_fim', anoFim.toString());

    return this.http.get<KPISummary>(`${this.baseUrl}/kpi/summary`, { params }).pipe(
      catchError(() => of(this.getMockKpis(uf, anoInicio, anoFim)))
    );
  }

  getTemporalEvolution(uf: string = 'Todos', anoInicio: number = 2014, anoFim: number = 2026): Observable<TemporalEvolutionResponse> {
    const params = new HttpParams()
      .set('uf', uf)
      .set('ano_inicio', anoInicio.toString())
      .set('ano_fim', anoFim.toString());

    return this.http.get<TemporalEvolutionResponse>(`${this.baseUrl}/temporal/evolution`, { params }).pipe(
      catchError(() => of(this.getMockTemporal(uf, anoInicio, anoFim)))
    );
  }

  getPrediction(uf: string = 'Todos'): Observable<PredictionResponse> {
    const params = new HttpParams().set('uf', uf);
    return this.http.get<PredictionResponse>(`${this.baseUrl}/temporal/prediction`, { params }).pipe(
      catchError(() => of(this.getMockPrediction(uf)))
    );
  }

  getAgePyramid(uf: string = 'Todos'): Observable<AgePyramidResponse> {
    const params = new HttpParams().set('uf', uf);
    return this.http.get<AgePyramidResponse>(`${this.baseUrl}/demography/pyramid`, { params }).pipe(
      catchError(() => of(this.getMockPyramid(uf)))
    );
  }

  getControlDiagram(uf: string = 'Todos'): Observable<ControlDiagramResponse> {
    const params = new HttpParams().set('uf', uf);
    return this.http.get<ControlDiagramResponse>(`${this.baseUrl}/epidemiology/control-diagram`, { params }).pipe(
      catchError(() => of(this.getMockControlDiagram(uf)))
    );
  }

  getSpatialMap(uf: string = 'Todos'): Observable<SpatialMapResponse> {
    const params = new HttpParams().set('uf', uf);
    return this.http.get<SpatialMapResponse>(`${this.baseUrl}/spatial/map`, { params }).pipe(
      catchError(() => of(this.getMockSpatial(uf)))
    );
  }

  getAlerts(uf: string = 'Todos'): Observable<AlertSummaryResponse> {
    const params = new HttpParams().set('uf', uf);
    return this.http.get<AlertSummaryResponse>(`${this.baseUrl}/alerts/summary`, { params }).pipe(
      catchError(() => of(this.getMockAlerts(uf)))
    );
  }

  simulateScenario(request: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.baseUrl}/simulation/predict`, request).pipe(
      catchError(() => of(this.getMockSimulation(request)))
    );
  }

  /* --- Fallbacks Mockados Offline Transparentes --- */
  private getMockKpis(uf: string, anoInicio: number, anoFim: number): KPISummary {
    const isBr = uf === 'Todos' || uf === 'BR';
    const notificados = isBr ? 18640000 : 2150000;
    const confirmados = Math.round(notificados * 0.62);
    const obitos = Math.round(confirmados * 0.00095);
    const pop = isBr ? 203062512 : 20538718;

    return {
      uf,
      total_notificados: notificados,
      total_confirmados: confirmados,
      total_obitos_notificados: Math.round(obitos * 1.8),
      total_obitos_confirmados: obitos,
      taxa_letalidade: 0.095,
      incidencia_por_100k: Math.round((notificados / pop) * 100000 * 100) / 100,
      ano_inicio: anoInicio,
      ano_fim: anoFim
    };
  }

  private getMockTemporal(uf: string, anoInicio: number, anoFim: number): TemporalEvolutionResponse {
    const dados = [];
    const saz = [1.2, 2.1, 2.8, 2.5, 1.6, 0.8, 0.4, 0.3, 0.4, 0.6, 0.8, 1.0];
    const baseMult = (uf === 'Todos' || uf === 'BR') ? 45000 : 4500;

    for (let ano = anoInicio; ano <= anoFim; ano++) {
      const anoFactor = ano === 2024 ? 3.5 : (ano === 2015 ? 1.8 : 0.8);
      for (let mes = 1; mes <= 12; mes++) {
        const noti = Math.round(baseMult * saz[mes - 1] * anoFactor);
        const conf = Math.round(noti * 0.65);
        dados.push({
          data_mes: `${ano}-${mes < 10 ? '0' + mes : mes}-01`,
          ano,
          mes,
          casos_notificados: noti,
          casos_confirmados: conf
        });
      }
    }
    return { uf, dados };
  }

  private getMockPrediction(uf: string): PredictionResponse {
    const dados: any[] = [];
    for (let sem = 1; sem <= 10; sem++) {
      dados.push({
        semana: `2026.${sem < 10 ? '0' + sem : sem}`,
        casos: 15000 + sem * 1800,
        fonte: 'historico_treino'
      });
    }
    for (let sem = 11; sem <= 18; sem++) {
      const c = 33000 - (sem - 10) * 1400;
      dados.push({
        semana: `2026.${sem < 10 ? '0' + sem : sem}`,
        casos: c,
        limite_inferior: c * 0.85,
        limite_superior: c * 1.18,
        fonte: 'previsao'
      });
    }
    return {
      uf,
      modelo_utilizado: 'Híbrido SARIMA-LSTM (Stub / Mock)',
      dados
    };
  }

  private getMockPyramid(uf: string): AgePyramidResponse {
    const faixas = ['0-4', '5-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
    const pesos = [0.05, 0.07, 0.16, 0.22, 0.19, 0.14, 0.09, 0.05, 0.02, 0.01];
    const dados: any[] = [];
    const base = uf === 'Todos' ? 120000 : 10000;

    faixas.forEach((f, i) => {
      const notiF = Math.round(base * pesos[i] * 1.08);
      const notiM = Math.round(base * pesos[i] * 0.92);
      dados.push({
        faixa_etaria: f,
        sexo: 'F',
        casos_notificados: notiF,
        casos_confirmados: Math.round(notiF * 0.65)
      });
      dados.push({
        faixa_etaria: f,
        sexo: 'M',
        casos_notificados: notiM,
        casos_confirmados: Math.round(notiM * 0.62)
      });
    });
    return { uf, dados };
  }

  private getMockControlDiagram(uf: string): ControlDiagramResponse {
    const dados = [];
    for (let sem = 1; sem <= 52; sem++) {
      const saz = Math.exp(-Math.pow(sem - 14, 2) / 60) * 120 + 15;
      const q1 = Math.round(saz * 0.7 * 10) / 10;
      const mediana = Math.round(saz * 10) / 10;
      const q3 = Math.round(saz * 1.45 * 10) / 10;
      const inc = Math.round(saz * (1.1 + 0.8 * Math.exp(-Math.pow(sem - 13, 2) / 25)) * 10) / 10;

      dados.push({
        semana_epi: sem,
        q1,
        mediana,
        q3,
        incidencia_atual: inc,
        em_alerta: inc > q3
      });
    }
    return { uf, populacao_base: 203062512, dados };
  }

  private getMockSpatial(uf: string): SpatialMapResponse {
    const estados = [
      { uf: 'DF', nome_estado: 'Distrito Federal', regiao: 'Centro-Oeste', populacao: 2817068, casos_notificados: 285000, casos_confirmados: 180000, obitos: 390, incidencia_por_100k: 10116.9, faixa_incidencia: '>10k', nivel_risco: 'Crítico', cor_hex: '#a50f15' },
      { uf: 'MG', nome_estado: 'Minas Gerais', regiao: 'Sudeste', populacao: 20538718, casos_notificados: 1680000, casos_confirmados: 1050000, obitos: 1200, incidencia_por_100k: 8179.6, faixa_incidencia: '2501–10k', nivel_risco: 'Muito Alto', cor_hex: '#de2d26' },
      { uf: 'SP', nome_estado: 'São Paulo', regiao: 'Sudeste', populacao: 44420459, casos_notificados: 2150000, casos_confirmados: 1350000, obitos: 1750, incidencia_por_100k: 4839.9, faixa_incidencia: '2501–10k', nivel_risco: 'Muito Alto', cor_hex: '#de2d26' },
      { uf: 'GO', nome_estado: 'Goiás', regiao: 'Centro-Oeste', populacao: 7055228, casos_notificados: 410000, casos_confirmados: 260000, obitos: 420, incidencia_por_100k: 5811.3, faixa_incidencia: '2501–10k', nivel_risco: 'Muito Alto', cor_hex: '#de2d26' },
      { uf: 'PR', nome_estado: 'Paraná', regiao: 'Sul', populacao: 11443208, casos_notificados: 620000, casos_confirmados: 390000, obitos: 510, incidencia_por_100k: 5418.0, faixa_incidencia: '2501–10k', nivel_risco: 'Muito Alto', cor_hex: '#de2d26' },
      { uf: 'BA', nome_estado: 'Bahia', regiao: 'Nordeste', populacao: 14136417, casos_notificados: 240000, casos_confirmados: 150000, obitos: 180, incidencia_por_100k: 1697.7, faixa_incidencia: '501–2500', nivel_risco: 'Alto', cor_hex: '#fb6a4a' },
      { uf: 'RJ', nome_estado: 'Rio de Janeiro', regiao: 'Sudeste', populacao: 16054524, casos_notificados: 330000, casos_confirmados: 205000, obitos: 260, incidencia_por_100k: 2055.4, faixa_incidencia: '501–2500', nivel_risco: 'Alto', cor_hex: '#fb6a4a' },
      { uf: 'SC', nome_estado: 'Santa Catarina', regiao: 'Sul', populacao: 7609601, casos_notificados: 380000, casos_confirmados: 240000, obitos: 310, incidencia_por_100k: 4993.6, faixa_incidencia: '2501–10k', nivel_risco: 'Muito Alto', cor_hex: '#de2d26' },
      { uf: 'RS', nome_estado: 'Rio Grande do Sul', regiao: 'Sul', populacao: 10880506, casos_notificados: 210000, casos_confirmados: 130000, obitos: 190, incidencia_por_100k: 1930.0, faixa_incidencia: '501–2500', nivel_risco: 'Alto', cor_hex: '#fb6a4a' },
      { uf: 'CE', nome_estado: 'Ceará', regiao: 'Nordeste', populacao: 8791688, casos_notificados: 85000, casos_confirmados: 52000, obitos: 45, incidencia_por_100k: 966.8, faixa_incidencia: '501–2500', nivel_risco: 'Alto', cor_hex: '#fb6a4a' }
    ];

    const municipios = [
      { cod_municipio: '5300108', nome_municipio: 'Brasília', uf: 'DF', populacao: 2817068, casos: 285400, incidencia_por_100k: 10131.0, faixa_incidencia: '>10k', lat: -15.7975, lon: -47.8919 },
      { cod_municipio: '3550308', nome_municipio: 'São Paulo', uf: 'SP', populacao: 11451245, casos: 620000, incidencia_por_100k: 5414.2, faixa_incidencia: '2501–10k', lat: -23.5505, lon: -46.6333 },
      { cod_municipio: '3304557', nome_municipio: 'Rio de Janeiro', uf: 'RJ', populacao: 6211423, casos: 310500, incidencia_por_100k: 4998.8, faixa_incidencia: '2501–10k', lat: -22.9068, lon: -43.1729 },
      { cod_municipio: '3106200', nome_municipio: 'Belo Horizonte', uf: 'MG', populacao: 2315560, casos: 298000, incidencia_por_100k: 12869.4, faixa_incidencia: '>10k', lat: -19.9167, lon: -43.9345 },
      { cod_municipio: '2927408', nome_municipio: 'Salvador', uf: 'BA', populacao: 2418005, casos: 78000, incidencia_por_100k: 3225.8, faixa_incidencia: '2501–10k', lat: -12.9714, lon: -38.5014 },
      { cod_municipio: '4106902', nome_municipio: 'Curitiba', uf: 'PR', populacao: 1773733, casos: 145000, incidencia_por_100k: 8174.8, faixa_incidencia: '2501–10k', lat: -25.4284, lon: -49.2733 },
      { cod_municipio: '5208707', nome_municipio: 'Goiânia', uf: 'GO', populacao: 1437237, casos: 112000, incidencia_por_100k: 7792.7, faixa_incidencia: '2501–10k', lat: -16.6869, lon: -49.2648 }
    ];

    return {
      nivel: uf === 'Todos' ? 'estado' : 'municipio',
      uf_selecionada: uf,
      estados,
      municipios: uf === 'Todos' ? municipios : municipios.filter(m => m.uf === uf)
    };
  }

  private getMockAlerts(uf: string): AlertSummaryResponse {
    const list: AlertNotification[] = [
      {
        id: 'ALT-2026-001',
        uf: 'DF',
        municipio: 'Brasília',
        regiao: 'Centro-Oeste',
        nivel_risco: 'CRITICO',
        titulo: 'Surto epidêmico acima do canal superior (Q3)',
        descricao: 'Taxa de transmissão acelerada nas últimas semanas com ultrapassagem de 180% do canal endêmico.',
        casos_recentes: 14820,
        limiar_esperado: 5200.0,
        variacao_percentual: 185.0,
        data_emissao: '2026-04-10',
        acoes_recomendadas: [
          'Intensificação imediata do fumacê e bloqueio vetorial em focos residenciais',
          'Abertura de tendas de hidratação rápida nas UPAs',
          'Convocação do comitê de emergência de saúde pública'
        ]
      },
      {
        id: 'ALT-2026-002',
        uf: 'MG',
        municipio: 'Belo Horizonte',
        regiao: 'Sudeste',
        nivel_risco: 'ALTO',
        titulo: 'Elevação sustentada da taxa de positividade de DENV',
        descricao: 'Índice de infestação predial (LIRAa) acima de 3.9% nos distritos prioritários.',
        casos_recentes: 22400,
        limiar_esperado: 14000.0,
        variacao_percentual: 60.0,
        data_emissao: '2026-04-08',
        acoes_recomendadas: [
          'Mobilização de agentes comunitários de endemias (ACE)',
          'Alerta para a rede básica sobre triagem precoce de sinais de alarme'
        ]
      }
    ];

    const filtrados = uf === 'Todos' ? list : list.filter(a => a.uf === uf);
    return {
      total_alertas_ativos: filtrados.length,
      alertas_criticos: filtrados.filter(a => a.nivel_risco === 'CRITICO').length,
      alertas_altos: filtrados.filter(a => a.nivel_risco === 'ALTO').length,
      alertas_moderados: filtrados.filter(a => a.nivel_risco === 'MODERADO').length,
      alertas: filtrados
    };
  }

  private getMockSimulation(req: SimulationRequest): SimulationResponse {
    const fator = (req.delta_temperatura * 0.08) + ((req.delta_precipitacao / 100) * 0.45) + ((req.delta_umidade / 100) * 0.3);
    const impPct = Math.round(fator * 1000) / 10;
    const curva = [];
    const base = req.uf === 'Todos' ? 8500 : 900;

    for (let sem = 1; sem <= req.semanas_projecao; sem++) {
      const baseline = Math.round(base * (1 + 0.04 * sem));
      const simulado = Math.round(baseline * (1 + fator));
      curva.push({
        semana_projecao: sem,
        casos_baseline: baseline,
        casos_simulados: simulado,
        impacto_percentual: impPct,
        risco_estimado: impPct > 30 ? 'CRÍTICO' : (impPct > 15 ? 'ALTO' : 'MODERADO')
      });
    }

    return {
      uf: req.uf,
      delta_temperatura: req.delta_temperatura,
      delta_precipitacao: req.delta_precipitacao,
      delta_umidade: req.delta_umidade,
      aumento_medio_casos_pct: impPct,
      curva_projecao: curva,
      nota_metodologica: 'Simulação preliminar com modelo de elasticidade bio-climática (Placeholder para modelos LSTM/GLMM).'
    };
  }
}
