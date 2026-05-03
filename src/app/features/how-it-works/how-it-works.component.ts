import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink, SeoHeadDirective],
  template: `
    <div seoHead>
      <div class="how-it-works-page sc-page">
        <div class="hero-section">
          <h1 class="hero-title">Como Funciona</h1>
          <p class="hero-subtitle">
            Treinamento prático para certificações, focado no formato real de prova.
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card sc-card sc-card--premium">
            <div class="step-number">1</div>
            <h2 class="step-title">Selecione a Certificação</h2>
            <p class="step-description">
              Escolha entre AWS, Azure, GCP e outras certificações disponíveis. Os simulados seguem
              a estrutura e os domínios cobrados nos exames oficiais mais recentes.
            </p>
          </div>

          <div class="step-card sc-card sc-card--premium">
            <div class="step-number">2</div>
            <h2 class="step-title">Execute o Simulado</h2>
            <p class="step-description">
              Responda questões no mesmo formato da prova real, com controle de tempo e nível
              de dificuldade compatível com o exame oficial.
            </p>
          </div>

          <div class="step-card sc-card sc-card--premium">
            <div class="step-number">3</div>
            <h2 class="step-title">Analise as Respostas</h2>
            <p class="step-description">
              Cada questão conta com explicações detalhadas, focadas no raciocínio correto
              e nos conceitos exigidos pela certificação.
            </p>
          </div>

          <div class="step-card sc-card sc-card--premium">
            <div class="step-number">4</div>
            <h2 class="step-title">Acompanhe sua Evolução</h2>
            <p class="step-description">
              Visualize estatísticas por domínio, identifique lacunas de conhecimento
              e acompanhe seu progresso até estar pronto para a prova.
            </p>
          </div>
        </div>

        <div class="features-container">
          <h2 class="section-title">Por que usar o SimulaCert</h2>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Conteúdo Atualizado</h3>
                <p class="feature-text">
                  Questões alinhadas às versões mais recentes dos exames oficiais.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Explicações Objetivas</h3>
                <p class="feature-text">
                  Foco no entendimento do conceito e no motivo da resposta correta.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Análise por Domínio</h3>
                <p class="feature-text">
                  Avalie seu desempenho por área e direcione melhor seus estudos.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Formato Realista</h3>
                <p class="feature-text">
                  Simulados construídos para reproduzir o estilo e a complexidade da prova real.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Acesso Imediato</h3>
                <p class="feature-text">
                  Comece sem burocracia e sem necessidade de cartão de crédito.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-content">
                <h3 class="feature-title">Qualquer Dispositivo</h3>
                <p class="feature-text">
                  Utilize no desktop, tablet ou smartphone, quando e onde quiser.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-banner sc-card sc-card--premium">
          <h2 class="cta-title">Comece a Treinar Agora</h2>
          <p class="cta-text">
            Acesse os simulados e avalie seu nível antes da prova oficial.
          </p>
          <div class="cta-actions">
            <a routerLink="/exams" class="sc-btn sc-btn--primary sc-btn--large">Iniciar Simulado</a>
            <a routerLink="/login" class="sc-btn sc-btn--outline sc-btn--large">Acessar Conta</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./how-it-works.component.css']
})
export class HowItWorksComponent {

  constructor(private seoFactory: SeoFactoryService,
              private seoFacade: SeoFacadeService) {

    const seo = this.seoFactory.website({
      title: 'Como Funciona | SimulaCert',
      description: 'Entenda como funciona a plataforma SimulaCert para simulados de certificação em cloud.',
      canonicalPath: '/how-it-works',
      jsonLdId: 'how-it-works',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Como Funciona',
        description: 'Entenda como funciona a plataforma SimulaCert para simulados de certificação em cloud.',
        url: this.seoFactory.canonicalFromPath('/how-it-works'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: this.seoFactory.origin()
        }
      }
    });

    this.seoFacade.set(seo);
  }
}
