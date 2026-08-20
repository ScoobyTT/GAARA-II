import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { SpatialMapResponse } from '../../../../core/models/epidemiology.models';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card card-gaara">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Mapa de Incidência Geoespacial</h3>
          <p class="chart-sub">Taxa de incidência por 100 mil habitantes por Estado e Municípios Polo</p>
        </div>
        <!-- Legenda de Faixas -->
        <div class="map-legend">
          <span class="leg-item"><span class="color-dot dot-0"></span> 0–100</span>
          <span class="leg-item"><span class="color-dot dot-1"></span> 101–500</span>
          <span class="leg-item"><span class="color-dot dot-2"></span> 501–2500</span>
          <span class="leg-item"><span class="color-dot dot-3"></span> 2501–10k</span>
          <span class="leg-item"><span class="color-dot dot-4"></span> >10k</span>
        </div>
      </div>

      <div class="map-wrapper">
        <div #mapContainer class="leaflet-map-host"></div>
      </div>
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
      margin-bottom: 14px;
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

    .map-legend {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }

    .leg-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      &.dot-0 { background: #fee5d9; border: 1px solid #fc9272; }
      &.dot-1 { background: #fcae91; }
      &.dot-2 { background: #fb6a4a; }
      &.dot-3 { background: #de2d26; }
      &.dot-4 { background: #a50f15; }
    }

    .map-wrapper {
      width: 100%;
      height: 480px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .leaflet-map-host {
      width: 100%;
      height: 100%;
    }
  `]
})
export class MapViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() spatialData: SpatialMapResponse | null = null;
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();

  // Coordenadas centrais aproximadas das UFs
  private ufCoords: { [key: string]: [number, number] } = {
    'AC': [-9.0238, -70.812],
    'AL': [-9.5713, -36.782],
    'AP': [0.902, -52.003],
    'AM': [-3.4168, -65.8561],
    'BA': [-12.5797, -41.7007],
    'CE': [-5.4984, -39.3206],
    'DF': [-15.7998, -47.8645],
    'ES': [-19.1834, -40.3089],
    'GO': [-15.827, -49.8362],
    'MA': [-4.9609, -45.2744],
    'MT': [-12.6819, -56.9211],
    'MS': [-20.7722, -54.7852],
    'MG': [-18.5122, -44.555],
    'PA': [-1.9981, -54.9306],
    'PB': [-7.24, -36.782],
    'PR': [-25.2521, -52.0215],
    'PE': [-8.8137, -36.9541],
    'PI': [-7.7183, -42.7289],
    'RJ': [-22.9068, -43.1729],
    'RN': [-5.7945, -36.5616],
    'RS': [-30.0346, -51.2177],
    'RO': [-11.5057, -63.5806],
    'RR': [2.7376, -62.0751],
    'SC': [-27.2423, -50.2189],
    'SP': [-23.5505, -46.6333],
    'SE': [-10.5741, -37.3857],
    'TO': [-10.1753, -48.2982]
  };

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (this.map && this.spatialData) {
      this.updateMapMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (!this.mapContainerRef) return;

    this.map = L.map(this.mapContainerRef.nativeElement, {
      center: [-14.235, -51.9253],
      zoom: 4,
      minZoom: 3,
      maxZoom: 14
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map || !this.spatialData) return;

    this.markersLayer.clearLayers();

    // Renderiza círculos proporcionais para os estados
    this.spatialData.estados.forEach(est => {
      const coords = this.ufCoords[est.uf];
      if (coords) {
        const radius = Math.min(480000, Math.max(70000, Math.sqrt(est.casos_notificados) * 350));
        
        const circle = L.circle(coords, {
          color: '#ffffff',
          weight: 1.5,
          fillColor: est.cor_hex,
          fillOpacity: 0.75,
          radius
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #1e293b;">
              ${est.nome_estado} (${est.uf})
            </div>
            <div><strong>Incidência:</strong> <span style="color: ${est.cor_hex}; font-weight: 700;">${est.incidencia_por_100k.toLocaleString('pt-BR')} / 100k hab.</span></div>
            <div><strong>Nível de Risco:</strong> ${est.nivel_risco}</div>
            <div><strong>Casos Notificados:</strong> ${est.casos_notificados.toLocaleString('pt-BR')}</div>
            <div><strong>Casos Confirmados:</strong> ${est.casos_confirmados.toLocaleString('pt-BR')}</div>
            <div><strong>Óbitos:</strong> ${est.obitos.toLocaleString('pt-BR')}</div>
          </div>
        `;

        circle.bindPopup(popupContent);
        this.markersLayer.addLayer(circle);
      }
    });

    // Se houver foco em uma UF específica, ajusta o centro do mapa
    if (this.spatialData.uf_selecionada && this.spatialData.uf_selecionada !== 'Todos' && this.spatialData.uf_selecionada !== 'BR') {
      const targetCoords = this.ufCoords[this.spatialData.uf_selecionada];
      if (targetCoords) {
        this.map.setView(targetCoords, 6, { animate: true });
      }
    } else {
      this.map.setView([-14.235, -51.9253], 4, { animate: true });
    }
  }
}
