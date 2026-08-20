import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="gaara-footer card-gaara">
      <div class="footer-inner">
        <!-- Parcerias e Laboratórios -->
        <div class="footer-col">
          <div class="lab-title">UNEB • G2BC / PIMAT</div>
          <div class="lab-sub">Grupo de Biocomputação e Biologia Celular</div>
          <div class="support-badges">
            <span class="support-tag">CNPq</span>
            <span class="support-tag">FAPESB</span>
            <span class="support-tag">UnB</span>
          </div>
        </div>

        <!-- Projeto de Pesquisa -->
        <div class="footer-col text-center">
          <div class="proj-title">Projeto GAARA-II</div>
          <div class="proj-sub">
            Desenvolvimento de Dashboard Inteligente e Sistema de Alerta Precoce para Arboviroses
          </div>
          <div class="researchers">
            Proponente: Prof. Dr. Vagner de Souza Fonseca • Pesquisador: Lucas Vinicius J. dos Santos
          </div>
        </div>

        <!-- Fontes e Atualização -->
        <div class="footer-col text-right">
          <div class="source-info">
            Fontes de Dados: <a href="https://datasus.saude.gov.br/" target="_blank" rel="noopener">SINAN / DataSUS</a> • IBGE • INMET
          </div>
          <div class="update-info">
            Ambiente de Desenvolvimento: <strong>FastAPI v2.0 & Angular 17+</strong>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .gaara-footer {
      padding: 24px;
      margin-top: 40px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
    }

    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .footer-col {
      flex: 1;
      min-width: 240px;

      &.text-center { text-align: center; }
      &.text-right { text-align: right; }
    }

    .lab-title, .proj-title {
      font-weight: 800;
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    .lab-sub, .proj-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .support-badges {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .support-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .researchers {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 4px;
      font-weight: 500;
    }

    .source-info {
      font-size: 0.8rem;
      color: var(--text-secondary);

      a {
        color: var(--dengue-blue);
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .update-info {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;

      strong {
        color: var(--text-secondary);
      }
    }
  `]
})
export class FooterComponent {}
