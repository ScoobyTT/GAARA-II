import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpidemiologyApiService } from '../../core/services/epidemiology-api.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import {
  KPISummary,
  TemporalPoint,
  PyramidBar,
  ControlPoint,
  SpatialMapResponse
} from '../../core/models/epidemiology.models';

import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { TemporalChartComponent } from './components/temporal-chart/temporal-chart.component';
import { ControlDiagramComponent } from './components/control-diagram/control-diagram.component';
import { PyramidChartComponent } from './components/pyramid-chart/pyramid-chart.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { DataTableComponent } from './components/data-table/data-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FilterBarComponent,
    KpiCardsComponent,
    TemporalChartComponent,
    ControlDiagramComponent,
    PyramidChartComponent,
    MapViewComponent,
    DataTableComponent
  ],
  template: `
    <div class="dashboard-view">
      <!-- Barra Superior de Filtros -->
      <app-filter-bar></app-filter-bar>

      <!-- Cards de Indicadores (KPIs) -->
      <app-kpi-cards [kpi]="kpi"></app-kpi-cards>

      <!-- Linha 1 de Gráficos: Evolução Temporal & Diagrama de Controle -->
      <div class="grid-charts">
        <app-temporal-chart [points]="temporalPoints"></app-temporal-chart>
        <app-control-diagram [points]="controlPoints"></app-control-diagram>
      </div>

      <!-- Linha 2 de Gráficos: Pirâmide Etária & Mapa Geoespacial -->
      <div class="grid-charts">
        <app-pyramid-chart [bars]="pyramidBars"></app-pyramid-chart>
        <app-map-view [spatialData]="spatialData"></app-map-view>
      </div>

      <!-- Linha 3: Tabela Territorial de Estados e Regiões -->
      <app-data-table [estados]="spatialData ? spatialData.estados : []"></app-data-table>
    </div>
  `,
  styles: [`
    .dashboard-view {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class DashboardComponent implements OnInit {
  kpi: KPISummary | null = null;
  temporalPoints: TemporalPoint[] = [];
  pyramidBars: PyramidBar[] = [];
  controlPoints: ControlPoint[] = [];
  spatialData: SpatialMapResponse | null = null;

  constructor(
    private apiService: EpidemiologyApiService,
    private filterService: FilterStateService
  ) {}

  ngOnInit(): void {
    this.filterService.filter$.subscribe(f => {
      this.loadDashboardData(f.uf, f.ano_inicio, f.ano_fim);
    });
  }

  private loadDashboardData(uf: string, anoInicio: number, anoFim: number): void {
    // 1. Carrega KPIs
    this.apiService.getKpiSummary(uf, anoInicio, anoFim).subscribe(res => this.kpi = res);

    // 2. Carrega Série Temporal
    this.apiService.getTemporalEvolution(uf, anoInicio, anoFim).subscribe(res => this.temporalPoints = res.dados);

    // 3. Carrega Pirâmide Etária
    this.apiService.getAgePyramid(uf).subscribe(res => this.pyramidBars = res.dados);

    // 4. Carrega Diagrama de Controle
    this.apiService.getControlDiagram(uf).subscribe(res => this.controlPoints = res.dados);

    // 5. Carrega Dados Espaciais
    this.apiService.getSpatialMap(uf).subscribe(res => this.spatialData = res);
  }
}
