import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPISummary } from '../../../../core/models/epidemiology.models';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-cards" *ngIf="kpi">
      <!-- Card 1: Casos Notificados -->
      <div class="kpi-card card-gaara border-blue">
        <div class="kpi-icon-wrapper icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">Casos Notificados (SINAN)</span>
          <div class="kpi-value">{{ kpi.total_notificados | number:'1.0-0':'pt-BR' }}</div>
          <span class="kpi-sub">Total de notificações registradas</span>
        </div>
      </div>

      <!-- Card 2: Casos Confirmados -->
      <div class="kpi-card card-gaara border-red">
        <div class="kpi-icon-wrapper icon-red">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">Casos Confirmados</span>
          <div class="kpi-value text-red">{{ kpi.total_confirmados | number:'1.0-0':'pt-BR' }}</div>
          <span class="kpi-sub">{{ ((kpi.total_confirmados / (kpi.total_notificados || 1)) * 100) | number:'1.1-1' }}% taxa de confirmação</span>
        </div>
      </div>

      <!-- Card 3: Óbitos Confirmados -->
      <div class="kpi-card card-gaara border-purple">
        <div class="kpi-icon-wrapper icon-purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="6" y1="8" x2="18" y2="8"></line>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">Óbitos Confirmados</span>
          <div class="kpi-value">{{ kpi.total_obitos_confirmados | number:'1.0-0':'pt-BR' }}</div>
          <span class="kpi-sub">Letalidade: {{ kpi.taxa_letalidade | number:'1.2-3' }}%</span>
        </div>
      </div>

      <!-- Card 4: Incidência por 100k hab. -->
      <div class="kpi-card card-gaara border-amber">
        <div class="kpi-icon-wrapper icon-amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-title">Coef. Incidência (100k hab.)</span>
          <div class="kpi-value text-amber">{{ kpi.incidencia_por_100k | number:'1.1-1':'pt-BR' }}</div>
          <span class="kpi-sub">
            <span class="badge" [ngClass]="getIncidenceBadgeClass(kpi.incidencia_por_100k)">
              {{ getIncidenceRiskLabel(kpi.incidencia_por_100k) }}
            </span>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
    }

    .border-blue { border-top: 4px solid var(--dengue-blue); }
    .border-red { border-top: 4px solid var(--dengue-red); }
    .border-purple { border-top: 4px solid var(--dengue-purple); }
    .border-amber { border-top: 4px solid var(--dengue-orange); }

    .kpi-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.icon-blue { background: var(--dengue-blue-soft); color: var(--dengue-blue); }
      &.icon-red { background: var(--dengue-red-soft); color: var(--dengue-red); }
      &.icon-purple { background: var(--dengue-purple-soft); color: var(--dengue-purple); }
      &.icon-amber { background: var(--dengue-orange-soft); color: var(--dengue-orange); }
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
    }

    .kpi-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      line-height: 1.1;

      &.text-red { color: var(--dengue-red); }
      &.text-amber { color: var(--dengue-orange); }
    }

    .kpi-sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 2px;
    }
  `]
})
export class KpiCardsComponent {
  @Input() kpi: KPISummary | null = null;

  getIncidenceRiskLabel(inc: number): string {
    if (inc > 10000) return 'Risco Crítico';
    if (inc > 2500) return 'Risco Muito Alto';
    if (inc > 500) return 'Risco Alto';
    if (inc > 100) return 'Risco Moderado';
    return 'Risco Baixo';
  }

  getIncidenceBadgeClass(inc: number): string {
    if (inc > 2500) return 'badge-danger';
    if (inc > 500) return 'badge-warning';
    return 'badge-success';
  }
}
