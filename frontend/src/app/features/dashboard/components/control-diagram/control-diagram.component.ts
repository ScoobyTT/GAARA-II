import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPoint } from '../../../../core/models/epidemiology.models';

@Component({
  selector: 'app-control-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card card-gaara">
      <div class="chart-header">
        <div>
          <div class="title-with-badge">
            <h3 class="chart-title">Diagrama de Controle (Canal Endêmico)</h3>
            <span class="badge" [ngClass]="alertActive ? 'badge-danger' : 'badge-success'">
              {{ alertActive ? 'Alerta: Acima de Q3' : 'Zona de Segurança / Êxito' }}
            </span>
          </div>
          <p class="chart-sub">Faixa interquartil (Q1 a Q3), Mediana histórica e Coeficiente de Incidência Real</p>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-box box-ribbon"></span>
            <span>Canal Endêmico (Q1–Q3)</span>
          </div>
          <div class="legend-item">
            <span class="legend-line line-med"></span>
            <span>Mediana</span>
          </div>
          <div class="legend-item">
            <span class="legend-line line-inc"></span>
            <span>Incidência Real (100k)</span>
          </div>
        </div>
      </div>

      <div class="svg-container" *ngIf="points.length > 0; else noData">
        <svg class="chart-svg" viewBox="0 0 800 320" preserveAspectRatio="none">
          <!-- Linhas de Grade -->
          <line x1="50" y1="40" x2="780" y2="40" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="120" x2="780" y2="120" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="200" x2="780" y2="200" stroke="var(--border-color)" stroke-dasharray="3,3" />
          <line x1="50" y1="280" x2="780" y2="280" stroke="var(--text-muted)" />

          <!-- Faixa Sombreada do Canal Endêmico (Ribbon Q1 a Q3) -->
          <path
            [attr.d]="ribbonPath"
            class="ribbon-area"
            fill="var(--text-muted)"
            fill-opacity="0.15"
          />

          <!-- Linha Superior Q3 (Limiar de Epidemia) -->
          <path
            [attr.d]="q3Path"
            fill="none"
            stroke="var(--dengue-orange)"
            stroke-width="1.5"
            stroke-dasharray="4,4"
          />

          <!-- Linha da Mediana -->
          <path
            [attr.d]="medianPath"
            fill="none"
            stroke="#b91c1c"
            stroke-width="2"
            stroke-dasharray="6,4"
          />

          <!-- Linha da Incidência Atual -->
          <path
            [attr.d]="incidencePath"
            fill="none"
            stroke="#2563eb"
            stroke-width="2.8"
          />

          <!-- Pontos da Incidência Atual (com destaque para pontos em alerta) -->
          <circle
            *ngFor="let p of points; let i = index"
            [attr.cx]="getX(i)"
            [attr.cy]="getY(p.incidencia_atual)"
            [attr.r]="p.em_alerta ? 4.5 : 2.5"
            [attr.fill]="p.em_alerta ? 'var(--dengue-red)' : '#2563eb'"
            stroke="#ffffff"
            stroke-width="1.5"
          >
            <title>Semana {{ p.semana_epi }}: Incidência {{ p.incidencia_atual }} / 100k (Q3: {{ p.q3 }})</title>
          </circle>

          <!-- Labels do Eixo X (Semanas) -->
          <text x="60" y="302" class="axis-label" text-anchor="middle">Sem 1</text>
          <text x="235" y="302" class="axis-label" text-anchor="middle">Sem 13 (Mar)</text>
          <text x="410" y="302" class="axis-label" text-anchor="middle">Sem 26 (Jun)</text>
          <text x="585" y="302" class="axis-label" text-anchor="middle">Sem 39 (Set)</text>
          <text x="760" y="302" class="axis-label" text-anchor="middle">Sem 52 (Dez)</text>
        </svg>

        <div class="chart-footer-info">
          <span>Eixo X: 52 Semanas Epidemiológicas</span>
          <span>Eixo Y: Taxa de Incidência por 100 mil hab.</span>
        </div>
      </div>

      <ng-template #noData>
        <div class="no-data">Nenhum dado do diagrama de controle disponível.</div>
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

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 10px;
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
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-box {
      width: 14px;
      height: 12px;
      border-radius: 2px;
      &.box-ribbon { background: rgba(148, 163, 184, 0.35); border: 1px dashed var(--text-muted); }
    }

    .legend-line {
      width: 18px;
      height: 3px;
      border-radius: 2px;
      &.line-med { background: #b91c1c; }
      &.line-inc { background: #2563eb; }
    }

    .svg-container {
      width: 100%;
    }

    .chart-svg {
      width: 100%;
      height: 280px;
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
      padding: 50px 0;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class ControlDiagramComponent implements OnChanges {
  @Input() points: ControlPoint[] = [];

  ribbonPath = '';
  medianPath = '';
  q3Path = '';
  incidencePath = '';
  maxY = 1;
  alertActive = false;

  ngOnChanges(): void {
    if (!this.points || this.points.length === 0) return;

    this.maxY = Math.max(
      ...this.points.map(p => Math.max(p.q3 * 1.25, p.incidencia_atual * 1.1)),
      10
    );

    this.alertActive = this.points.some(p => p.em_alerta);

    // Constrói ribbon Q1 -> Q3
    const topPoints: string[] = [];
    const bottomPoints: string[] = [];
    const medPoints: string[] = [];
    const q3Parts: string[] = [];
    const incParts: string[] = [];

    this.points.forEach((p, i) => {
      const x = this.getX(i);
      const yQ3 = this.getY(p.q3);
      const yQ1 = this.getY(p.q1);
      const yMed = this.getY(p.mediana);
      const yInc = this.getY(p.incidencia_atual);

      topPoints.push(`${x},${yQ3}`);
      bottomPoints.unshift(`${x},${yQ1}`);

      if (i === 0) {
        medPoints.push(`M ${x} ${yMed}`);
        q3Parts.push(`M ${x} ${yQ3}`);
        incParts.push(`M ${x} ${yInc}`);
      } else {
        medPoints.push(`L ${x} ${yMed}`);
        q3Parts.push(`L ${x} ${yQ3}`);
        incParts.push(`L ${x} ${yInc}`);
      }
    });

    this.ribbonPath = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
    this.medianPath = medPoints.join(' ');
    this.q3Path = q3Parts.join(' ');
    this.incidencePath = incParts.join(' ');
  }

  getX(index: number): number {
    const total = Math.max(1, this.points.length - 1);
    return 60 + (index / total) * 700;
  }

  getY(val: number): number {
    const ratio = val / this.maxY;
    return 280 - ratio * 240;
  }
}
