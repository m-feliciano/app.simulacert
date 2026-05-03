import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="app-footer sc-glass">
      <div class="footer-content sc-page">
        <p class="copyright">© {{ currentYear }} SimulaCert. Todos os direitos reservados.</p>
        <nav class="footer-links">
          <a routerLink="/contato" class="footer-link">Contato</a>
          <a routerLink="/termos-de-uso" class="footer-link">Termos de Uso</a>
          <a routerLink="/politica-de-privacidade" class="footer-link">Privacidade</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      color: var(--muted);
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border);
      margin-top: auto;
      position: relative;
      z-index: 10;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding-left: var(--spacing-lg);
      padding-right: var(--spacing-lg);
    }

    .copyright {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }

    .footer-links {
      display: flex;
      gap: var(--spacing-lg);
    }

    .footer-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: var(--transition-fast);
      position: relative;
      z-index: 11;
    }

    .footer-link:hover {
      color: var(--text);
    }

    @media (min-width: 640px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

