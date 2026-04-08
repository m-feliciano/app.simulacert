import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {AttemptsApiService} from '../../api/attempts.service';
import {StatsApiService} from '../../api/stats.service';
import {AttemptResponse, UserStatsDto} from '../../api/domain';
import {ScoreStatusComponent} from '../../shared/components/score-status/score-status.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {FormatPercentilePipe} from '../../shared/pipes/format-percentile.pipe';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoMeta} from '../../core/seo/seo.model';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ScoreStatusComponent, SeoHeadDirective, FormatPercentilePipe],
  template: `
    <div seoHead>
      <div class="dashboard">
        @if (loading()) {
          <div class="loading-indicator">
            <span class="spinner"></span>
            Carregando...
          </div>
        } @else {
          @if (isFirstAccess()) {
            <div class="welcome-state">
              <h1>Treine como na prova oficial</h1>

              <p class="welcome-intro">
                Pratique com simulados reais e aumente suas chances de aprovação em certificações de Cloud.
              </p>

              <ul class="welcome-benefits">
                <li>Questões no formato oficial</li>
                <li>Feedback imediato</li>
                <li>100% gratuito para começar</li>
              </ul>

              <div class="quick-actions">
                <a routerLink="/exams" class="btn-primary-large">
                  Começar agora
                </a>

                <p class="helper-text">
                  Leva menos de 1 minuto
                </p>
              </div>
            </div>

          } @else {
            <h1>Bem-vindo de volta!</h1>

            @if (showRecommendations()) {
              <div class="recommendations-section">
                <div class="recommendation-card">
                  <div class="recommendation-icon">💡</div>
                  <div class="recommendation-content">
                    <h3>Recomendação para você</h3>
                    <p>{{ recommendation() }}</p>
                    <a [routerLink]="recommendationLink()" class="btn-recommendation" aria-label="Ver recomendação">
                      {{ recommendationCTA() }}
                    </a>
                  </div>
                </div>
              </div>
            }

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats()?.totalAttempts || 0 }}</div>
                <div class="stat-label">Total de Tentativas</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">{{ stats()?.completedAttempts || 0 }}</div>
                <div class="stat-label">Tentativas Completas</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">
                  <app-score-status [score]="stats()?.averageScore || 0">
                    {{ stats()?.averageScore || 0 | formatPercentile }}%
                  </app-score-status>
                </div>
                <div class="stat-label">Média de Pontuação</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">
                  <app-score-status
                    [score]="stats()?.bestScore || 0">
                    {{ stats()?.bestScore || 0 | formatPercentile }}%
                  </app-score-status>
                </div>
                <div class="stat-label">Melhor Pontuação</div>
              </div>
            </div>

            <div class="section">
              <h2>Tentativas Recentes</h2>
              @if (recentAttempts().length > 0) {
                <div class="attempts-list">
                  @for (attempt of recentAttempts(); track attempt.id) {
                    <a class="attempt-item" [routerLink]="['/attempt', attempt.id, 'result']"
                       aria-label="Ver resultado da tentativa">
                      <div class="attempt-info">
                        <div class="attempt-date">{{ formatDate(attempt.startedAt) }}</div>
                        <div class="attempt-status" [class]="attempt.status.toLowerCase()">
                          {{ formatStatus(attempt.status) }}
                        </div>
                      </div>
                      @if (attempt.score) {
                        <div class="attempt-score"
                             [ngClass]="{'green': attempt.score >= 75,
                                        'red': attempt.score < 40,
                                        'yellow': attempt.score >= 40 && attempt.score <= 74}">
                          {{ attempt.score | formatPercentile }}%
                        </div>
                      }
                    </a>
                  }
                </div>
              }
            </div>

            <div class="actions">
              <a routerLink="/exams" class="btn-primary" aria-label="Fazer novo simulado">Fazer Novo Simulado</a>
              <a routerLink="/stats" class="btn-secondary" aria-label="Ver estatísticas completas">Ver Estatísticas
                Completas</a>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: [`./dashboard.component.css`]
})
export class DashboardComponent implements OnInit {

  seo!: SeoMeta;

  stats = signal<UserStatsDto | null>(null);
  recentAttempts = signal<AttemptResponse[]>([]);
  isFirstAccess = signal<boolean>(true);
  showRecommendations = signal<boolean>(false);
  recommendation = signal<string>('');
  recommendationCTA = signal<string>('');
  recommendationLink = signal<string>('/exams');
  loading = signal<boolean>(false);

  ngOnInit(): void {
    const user = this.authFacade.currentUser();
    if (user) {
      this.loadStats(user.id);
      this.loadRecentAttempts(user.id);
    }
  }

  constructor(
    private authFacade: AuthFacade,
    private attemptsApi: AttemptsApiService,
    private statsApi: StatsApiService,
    private seoFactory: SeoFactoryService,
    private seoFacade: SeoFacadeService,
  ) {
    const seo = this.seoFactory.website({
      title: 'Dashboard | SimulaCert',
      description: 'Acompanhe seu desempenho, estatísticas e recomendações personalizadas para simulados de certificação.',
      canonicalPath: '/dashboard',
      robots: 'index, follow',
      jsonLdId: 'dashboard',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Dashboard',
        description: 'Acompanhe seu desempenho, estatísticas e recomendações personalizadas para simulados de certificação.',
        url: this.seoFactory.canonicalFromPath('/dashboard'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: this.seoFactory.origin(),
        },
      },
    });

    this.seoFacade.set(seo);

  }

  loadStats(userId: string): void {
    this.loading.set(true);
    this.statsApi.getUserStatistics(userId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isFirstAccess.set(!stats.totalAttempts || stats.totalAttempts === 0);

        if (!this.isFirstAccess()) {
          this.generateRecommendations(stats);
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  generateRecommendations(stats: UserStatsDto): void {
    const avgScore = stats.averageScore || 0;
    const totalAttempts = stats.totalAttempts || 0;
    const completedAttempts = stats.completedAttempts || 0;

    if (avgScore < 50) {
      this.showRecommendations.set(true);
      this.recommendation.set('Sua média está abaixo de 50%. Que tal revisar os conceitos básicos antes de fazer mais simulados?');
      this.recommendationCTA.set('Ver Estatísticas Detalhadas');
      this.recommendationLink.set('/stats');

    } else if (avgScore >= 50 && avgScore < 70) {
      this.showRecommendations.set(true);
      this.recommendation.set('Você está progredindo bem! Continue praticando para alcançar a nota de aprovação (70%).');
      this.recommendationCTA.set('Fazer Novo Simulado');
      this.recommendationLink.set('/exams');

    } else if (avgScore >= 70 && avgScore < 85) {
      this.showRecommendations.set(true);
      this.recommendation.set('Excelente! Você está acima da nota de aprovação. Continue praticando para consolidar seu conhecimento.');
      this.recommendationCTA.set('Fazer Novo Simulado');
      this.recommendationLink.set('/exams');

    } else if (avgScore >= 85) {
      this.showRecommendations.set(true);
      this.recommendation.set('Parabéns! Sua média é excelente. Você está pronto para o exame real!');
      this.recommendationCTA.set('Ver Conquistas');
      this.recommendationLink.set('/achievements');
    }

    if (totalAttempts < 5) {
      this.showRecommendations.set(true);
      this.recommendation.set('Complete mais simulados para ter uma visão melhor do seu desempenho e identificar pontos de melhoria.');
      this.recommendationCTA.set('Fazer Novo Simulado');
      this.recommendationLink.set('/exams');
    }

    if (completedAttempts < totalAttempts && (totalAttempts - completedAttempts) >= 3) {
      this.showRecommendations.set(true);
      this.recommendation.set(`Você tem ${totalAttempts - completedAttempts} simulados incompletos. Termine-os para ter estatísticas mais precisas.`);
      this.recommendationCTA.set('Ver Tentativas');
      this.recommendationLink.set('/stats');
    }
  }

  loadRecentAttempts(userId: string): void {
    this.attemptsApi.getAttemptsByUser(userId).subscribe({
      next: (attempts) => {
        const sorted = attempts
          .sort((a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, 5);
        this.recentAttempts.set(sorted);
      },
      error: (error) => {
        console.error('Error loading attempts:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído',
      'ABANDONED': 'Cancelado'
    };
    return statusMap[status] || status;
  }
}
