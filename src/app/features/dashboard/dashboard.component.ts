import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {LucideAngularModule, Lightbulb} from 'lucide-angular';
import {AuthFacade} from '../../core/auth/auth.facade';
import {AttemptsApiService} from '../../api/attempts.service';
import {StatsApiService} from '../../api/stats.service';
import {AttemptResponse, UserStatsDto} from '../../api/domain';
import {ScoreStatusComponent} from '../../shared/components/score-status/score-status.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {FormatPercentilePipe} from '../../shared/pipes/format-percentile.pipe';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {FormatDatePipe} from '../../shared/pipes/format-date.pipe';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';
import {TranslateService} from '@ngx-translate/core';
import {FormatTimePipe} from '../../shared/pipes/format-status.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ScoreStatusComponent, SeoHeadDirective, FormatPercentilePipe, FormatDatePipe, LucideAngularModule, TranslatePipe, FormatTimePipe],
  template: `
    <div seoHead>
      <div class="dashboard">
        @if (loading()) {
          <div class="loading-indicator">
            <span class="spinner"></span>
            {{ 'dashboard.loading' | translate }}
          </div>
        } @else {
          @if (isFirstAccess()) {
            <div class="welcome-state">
              <h1>{{ 'dashboard.trainLikeLive' | translate }}</h1>

              <p class="welcome-intro">
                {{ 'dashboard.trainDescription' | translate }}
              </p>

              <ul class="welcome-benefits">
                <li>{{ 'dashboard.benefits.officialFormat' | translate }}</li>
                <li>{{ 'dashboard.benefits.immediateFeedback' | translate }}</li>
                <li>{{ 'dashboard.benefits.free' | translate }}</li>
              </ul>

              <div class="quick-actions">
                <a routerLink="/exams" class="btn-primary-large">
                  {{ 'dashboard.startNow' | translate }}
                </a>

                <p class="helper-text">
                  {{ 'dashboard.lessthan1Min' | translate }}
                </p>
              </div>
            </div>

          } @else {
            <h1>{{ 'dashboard.welcome' | translate }}</h1>

            @if (showRecommendations()) {
              <div class="recommendations-section">
                <div class="recommendation-card">
                  <div class="recommendation-icon">
                    <lucide-icon [img]="Lightbulb" class="icon-premium"></lucide-icon>
                  </div>
                  <div class="recommendation-content">
                    <h3>{{ 'dashboard.recommendation' | translate }}</h3>
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
                <div class="stat-label">{{ 'dashboard.stats.totalAttempts' | translate }}</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">{{ stats()?.completedAttempts || 0 }}</div>
                <div class="stat-label">{{ 'dashboard.stats.completedAttempts' | translate }}</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">
                  <app-score-status [score]="stats()?.averageScore || 0">
                    {{ stats()?.averageScore || 0 | formatPercentile }}%
                  </app-score-status>
                </div>
                <div class="stat-label">{{ 'dashboard.stats.averageScore' | translate }}</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">
                  <app-score-status
                    [score]="stats()?.bestScore || 0">
                    {{ stats()?.bestScore || 0 | formatPercentile }}%
                  </app-score-status>
                </div>
                <div class="stat-label">{{ 'dashboard.stats.bestScore' | translate }}</div>
              </div>
            </div>

            <div class="section">
              <h2>{{ 'dashboard.recentAttempts' | translate }}</h2>
              @if (recentAttempts() && recentAttempts().length > 0) {
                <div class="attempts-list">
                  @for (attempt of recentAttempts(); track attempt.id) {
                    <a class="attempt-item"
                       [routerLink]="['/attempt', attempt.id,  attempt.status === 'IN_PROGRESS' ? 'run' : 'result']"
                       aria-label="Ver detalhes da tentativa iniciada em {{ attempt.startedAt | formatDate }}">
                      <div class="attempt-info">
                        <div class="attempt-date">{{ attempt.startedAt | formatDate }}</div>
                        <div class="attempt-status" [class]="attempt.status.toLowerCase()">
                          {{ attempt.status | formatStatus }}
                        </div>
                      </div>
                      @if (attempt.score) {
                        <div class="attempt-score"
                             [ngClass]="{'green': attempt.score >= 70,
                                        'red': attempt.score < 40,
                                        'yellow': attempt.score >= 40 && attempt.score < 70}">
                          {{ attempt.score | formatPercentile }}%
                        </div>
                      }
                    </a>
                  }
                </div>
              }
            </div>

            <div class="actions">
              <a routerLink="/exams" class="btn-primary"
                 aria-label="Fazer novo simulado">{{ 'dashboard.newSimulation' | translate }}</a>
              <a routerLink="/stats" class="btn-secondary"
                 aria-label="Ver estatísticas completas">{{ 'dashboard.fullStats' | translate }}</a>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: [`./dashboard.component.css`]
})
export class DashboardComponent implements OnInit {
  readonly Lightbulb = Lightbulb;

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
    private readonly authFacade: AuthFacade,
    private readonly attemptsApi: AttemptsApiService,
    private readonly statsApi: StatsApiService,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
    private readonly translateService: TranslateService,
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
      }, error: () => {
        this.stats.set(null);
        this.loading.set(false);
      }, complete: () => {
        this.loading.set(false);
      }
    });
  }

  generateRecommendations(stats: UserStatsDto): void {
    const avgScore = stats.averageScore || 0;
    const totalAttempts = stats.totalAttempts || 0;
    const completedAttempts = stats.completedAttempts || 0;

    if (avgScore < 50) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.lowScore'));
      this.recommendationCTA.set(this.translateService.instant('dashboard.recommendations.viewStatsDetail'));
      this.recommendationLink.set('/stats');

    } else if (avgScore >= 50 && avgScore < 70) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.mediumScore'));
      this.recommendationCTA.set(this.translateService.instant('dashboard.newSimulation'));
      this.recommendationLink.set('/exams');

    } else if (avgScore >= 70 && avgScore < 85) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.highScore'));
      this.recommendationCTA.set(this.translateService.instant('dashboard.newSimulation'));
      this.recommendationLink.set('/exams');

    } else if (avgScore >= 85) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.excellentScore'));
      this.recommendationCTA.set(this.translateService.instant('dashboard.recommendations.viewAchievements'));
      this.recommendationLink.set('/achievements');
    }

    if (totalAttempts < 5) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.fewAttempts'));
      this.recommendationCTA.set(this.translateService.instant('dashboard.newSimulation'));
      this.recommendationLink.set('/exams');
    }

    if (completedAttempts < totalAttempts && (totalAttempts - completedAttempts) >= 3) {
      this.showRecommendations.set(true);
      this.recommendation.set(this.translateService.instant('dashboard.recommendations.incompleteAttempts', {count: totalAttempts - completedAttempts}));
      this.recommendationCTA.set(this.translateService.instant('dashboard.recommendations.viewAttempts'));
      this.recommendationLink.set('/stats');
    }
  }

  loadRecentAttempts(userId: string): void {
    this.attemptsApi.getAttemptsByUser(userId).subscribe({
      next: (attempts) => {
        this.recentAttempts.set(attempts);
      },
    });
  }
}
