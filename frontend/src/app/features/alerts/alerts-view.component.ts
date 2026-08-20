import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpidemiologyApiService } from '../../core/services/epidemiology-api.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { AlertSummaryResponse, AlertNotification } from '../../core/models/epidemiology.models';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-container">
      <!-- Header do Módulo -->
      <div class="module-header card-gaara">
        <div class="header-main">
          <div class="badge-alert-header">
            <span class="pulse-dot"></span>
            <span>Sistema Integrado de Alerta Precoce (Subprojeto 1)</span>
          </div>
          <h2 class="module-title">Monitoramento de Riscos e Detecção de Surtos</h2>
          <p class="module-desc">
            Vigilância contínua orientada por limiares estatísticos e extrapolações do canal endêmico. Emissão automatizada de recomendações operacionais para secretarias de saúde.
          </p>
        </div>

        <div class="alert-kpis-row" *ngIf="summary">
          <div class="alert-kpi-badge kpi-critico">
            <span class="count">{{ summary.alertas_criticos }}</span>
            <span class="lbl">Críticos</span>
          </div>
          <div class="alert-kpi-badge kpi-alto">
            <span class="count">{{ summary.alertas_altos }}</span>
            <span class="lbl">Altos</span>
          </div>
          <div class="alert-kpi-badge kpi-moderado">
            <span class="count">{{ summary.alertas_moderados }}</span>
            <span class="lbl">Moderados</span>
          </div>
        </div>
      </div>

      <!-- Lista de Notificações de Alerta -->
      <div class="alerts-grid" *ngIf="summary && summary.alertas.length > 0; else noAlerts">
        <div
          class="alert-card card-gaara"
          *ngFor="let a of summary.alertas"
          [ngClass]="'border-' + a.nivel_risco.toLowerCase()"
        >
          <div class="alert-card-top">
            <div class="alert-location">
              <span class="badge" [ngClass]="getBadgeClass(a.nivel_risco)">
                {{ a.nivel_risco }}
              </span>
              <span class="loc-text">{{ a.municipio ? a.municipio + ' - ' + a.uf : a.uf }} (Região {{ a.regiao }})</span>
            </div>
            <span class="alert-date">{{ a.data_emissao }}</span>
          </div>

          <h4 class="alert-card-title">{{ a.titulo }}</h4>
          <p class="alert-card-desc">{{ a.descricao }}</p>

          <div class="metrics-comparison">
            <div class="metric-box">
              <span class="m-lbl">Casos Recentes</span>
              <span class="m-val">{{ a.casos_recentes | number }}</span>
            </div>
            <div class="metric-box">
              <span class="m-lbl">Limiar Esperado (Q3)</span>
              <span class="m-val">{{ a.limiar_esperado | number }}</span>
            </div>
            <div class="metric-box">
              <span class="m-lbl">Variação / Excesso</span>
              <span class="m-val text-red">+{{ a.variacao_percentual }}%</span>
            </div>
          </div>

          <!-- Ações Recomendadas -->
          <div class="actions-section">
            <span class="actions-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Ações Imediatas de Controle Vetorial Recomendadas:
            </span>
            <ul class="actions-list">
              <li *ngFor="let ac of a.acoes_recomendadas">{{ ac }}</li>
            </ul>
          </div>
        </div>
      </div>

      <ng-template #noAlerts>
        <div class="card-gaara empty-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3>Nenhum Alerta Ativo no Momento</h3>
          <p>A taxa de transmissão na região selecionada encontra-se dentro dos canais de segurança epidemiológica.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .alerts-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .module-header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-main {
      max-width: 800px;
    }

    .badge-alert-header {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: var(--pill-radius);
      background: var(--dengue-red-soft);
      color: var(--dengue-red);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--dengue-red);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .module-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .module-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .alert-kpis-row {
      display: flex;
      gap: 12px;
    }

    .alert-kpi-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 18px;
      border-radius: 12px;
      min-width: 90px;

      .count { font-size: 1.5rem; font-weight: 800; }
      .lbl { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }

      &.kpi-critico { background: var(--dengue-red-soft); color: var(--dengue-red); }
      &.kpi-alto { background: var(--dengue-orange-soft); color: var(--dengue-orange); }
      &.kpi-moderado { background: var(--dengue-amber-soft); color: var(--dengue-amber); }
    }

    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
    }

    .alert-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;

      &.border-critico { border-left: 5px solid var(--dengue-red); }
      &.border-alto { border-left: 5px solid var(--dengue-orange); }
      &.border-moderado { border-left: 5px solid var(--dengue-amber); }
    }

    .alert-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .alert-location {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .loc-text {
      font-weight: 700;
      font-size: 0.9rem;
    }

    .alert-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .alert-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .alert-card-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .metrics-comparison {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: var(--bg-tertiary);
      padding: 12px;
      border-radius: 10px;
    }

    .metric-box {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .m-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
      .m-val { font-size: 1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
      .text-red { color: var(--dengue-red); }
    }

    .actions-section {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 14px;
    }

    .actions-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .actions-list {
      padding-left: 20px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .empty-card {
      padding: 80px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      h3 { font-weight: 700; }
      p { font-size: 0.85rem; color: var(--text-muted); max-width: 500px; }
    }
  `]
})
export class AlertsViewComponent implements OnInit {
  summary: AlertSummaryResponse | null = null;

  constructor(
    private apiService: EpidemiologyApiService,
    private filterService: FilterStateService
  ) {}

  ngOnInit(): void {
    this.filterService.filter$.subscribe(f => {
      this.apiService.getAlerts(f.uf).subscribe(res => this.summary = res);
    });
  }

  getBadgeClass(risk: string): string {
    if (risk === 'CRITICO') return 'badge-danger';
    if (risk === 'ALTO') return 'badge-warning';
    return 'badge-info';
  }
}
