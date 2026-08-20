import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterStateService } from '../../../core/services/filter-state.service';
import { DashboardFilter } from '../../../core/models/epidemiology.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-card card-gaara">
      <div class="filter-row">
        <!-- Seletor de Estado -->
        <div class="filter-group">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Unidade Federativa (UF)
          </label>
          <select
            class="filter-select"
            [ngModel]="filter.uf"
            (ngModelChange)="onUfChange($event)"
          >
            <option value="Todos">🇧🇷 Brasil (Nacional / Todos)</option>
            <optgroup label="Região Sudeste">
              <option value="SP">São Paulo (SP)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="ES">Espírito Santo (ES)</option>
            </optgroup>
            <optgroup label="Região Centro-Oeste">
              <option value="DF">Distrito Federal (DF)</option>
              <option value="GO">Goiás (GO)</option>
              <option value="MT">Mato Grosso (MT)</option>
              <option value="MS">Mato Grosso do Sul (MS)</option>
            </optgroup>
            <optgroup label="Região Sul">
              <option value="PR">Paraná (PR)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
              <option value="SC">Santa Catarina (SC)</option>
            </optgroup>
            <optgroup label="Região Nordeste">
              <option value="BA">Bahia (BA)</option>
              <option value="CE">Ceará (CE)</option>
              <option value="PE">Pernambuco (PE)</option>
              <option value="MA">Maranhão (MA)</option>
              <option value="PB">Paraíba (PB)</option>
              <option value="RN">Rio Grande do Norte (RN)</option>
              <option value="AL">Alagoas (AL)</option>
              <option value="PI">Piauí (PI)</option>
              <option value="SE">Sergipe (SE)</option>
            </optgroup>
            <optgroup label="Região Norte">
              <option value="PA">Pará (PA)</option>
              <option value="AM">Amazonas (AM)</option>
              <option value="RO">Rondônia (RO)</option>
              <option value="TO">Tocantins (TO)</option>
              <option value="AC">Acre (AC)</option>
              <option value="AP">Amapá (AP)</option>
              <option value="RR">Roraima (RR)</option>
            </optgroup>
          </select>
        </div>

        <!-- Seletor de Período Temporal -->
        <div class="filter-group period-group">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Período de Análise: <strong>{{ filter.ano_inicio }} — {{ filter.ano_fim }}</strong>
          </label>
          <div class="slider-inputs">
            <input
              type="range"
              min="2014"
              max="2026"
              [ngModel]="filter.ano_inicio"
              (ngModelChange)="onAnoInicioChange($event)"
              class="range-slider"
            />
            <input
              type="range"
              min="2014"
              max="2026"
              [ngModel]="filter.ano_fim"
              (ngModelChange)="onAnoFimChange($event)"
              class="range-slider"
            />
          </div>
        </div>

        <!-- Presets Rápidos -->
        <div class="filter-group presets-group">
          <label class="filter-label">Cenários Rápidos</label>
          <div class="preset-buttons">
            <button
              class="btn-gaara btn-sm"
              [class.active]="filter.ano_inicio === 2014 && filter.ano_fim === 2026"
              (click)="setPreset('todos')"
            >
              2014–2026 (Total)
            </button>
            <button
              class="btn-gaara btn-sm"
              [class.active]="filter.ano_inicio === 2024 && filter.ano_fim === 2024"
              (click)="setPreset('epidemia2024')"
            >
              2024 (Mega Surto)
            </button>
            <button
              class="btn-gaara btn-sm"
              [class.active]="filter.ano_inicio === 2022 && filter.ano_fim === 2026"
              (click)="setPreset('recente')"
            >
              2022–2026
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-card {
      padding: 16px 20px;
      margin-bottom: 24px;
      background: var(--bg-secondary);
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;

      strong {
        color: var(--text-primary);
        font-weight: 800;
      }
    }

    .filter-select {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      min-width: 220px;
      transition: var(--transition);

      &:focus {
        border-color: var(--dengue-red);
      }
    }

    .period-group {
      flex: 1;
      min-width: 260px;
    }

    .slider-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .range-slider {
      flex: 1;
      accent-color: var(--dengue-red);
      cursor: pointer;
    }

    .presets-group {
      min-width: 280px;
    }

    .preset-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  `]
})
export class FilterBarComponent {
  filter: DashboardFilter = {
    uf: 'Todos',
    ano_inicio: 2014,
    ano_fim: 2026
  };

  constructor(private filterService: FilterStateService) {
    this.filterService.filter$.subscribe(f => this.filter = f);
  }

  onUfChange(uf: string): void {
    this.filterService.setUf(uf);
  }

  onAnoInicioChange(val: any): void {
    const ano = Number(val);
    const fim = Math.max(ano, this.filter.ano_fim);
    this.filterService.setPeriodo(ano, fim);
  }

  onAnoFimChange(val: any): void {
    const ano = Number(val);
    const inicio = Math.min(ano, this.filter.ano_inicio);
    this.filterService.setPeriodo(inicio, ano);
  }

  setPreset(preset: 'todos' | 'epidemia2024' | 'recente'): void {
    this.filterService.setPreset(preset);
  }
}
