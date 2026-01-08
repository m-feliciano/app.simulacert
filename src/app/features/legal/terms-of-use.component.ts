import {Component} from '@angular/core';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [],
  template: `
    <div class="legal-page">
      <div class="legal-container">
        <h1>Termos de Uso</h1>

        <p class="last-updated">Última atualização: Janeiro de 2026</p>

        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e usar o SimulaCert, você concorda com estes Termos de Uso.</p>
        </section>

        <section>
          <h2>2. Descrição do Serviço</h2>
          <p>O SimulaCert é uma plataforma de simulados para certificações profissionais de tecnologia.</p>
        </section>

        <section>
          <h2>3. Isenção de Responsabilidade</h2>
          <p>Este site não é afiliado, patrocinado ou endossado por provedores oficiais de certificações, incluindo mas
            não limitado à AWS (Amazon Web Services).</p>
          <p>O conteúdo fornecido é apenas para fins educacionais e de preparação. As marcas registradas mencionadas são
            propriedade de seus respectivos donos.</p>
        </section>

        <section>
          <h2>4. Uso Aceitável</h2>
          <p>Você concorda em usar o SimulaCert apenas para fins legais e de acordo com estes termos.</p>
        </section>

        <section>
          <h2>5. Propriedade Intelectual</h2>
          <p>Todo o conteúdo do SimulaCert, incluindo textos, gráficos e código, é propriedade do SimulaCert ou de seus
            licenciadores.</p>
        </section>

        <section>
          <h2>6. Modificações</h2>
          <p>Reservamo-nos o direito de modificar estes termos a qualquer momento.</p>
        </section>

        <div class="back-link">
          <a (click)="goBack()">← Voltar</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      min-height: 100vh;
      background: var(--color-bg-primary, #f5f5f5);
      padding: var(--spacing-xl, 2rem) var(--spacing-md, 1rem);
    }

    .legal-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: var(--spacing-xl, 2rem);
      border-radius: var(--border-radius-md, 8px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    h1 {
      color: var(--color-dark, #232F3E);
      margin-bottom: var(--spacing-md, 1rem);
      font-size: 2rem;
    }

    h2 {
      color: var(--color-secondary, #37475A);
      margin-top: var(--spacing-lg, 1.5rem);
      margin-bottom: var(--spacing-sm, 0.75rem);
      font-size: 1.5rem;
    }

    .last-updated {
      color: #666;
      font-style: italic;
      margin-bottom: var(--spacing-lg, 1.5rem);
    }

    section {
      margin-bottom: var(--spacing-lg, 1.5rem);
    }

    p {
      line-height: 1.6;
      color: #333;
      margin-bottom: var(--spacing-sm, 0.75rem);
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
      transition: color 0.2s ease;
    }

    .back-link a:hover {
      color: var(--color-primary-dark, #e88b00);
      text-decoration: underline;
    }
  `]
})
export class TermsOfUseComponent {

  goBack(): void {
    window.history.back();
  }
}

