import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <p class="copyright">© {{ currentYear }} SimulaCert. Todos os direitos reservados.</p>
        <nav class="footer-links">
          <a routerLink="/contato" class="footer-link">Contato</a>
          <a routerLink="/termos-de-uso" class="footer-link">Termos de Uso</a>
          <a routerLink="/politica-de-privacidade" class="footer-link">Política de Privacidade</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--color-dark, #232F3E);
      color: rgba(255, 255, 255, 0.85);
      padding: var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
      font-size: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md, 1rem);
    }

    .copyright {
      margin: 0;
      text-align: center;
    }

    .footer-links {
      display: flex;
      gap: var(--spacing-lg, 1.5rem);
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-link {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      transition: color 0.2s ease;
      position: relative;
    }

    .footer-link:hover {
      color: var(--color-primary, #FF9900);
    }

    .footer-link:focus {
      outline: 2px solid var(--color-primary, #FF9900);
      outline-offset: 2px;
      border-radius: 2px;
    }

    @media (min-width: 640px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
      }

      .copyright {
        text-align: left;
      }

      .footer-links {
        justify-content: flex-end;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

