import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemporalPoint } from '../../../../core/models/epidemiology.models';

@Component({
  selector: 'app-temporal-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card card-gaara">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Evolução dos Casos de Dengue</h3>
          <p class="chart-sub">Série histórica de casos notificados vs confirmados por mês</p>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-box box-noti"></span>
            <span>Notificados</span>
          </div>
          <div class="legend-item">
            <span class="legend-line line-conf"></span>
            <span>Confirmados</span>
          </div>
        </div>
      </div>

      <div class="svg-container" *ngIf="points.length > 0; else noData">
        <svg class="chart-svg" viewBox="0 0 800 320" preserveAspectRatio="none">
          <!-- Linhas de Grade Horizontal -->
          <line x1="50" y1="40" x2="780" y2="40" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="105" x2="780" y2="105" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="170" x2="780" y2="170" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="235" x2="780" y2="235" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="280" x2="780" y2="280" stroke="var(--text-muted)" />

          <!-- Barras de Notificados -->
          <g *ngFor="let p of samplePoints; let i = index">
            <rect
              [attr.x]="getX(i)"
              [attr.y]="getYNoti(p.casos_notificados)"
              [attr.width]="barWidth"
              [attr.height]="getHeightNoti(p.casos_notificados)"
              class="bar-noti"
              rx="3"
            >
              <title>{{ p.data_mes }}: {{ p.casos_notificados | number }} Notificados</title>
            </rect>
          </g>

          <!-- Linha de Confirmados -->
          <path
            [attr.d]="confirmedPath"
            class="line-conf-path"
            fill="none"
            stroke="var(--dengue-red)"
            stroke-width="2.5"
          />

          <!-- Pontos da Linha -->
          <circle
            *ngFor="let p of samplePoints; let i = index"
            [attr.cx]="getX(i) + barWidth / 2"
            [attr.cy]="getYConf(p.casos_confirmados)"
            r="3"
            class="point-conf"
          >
            <title>{{ p.data_mes }}: {{ p.casos_confirmados | number }} Confirmados</title>
          </circle>

          <!-- Rótulos do Eixo X -->
          <text
            *ngFor="let p of labelPoints; let idx = index"
            [attr.x]="p.x"
            y="302"
            class="axis-label"
            text-anchor="middle"
          >
            {{ p.label }}
          </text>
        </svg>

        <div class="chart-footer-info">
          <span>Escala: Casos mensais consolidados</span>
          <span>Passe o cursor sobre as barras/pontos para detalhes</span>
        </div>
      </div>

      <ng-template #noData>
        <div class="no-data">Nenhum dado disponível para o período selecionado.</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .chart-card {
      padding: 20px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .chart-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .chart-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .chart-legend {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-box {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      &.box-noti { background: #3b82f6; opacity: 0.75; }
    }

    .legend-line {
      width: 18px;
      height: 3px;
      border-radius: 2px;
      &.line-conf { background: var(--dengue-red); }
    }

    .svg-container {
      width: 100%;
      position: relative;
    }

    .chart-svg {
      width: 100%;
      height: 280px;
    }

    .bar-noti {
      fill: #3b82f6;
      fill-opacity: 0.65;
      transition: fill-opacity 0.2s ease;
      cursor: pointer;

      &:hover {
        fill-opacity: 0.95;
      }
    }

    .point-conf {
      fill: #ffffff;
      stroke: var(--dengue-red);
      stroke-width: 2;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        r: 5;
      }
    }

    .axis-label {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: inherit;
    }

    .chart-footer-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
    }

    .no-data {
      padding: 60px 0;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class TemporalChartComponent implements OnChanges {
  @Input() points: TemporalPoint[] = [];

  samplePoints: TemporalPoint[] = [];
  labelPoints: { x: number; label: string }[] = [];
  barWidth = 8;
  confirmedPath = '';
  maxNoti = 1;
  maxConf = 1;

  ngOnChanges(): void {
    if (!this.points || this.points.length === 0) return;

    // Amostragem se houver muitos meses
    const step = Math.max(1, Math.floor(this.points.length / 48));
    this.samplePoints = this.points.filter((_, i) => i % step === 0);

    this.maxNoti = Math.max(...this.samplePoints.map(p => p.casos_notificados), 1);
    this.maxConf = Math.max(...this.samplePoints.map(p => p.casos_confirmados), 1);

    const count = this.samplePoints.length;
    const chartWidth = 720;
    this.barWidth = Math.max(4, Math.min(18, (chartWidth / count) * 0.7));

    // Construção do Path SVG da linha de confirmados
    const pathParts: string[] = [];
    this.labelPoints = [];

    this.samplePoints.forEach((p, i) => {
      const x = this.getX(i) + this.barWidth / 2;
      const y = this.getYConf(p.casos_confirmados);

      if (i === 0) {
        pathParts.push(`M ${x} ${y}`);
      } else {
        pathParts.push(`L ${x} ${y}`);
      }

      // Adiciona labels a cada intervalo
      if (i % Math.max(1, Math.floor(count / 6)) === 0 || i === count - 1) {
        this.labelPoints.push({
          x,
          label: p.data_mes.substring(0, 7)
        });
      }
    });

    this.confirmedPath = pathParts.join(' ');
  }

  getX(index: number): number {
    const total = Math.max(1, this.samplePoints.length - 1);
    return 60 + (index / total) * 700;
  }

  getYNoti(val: number): number {
    const ratio = val / this.maxNoti;
    return 280 - ratio * 240;
  }

  getHeightNoti(val: number): number {
    const ratio = val / this.maxNoti;
    return Math.max(2, ratio * 240);
  }

  getYConf(val: number): number {
    const ratio = val / this.maxConf;
    return 280 - ratio * 240;
  }
}
