import {Component, Renderer2} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {RouterLink} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink, SeoHeadDirective],
  template: `
    <div seoHead
         [seoTitle]="'Como Funciona | SimulaCert'"
         [seoDescription]="'Entenda como funciona a plataforma SimulaCert para simulados de certificação em cloud.'"
         [seoRobots]="'index, follow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">

      <div class="how-it-works-container">
        <div class="hero-section">
          <h1>Como Funciona</h1>
          <p class="subtitle">
            Treinamento prático para certificações, focado no formato real de prova.
          </p>
        </div>

        <div class="steps-section">
          <div class="step-card">
            <div class="step-number">1</div>
            <h2>Selecione a Certificação</h2>
            <p>
              Escolha entre AWS, Azure, GCP e outras certificações disponíveis. Os simulados seguem
              a estrutura e os domínios cobrados nos exames oficiais mais recentes.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h2>Execute o Simulado</h2>
            <p>
              Responda questões no mesmo formato da prova real, com controle de tempo e nível
              de dificuldade compatível com o exame oficial.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h2>Analise as Respostas</h2>
            <p>
              Cada questão conta com explicações detalhadas, focadas no raciocínio correto
              e nos conceitos exigidos pela certificação.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <h2>Acompanhe sua Evolução</h2>
            <p>
              Visualize estatísticas por domínio, identifique lacunas de conhecimento
              e acompanhe seu progresso até estar pronto para a prova.
            </p>
          </div>
        </div>

        <div class="features-section">
          <h2>Por que usar o SimulaCert</h2>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-content">
                <h3>Conteúdo Atualizado</h3>
                <p>
                  Questões alinhadas às versões mais recentes dos exames oficiais.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-content">
                <h3>Explicações Objetivas</h3>
                <p>
                  Foco no entendimento do conceito e no motivo da resposta correta.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-content">
                <h3>Análise por Domínio</h3>
                <p>
                  Avalie seu desempenho por área e direcione melhor seus estudos.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-content">
                <h3>Formato Realista</h3>
                <p>
                  Simulados construídos para reproduzir o estilo e a complexidade da prova real.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-content">
                <h3>Acesso Imediato</h3>
                <p>
                  Comece sem burocracia e sem necessidade de cartão de crédito.
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-content">
                <h3>Disponível em Qualquer Dispositivo</h3>
                <p>
                  Utilize no desktop, tablet ou smartphone, quando e onde quiser.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <h2>Comece a Treinar</h2>
          <p>
            Acesse os simulados e avalie seu nível antes da prova oficial.
          </p>
          <div class="cta-buttons">
            <a routerLink="/exams" class="btn-primary-large">Iniciar Simulado</a>
            <a routerLink="/login" class="btn-secondary">Acessar Conta</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./how-it-works.component.css']
})
export class HowItWorksComponent {


  constructor(private _renderer: Renderer2,
              private location: Location
  ) {
  }

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}${this.location.prepareExternalUrl('/how-it-works')}`;
  }
}
