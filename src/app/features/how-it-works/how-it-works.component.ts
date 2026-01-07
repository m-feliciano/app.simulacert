import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="how-it-works-container">
      <div class="hero-section">
        <h1>Como Funciona</h1>
        <p class="subtitle">Prepare-se para sua certificação em 4 passos simples</p>
      </div>

      <div class="steps-section">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-icon">📚</div>
          <h2>Escolha sua Certificação</h2>
          <p>Navegue entre AWS, Azure, GCP e outras certificações disponíveis. Cada simulado é atualizado regularmente
            para refletir as mudanças nos exames oficiais.</p>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-icon">✍️</div>
          <h2>Faça os Simulados</h2>
          <p>Responda questões no formato real do exame. Teste seus conhecimentos em ambiente que simula a pressão e o
            tempo do exame oficial.</p>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-icon">🤖</div>
          <h2>Aprenda com IA</h2>
          <p>Receba explicações detalhadas geradas por inteligência artificial para cada questão. Entenda não apenas a
            resposta correta, mas o porquê.</p>
        </div>

        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-icon">📊</div>
          <h2>Acompanhe seu Progresso</h2>
          <p>Analise suas estatísticas, identifique pontos fracos e acompanhe sua evolução ao longo do tempo até estar
            pronto para o exame real.</p>
        </div>
      </div>

      <div class="features-section">
        <h2>Por que escolher o simulacert?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Questões Atualizadas</h3>
              <p>Banco de questões constantemente atualizado com base nas versões mais recentes dos exames</p>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Explicações com IA</h3>
              <p>Entenda cada conceito com explicações geradas por modelos de linguagem avançados</p>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Análise Detalhada</h3>
              <p>Visualize seu desempenho por domínio, identifique áreas que precisam de mais estudo</p>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Formato Real</h3>
              <p>Simulados que replicam fielmente o formato e a dificuldade dos exames oficiais</p>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Sem Compromisso</h3>
              <p>Comece gratuitamente, sem cartão de crédito. Cancele quando quiser</p>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h3>Multiplataforma</h3>
              <p>Acesse de qualquer dispositivo - desktop, tablet ou smartphone</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <h2>Pronto para começar?</h2>
        <p>Crie sua conta grátis e faça seu primeiro simulado agora</p>
        <div class="cta-buttons">
          <a routerLink="/register" class="btn-primary-large">Começar Gratuitamente</a>
          <a routerLink="/login" class="btn-secondary">Já tenho conta</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./how-it-works.component.css']
})
export class HowItWorksComponent {
}

