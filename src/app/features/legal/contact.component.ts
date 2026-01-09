import {Component} from '@angular/core';

@Component({
  selector: 'contact-page',
  standalone: true,
  template: `
    <div class="legal-page">
      <div class="legal-container">
        <h1>Contato</h1>
        <p class="last-updated">Última atualização: Janeiro de 2026</p>

        <section>
          <p>
            Para dúvidas, sugestões ou qualquer assunto relacionado ao SimulaCert,
            você pode entrar em contato pelos canais abaixo:
          </p>

          <ul class="contact-list">
            <li>
              <strong>E-mail:</strong>
              <a href="mailto:marcelofeliciano@tutamail.com">marcelofeliciano&#64;tutamail.com</a>
            </li>
            <li>
              <strong>LinkedIn:</strong>
              <a href="https://www.linkedin.com/in/feliciano-marcelo" target="_blank" rel="noopener">
                linkedin.com/in/feliciano-marcelo
              </a>
            </li>
            <li>
              <strong>GitHub:</strong>
              <a href="https://github.com/m-feliciano" target="_blank" rel="noopener">
                github.com/m-feliciano
              </a>
            </li>
          </ul>
        </section>

        <div class="back-link">
          <a (click)="goBack()">← Voltar</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      background: var(--color-bg-primary, #f5f5f5);
      padding: var(--spacing-xl, 2rem) var(--spacing-md, 1rem);
    }

    .legal-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: var(--spacing-xl, 2rem);
      border-radius: var(--border-radius-md, 8px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    h1 {
      color: var(--color-dark, #232F3E);
      margin-bottom: var(--spacing-md, 1rem);
      font-size: 2rem;
    }

    .last-updated {
      color: #666;
      font-style: italic;
      margin-bottom: var(--spacing-lg, 1.5rem);
    }

    p {
      line-height: 1.6;
      color: #333;
      margin-bottom: var(--spacing-md, 1rem);
    }

    .contact-list {
      list-style: none;
      padding-left: 0;
    }

    .contact-list li {
      margin-bottom: var(--spacing-sm, 0.75rem);
      line-height: 1.6;
      color: #333;
    }

    .contact-list a {
      color: var(--color-primary, #FF9900);
      text-decoration: none;
      font-weight: 500;
    }

    .contact-list a:hover {
      text-decoration: underline;
    }

    .back-link {
      margin-top: var(--spacing-xl, 2rem);
      padding-top: var(--spacing-lg, 1.5rem);
      border-top: 1px solid #e0e0e0;
    }

    .back-link a {
      color: var(--color-primary, #FF9900);
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
    }

    .back-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class ContactComponent {

  goBack(): void {
    window.history.back();
  }
}
