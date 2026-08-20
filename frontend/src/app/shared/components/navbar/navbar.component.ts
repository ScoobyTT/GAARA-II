import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar-wrapper glass-header">
      <div class="navbar-inner">
        <!-- Logo e Título -->
        <div class="brand-group">
          <div class="logo-shield">
            <span class="shield-text">G-II</span>
          </div>
          <div>
            <div class="brand-title">
              GAARA-II <span class="badge badge-danger">Vigilância Arboviroses</span>
            </div>
            <div class="brand-sub">Painel Inteligente & Previsão Epidemiológica • Brasil</div>
          </div>
        </div>

        <!-- Abas de Navegação -->
        <nav class="nav-tabs-group">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'dashboard'"
            (click)="selectTab('dashboard')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard Geral
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab === 'alerts'"
            (click)="selectTab('alerts')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Alerta Precoce
            <span class="badge badge-warning" *ngIf="alertCount > 0">{{ alertCount }}</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab === 'simulation'"
            (click)="selectTab('simulation')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            Simulador de Cenários
          </button>
        </nav>

        <!-- Ações do Cabeçalho -->
        <div class="actions-group">
          <!-- Status Backend -->
          <div class="status-indicator" title="Conexão com API FastAPI">
            <span class="dot-online"></span>
            <span class="status-text">FastAPI / Mocks Ativos</span>
          </div>

          <!-- Alternador de Tema Dark/Light -->
          <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'">
            <svg *ngIf="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg *ngIf="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 12px 24px;
      margin-bottom: 24px;
    }

    .navbar-inner {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-shield {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 1rem;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .nav-tabs-group {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-tertiary);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        background: var(--bg-secondary);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 6px 12px;
      border-radius: var(--pill-radius);
      border: 1px solid var(--border-color);
    }

    .dot-online {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .theme-toggle-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background: var(--bg-tertiary);
        border-color: var(--border-hover);
      }
    }
  `]
})
export class NavbarComponent {
  @Input() activeTab: 'dashboard' | 'alerts' | 'simulation' = 'dashboard';
  @Input() alertCount: number = 2;
  @Output() tabChange = new EventEmitter<'dashboard' | 'alerts' | 'simulation'>();

  isDark = true;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe(dark => this.isDark = dark);
  }

  selectTab(tab: 'dashboard' | 'alerts' | 'simulation') {
    this.tabChange.emit(tab);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
