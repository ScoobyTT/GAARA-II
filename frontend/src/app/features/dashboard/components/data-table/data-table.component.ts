import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateIncidence } from '../../../../core/models/epidemiology.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chart-card card-gaara">
      <div class="table-header">
        <div>
          <h3 class="chart-title">Ranking Territorial por Estado</h3>
          <p class="chart-sub">Taxas de incidência e volume de casos por Unidade Federativa</p>
        </div>

        <div class="table-actions">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Filtrar por estado ou região..."
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              class="search-input"
            />
          </div>

          <button class="btn-gaara btn-sm" (click)="exportToCsv()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="gaara-table">
          <thead>
            <tr>
              <th (click)="sort('regiao')">Região</th>
              <th (click)="sort('nome_estado')">Estado / UF</th>
              <th (click)="sort('incidencia_por_100k')" class="text-right">Incidência (100k)</th>
              <th (click)="sort('casos_notificados')" class="text-right">Casos Notificados</th>
              <th (click)="sort('casos_confirmados')" class="text-right">Casos Confirmados</th>
              <th (click)="sort('obitos')" class="text-right">Óbitos</th>
              <th class="text-center">Nível de Risco</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedList">
              <td><span class="region-pill">{{ item.regiao }}</span></td>
              <td>
                <strong>{{ item.nome_estado }}</strong> <span class="uf-tag">({{ item.uf }})</span>
              </td>
              <td class="text-right font-mono font-bold" [style.color]="item.cor_hex">
                {{ item.incidencia_por_100k | number:'1.1-1':'pt-BR' }}
              </td>
              <td class="text-right font-mono">{{ item.casos_notificados | number:'1.0-0':'pt-BR' }}</td>
              <td class="text-right font-mono">{{ item.casos_confirmados | number:'1.0-0':'pt-BR' }}</td>
              <td class="text-right font-mono">{{ item.obitos | number:'1.0-0':'pt-BR' }}</td>
              <td class="text-center">
                <span class="badge" [ngClass]="getBadgeClass(item.nivel_risco)">
                  {{ item.nivel_risco }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div class="pagination-bar" *ngIf="filteredList.length > pageSize">
        <span class="page-info">
          Exibindo {{ (page - 1) * pageSize + 1 }} a {{ min(page * pageSize, filteredList.length) }} de {{ filteredList.length }} registros
        </span>
        <div class="page-btns">
          <button class="btn-gaara btn-sm" [disabled]="page === 1" (click)="setPage(page - 1)">Anterior</button>
          <button class="btn-gaara btn-sm" [disabled]="page * pageSize >= filteredList.length" (click)="setPage(page + 1)">Próxima</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
      padding: 20px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
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

    .table-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 12px;
      color: var(--text-muted);
    }

    .search-input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 0.85rem;
      min-width: 180px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .gaara-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th {
        background: var(--bg-tertiary);
        padding: 12px 14px;
        text-align: left;
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        user-select: none;

        &:hover {
          color: var(--text-primary);
        }
      }

      td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-secondary);
      }

      tr:hover td {
        background: var(--bg-tertiary);
      }
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .font-bold { font-weight: 700; }

    .region-pill {
      font-size: 0.75rem;
      padding: 2px 8px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      color: var(--text-muted);
    }

    .uf-tag {
      color: var(--text-muted);
      font-weight: normal;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .page-btns {
      display: flex;
      gap: 8px;
    }
  `]
})
export class DataTableComponent implements OnChanges {
  @Input() estados: StateIncidence[] = [];

  searchTerm: string = '';
  filteredList: StateIncidence[] = [];
  paginatedList: StateIncidence[] = [];
  page: number = 1;
  pageSize: number = 8;
  sortColumn: keyof StateIncidence = 'incidencia_por_100k';
  sortAsc: boolean = false;

  ngOnChanges(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.estados) return;

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredList = this.estados.filter(e =>
      e.nome_estado.toLowerCase().includes(term) ||
      e.uf.toLowerCase().includes(term) ||
      e.regiao.toLowerCase().includes(term)
    );

    this.sortData();
  }

  sort(column: keyof StateIncidence): void {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.sortData();
  }

  private sortData(): void {
    this.filteredList.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  setPage(p: number): void {
    this.page = p;
    this.updatePagination();
  }

  private updatePagination(): void {
    const start = (this.page - 1) * this.pageSize;
    this.paginatedList = this.filteredList.slice(start, start + this.pageSize);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getBadgeClass(risk: string): string {
    if (risk === 'Crítico' || risk === 'Muito Alto') return 'badge-danger';
    if (risk === 'Alto') return 'badge-warning';
    return 'badge-success';
  }

  exportToCsv(): void {
    const headers = ['UF', 'Estado', 'Regiao', 'Populacao', 'Casos_Notificados', 'Casos_Confirmados', 'Obitos', 'Incidencia_100k', 'Risco'];
    const rows = this.filteredList.map(e => [
      e.uf,
      `"${e.nome_estado}"`,
      e.regiao,
      e.populacao,
      e.casos_notificados,
      e.casos_confirmados,
      e.obitos,
      e.incidencia_por_100k,
      e.nivel_risco
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gaara_ranking_estados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
