import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EpidemiologyApiService } from '../../core/services/epidemiology-api.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { SimulationRequest, SimulationResponse } from '../../core/models/epidemiology.models';

@Component({
  selector: 'app-simulation-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simulation-container">
      <!-- Painel de Parâmetros e Sliders -->
      <div class="sim-controls card-gaara">
        <div class="sim-header">
          <div class="badge badge-info">
            Subprojeto 1 • Simulação de Cenários
          </div>
          <h2 class="sim-title">Simulador Climático e Epidemiológico</h2>
          <p class="sim-desc">
            Explore projeções hipotéticas de surto de arboviroses alterando anomalias térmicas e pluviométricas para suporte ao planejamento de contingência.
          </p>
        </div>

        <div class="sliders-grid">
          <!-- Slider Temperatura -->
          <div class="slider-box">
            <div class="slider-header">
              <span class="s-label">Variação de Temperatura (&Delta;T)</span>
              <span class="s-val text-red">{{ request.delta_temperatura > 0 ? '+' : '' }}{{ request.delta_temperatura }} ºC</span>
            </div>
            <input
              type="range"
              min="-3.0"
              max="5.0"
              step="0.5"
              [(ngModel)]="request.delta_temperatura"
              (ngModelChange)="runSimulation()"
              class="sim-range range-red"
            />
            <span class="s-hint">Acelera o ciclo de maturação do vetor (+8%/ºC)</span>
          </div>

          <!-- Slider Chuva -->
          <div class="slider-box">
            <div class="slider-header">
              <span class="s-label">Precipitação / Pluviosidade</span>
              <span class="s-val text-blue">{{ request.delta_precipitacao > 0 ? '+' : '' }}{{ request.delta_precipitacao }}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              step="5"
              [(ngModel)]="request.delta_precipitacao"
              (ngModelChange)="runSimulation()"
              class="sim-range range-blue"
            />
            <span class="s-hint">Geração de criadouros e reservatórios urbanos</span>
          </div>

          <!-- Slider Umidade -->
          <div class="slider-box">
            <div class="slider-header">
              <span class="s-label">Umidade Relativa do Ar</span>
              <span class="s-val text-teal">{{ request.delta_umidade > 0 ? '+' : '' }}{{ request.delta_umidade }}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="5"
              [(ngModel)]="request.delta_umidade"
              (ngModelChange)="runSimulation()"
              class="sim-range range-teal"
            />
            <span class="s-hint">Sobrevivência e longevidade do mosquito adulto</span>
          </div>
        </div>

        <div class="sim-actions">
          <button class="btn-gaara" (click)="resetParams()">Restaurar Parâmetros Padrão</button>
        </div>
      </div>

      <!-- Resultado da Projeção -->
      <div class="sim-results card-gaara" *ngIf="response">
        <div class="res-top">
          <div>
            <h3 class="res-title">Impacto Estimado no Volume de Infecções</h3>
            <p class="res-sub">Projeção para as próximas {{ request.semanas_projecao }} semanas epidemiológicas</p>
          </div>
          <div class="impact-badge" [ngClass]="response.aumento_medio_casos_pct >= 0 ? 'impact-up' : 'impact-down'">
            <span class="impact-val">{{ response.aumento_medio_casos_pct > 0 ? '+' : '' }}{{ response.aumento_medio_casos_pct }}%</span>
            <span class="impact-lbl">Variação na Carga Viral Estimada</span>
          </div>
        </div>

        <!-- Curva Comparativa SVG (Baseline vs Simulado) -->
        <div class="svg-container">
          <svg class="sim-svg" viewBox="0 0 800 280" preserveAspectRatio="none">
            <line x1="50" y1="40" x2="780" y2="40" stroke="var(--border-color)" stroke-dasharray="3,3" />
            <line x1="50" y1="120" x2="780" y2="120" stroke="var(--border-color)" stroke-dasharray="3,3" />
            <line x1="50" y1="200" x2="780" y2="200" stroke="var(--border-color)" stroke-dasharray="3,3" />
            <line x1="50" y1="240" x2="780" y2="240" stroke="var(--text-muted)" />

            <!-- Linha Baseline -->
            <path
              [attr.d]="baselinePath"
              fill="none"
              stroke="var(--text-muted)"
              stroke-width="2"
              stroke-dasharray="5,5"
            />

            <!-- Linha Simulada -->
            <path
              [attr.d]="simulatedPath"
              fill="none"
              stroke="var(--dengue-red)"
              stroke-width="3"
            />

            <!-- Pontos da Curva Simulada -->
            <circle
              *ngFor="let p of response.curva_projecao; let i = index"
              [attr.cx]="getX(i)"
              [attr.cy]="getY(p.casos_simulados)"
              r="4"
              fill="var(--dengue-red)"
              stroke="#ffffff"
              stroke-width="2"
            >
              <title>Semana +{{ p.semana_projecao }}: {{ p.casos_simulados | number }} casos simulados (Baseline: {{ p.casos_baseline | number }})</title>
            </circle>

            <!-- Rótulos do Eixo X -->
            <text
              *ngFor="let p of response.curva_projecao; let i = index"
              [attr.x]="getX(i)"
              y="262"
              class="axis-label"
              text-anchor="middle"
            >
              Sem +{{ p.semana_projecao }}
            </text>
          </svg>
        </div>

        <div class="sim-legend-footer">
          <div class="sim-legend-row">
            <span class="legend-line line-dashed"></span> <span>Cenário Tendencial (Baseline)</span>
            <span class="legend-line line-red"></span> <span>Cenário Simulado sob Condições Hipotéticas</span>
          </div>
          <span class="method-note">{{ response.nota_metodologica }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .sim-controls {
      padding: 24px;
    }

    .sim-header {
      margin-bottom: 20px;
    }

    .sim-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-top: 6px;
    }

    .sim-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .sliders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .slider-box {
      background: var(--bg-tertiary);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .s-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .s-val {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 0.95rem;

      &.text-red { color: var(--dengue-red); }
      &.text-blue { color: var(--dengue-blue); }
      &.text-teal { color: var(--dengue-teal); }
    }

    .sim-range {
      width: 100%;
      cursor: pointer;

      &.range-red { accent-color: var(--dengue-red); }
      &.range-blue { accent-color: var(--dengue-blue); }
      &.range-teal { accent-color: var(--dengue-teal); }
    }

    .s-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .sim-actions {
      display: flex;
      justify-content: flex-end;
    }

    .sim-results {
      padding: 24px;
    }

    .res-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .res-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .res-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .impact-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: 8px 16px;
      border-radius: 12px;

      &.impact-up {
        background: var(--dengue-red-soft);
        color: var(--dengue-red);
      }

      &.impact-down {
        background: var(--dengue-teal-soft);
        color: var(--dengue-teal);
      }

      .impact-val { font-size: 1.4rem; font-weight: 800; }
      .impact-lbl { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    }

    .svg-container {
      width: 100%;
    }

    .sim-svg {
      width: 100%;
      height: 260px;
    }

    .axis-label {
      font-size: 10px;
      fill: var(--text-muted);
      font-family: inherit;
    }

    .sim-legend-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .sim-legend-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .legend-line {
      width: 20px;
      height: 3px;
      display: inline-block;

      &.line-dashed { background: var(--text-muted); border-top: 2px dashed var(--text-muted); height: 0; }
      &.line-red { background: var(--dengue-red); }
    }

    .method-note {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
    }
  `]
})
export class SimulationViewComponent implements OnInit {
  request: SimulationRequest = {
    uf: 'Todos',
    delta_temperatura: 1.5,
    delta_precipitacao: 20.0,
    delta_umidade: 10.0,
    semanas_projecao: 12
  };

  response: SimulationResponse | null = null;
  baselinePath = '';
  simulatedPath = '';
  maxY = 1;

  constructor(
    private apiService: EpidemiologyApiService,
    private filterService: FilterStateService
  ) {}

  ngOnInit(): void {
    this.filterService.filter$.subscribe(f => {
      this.request.uf = f.uf;
      this.runSimulation();
    });
  }

  runSimulation(): void {
    this.apiService.simulateScenario(this.request).subscribe(res => {
      this.response = res;
      this.computeSvgPaths();
    });
  }

  resetParams(): void {
    this.request.delta_temperatura = 0.0;
    this.request.delta_precipitacao = 0.0;
    this.request.delta_umidade = 0.0;
    this.runSimulation();
  }

  private computeSvgPaths(): void {
    if (!this.response) return;

    const items = this.response.curva_projecao;
    this.maxY = Math.max(
      ...items.map(p => Math.max(p.casos_baseline, p.casos_simulados)),
      1
    ) * 1.15;

    const baseParts: string[] = [];
    const simParts: string[] = [];

    items.forEach((p, i) => {
      const x = this.getX(i);
      const yBase = this.getY(p.casos_baseline);
      const ySim = this.getY(p.casos_simulados);

      if (i === 0) {
        baseParts.push(`M ${x} ${yBase}`);
        simParts.push(`M ${x} ${ySim}`);
      } else {
        baseParts.push(`L ${x} ${yBase}`);
        simParts.push(`L ${x} ${ySim}`);
      }
    });

    this.baselinePath = baseParts.join(' ');
    this.simulatedPath = simParts.join(' ');
  }

  getX(index: number): number {
    const total = Math.max(1, (this.response?.curva_projecao.length || 1) - 1);
    return 60 + (index / total) * 700;
  }

  getY(val: number): number {
    const ratio = val / this.maxY;
    return 240 - ratio * 200;
  }
}
