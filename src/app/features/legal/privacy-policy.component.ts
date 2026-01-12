import {Component, Renderer2} from '@angular/core';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {Location} from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [SeoHeadDirective],
  template: `
    <div seoHead
         [seoTitle]="'Política de Privacidade | SimulaCert'"
         [seoDescription]="'Veja como a SimulaCert trata seus dados e informações pessoais.'"
         [seoRobots]="'index, follow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">

      <div class="legal-page">
        <div class="legal-container">
          <h1>Política de Privacidade</h1>

          <p class="last-updated">Última atualização: Janeiro de 2026</p>

          <section>
            <h2>1. Introdução</h2>
            <p>Esta Política de Privacidade descreve como o SimulaCert coleta, usa e protege suas informações
              pessoais.</p>
          </section>

          <section>
            <h2>2. Informações Coletadas</h2>
            <p>Coletamos as seguintes informações:</p>
            <ul>
              <li>Nome e email fornecidos no cadastro</li>
              <li>Informações de progresso e resultados dos simulados</li>
              <li>Dados de uso e navegação</li>
            </ul>
          </section>

          <section>
            <h2>3. Uso das Informações</h2>
            <p>Usamos suas informações para:</p>
            <ul>
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência</li>
              <li>Comunicar atualizações e novidades</li>
            </ul>
          </section>

          <section>
            <h2>4. Compartilhamento de Dados</h2>
            <p>Não vendemos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para
              operar o serviço ou quando exigido por lei.</p>
          </section>

          <section>
            <h2>5. Segurança</h2>
            <p>Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado.</p>
          </section>

          <section>
            <h2>6. Seus Direitos</h2>
            <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento.</p>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>Utilizamos cookies para melhorar sua experiência e manter sua sessão ativa.</p>
          </section>

          <section>
            <h2>8. Contato</h2>
            <p>Para questões sobre privacidade, entre em contato através do email de suporte.</p>
          </section>

          <div class="back-link">
            <a (click)="goBack()">← Voltar</a>
          </div>
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

    ul {
      line-height: 1.6;
      color: #333;
      margin-left: var(--spacing-lg, 1.5rem);
      margin-bottom: var(--spacing-sm, 0.75rem);
    }

    li {
      margin-bottom: var(--spacing-xs, 0.5rem);
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
export class PrivacyPolicyComponent {


  constructor(private _renderer: Renderer2,
              private location: Location) {
  }

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${this.location.prepareExternalUrl('/politica-de-privacidade')}`;
  }

  goBack(): void {
    window.history.back();
  }
}
