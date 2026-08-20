import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PyramidBar } from '../../../../core/models/epidemiology.models';

interface PyramidRow {
  faixa: string;
  m_noti: number;
  m_conf: number;
  f_noti: number;
  f_conf: number;
  m_width_pct: number;
  f_width_pct: number;
}

@Component({
  selector: 'app-pyramid-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card card-gaara">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Distribuição por Faixa Etária e Sexo</h3>
          <p class="chart-sub">Pirâmide demográfica de notificações e confirmações</p>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-box box-m"></span>
            <span>Masculino</span>
          </div>
          <div class="legend-item">
            <span class="legend-box box-f"></span>
            <span>Feminino</span>
          </div>
        </div>
      </div>

      <div class="pyramid-body" *ngIf="rows.length > 0; else noData">
        <div class="pyramid-row header-row">
          <div class="side-label left-label">Homens (Casos)</div>
          <div class="center-label">Idade</div>
          <div class="side-label right-label">Mulheres (Casos)</div>
        </div>

        <div class="pyramid-row" *ngFor="let r of rows">
          <!-- Lado Masculino (Esquerda) -->
          <div class="bar-col left-col">
            <span class="val-text">{{ r.m_noti | number }}</span>
            <div class="bar-track left-track">
              <div class="bar-fill bar-m" [style.width.%]="r.m_width_pct"></div>
            </div>
          </div>

          <!-- Rótulo Central de Faixa Etária -->
          <div class="age-badge">{{ r.faixa }}</div>

          <!-- Lado Feminino (Direita) -->
          <div class="bar-col right-col">
            <div class="bar-track right-track">
              <div class="bar-fill bar-f" [style.width.%]="r.f_width_pct"></div>
            </div>
            <span class="val-text">{{ r.f_noti | number }}</span>
          </div>
        </div>
      </div>

      <ng-template #noData>
        <div class="no-data">Nenhum dado demográfico carregado.</div>
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
      gap: 14px;
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
      width: 12px;
      height: 12px;
      border-radius: 3px;
      &.box-m { background: #3b82f6; }
      &.box-f { background: #ec4899; }
    }

    .pyramid-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .header-row {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .pyramid-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .side-label {
      flex: 1;
      font-size: 0.75rem;
      &.left-label { text-align: right; }
      &.right-label { text-align: left; }
    }

    .center-label {
      width: 60px;
      text-align: center;
    }

    .bar-col {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      &.left-col {
        justify-content: flex-end;
      }

      &.right-col {
        justify-content: flex-start;
      }
    }

    .age-badge {
      width: 60px;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 0;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .bar-track {
      flex: 1;
      max-width: 160px;
      height: 14px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
      display: flex;

      &.left-track {
        justify-content: flex-end;
      }
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;

      &.bar-m { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
      &.bar-f { background: linear-gradient(90deg, #ec4899, #f472b6); }
    }

    .val-text {
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      min-width: 45px;
    }

    .no-data {
      padding: 50px 0;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class PyramidChartComponent implements OnChanges {
  @Input() bars: PyramidBar[] = [];

  rows: PyramidRow[] = [];

  ngOnChanges(): void {
    if (!this.bars || this.bars.length === 0) return;

    const faixas = ['0-4', '5-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
    let maxVal = 1;

    const grouped: { [key: string]: { m_noti: number; m_conf: number; f_noti: number; f_conf: number } } = {};
    faixas.forEach(f => grouped[f] = { m_noti: 0, m_conf: 0, f_noti: 0, f_conf: 0 });

    this.bars.forEach(b => {
      if (grouped[b.faixa_etaria]) {
        if (b.sexo === 'M') {
          grouped[b.faixa_etaria].m_noti = b.casos_notificados;
          grouped[b.faixa_etaria].m_conf = b.casos_confirmados;
          maxVal = Math.max(maxVal, b.casos_notificados);
        } else {
          grouped[b.faixa_etaria].f_noti = b.casos_notificados;
          grouped[b.faixa_etaria].f_conf = b.casos_confirmados;
          maxVal = Math.max(maxVal, b.casos_notificados);
        }
      }
    });

    this.rows = faixas.map(f => {
      const g = grouped[f];
      return {
        faixa: f,
        m_noti: g.m_noti,
        m_conf: g.m_conf,
        f_noti: g.f_noti,
        f_conf: g.f_conf,
        m_width_pct: Math.min(100, (g.m_noti / maxVal) * 100),
        f_width_pct: Math.min(100, (g.f_noti / maxVal) * 100)
      };
    });
  }
}
