import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {StatsApiService} from '../../api/stats.service';
import {AttemptHistoryItemDto, AwsDomainStatsDto, UserStatsDto} from '../../api/domain';
import {ScoreStatusComponent} from '../../shared/components/score-status/score-status.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {FormatPercentilePipe} from '../../shared/pipes/format-percentile.pipe';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {FormatDatePipe} from '../../shared/pipes/format-date.pipe';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';
import {I18nService} from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, ScoreStatusComponent, SeoHeadDirective, FormatPercentilePipe, FormatDatePipe, TranslatePipe],
  template: `
    <div seoHead>
      <div class="stats-container">
        <h1>{{ 'stats.title' | translate }}</h1>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'stats.loading' | translate }}</p>
          </div>
        } @else {

          @if (userStats()) {
          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-value">{{ userStats()!.totalAttempts }}</div>
              <div class="stat-label">{{ 'dashboard.stats.totalAttempts' | translate }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{{ userStats()!.completedAttempts }}</div>
              <div class="stat-label">{{ 'dashboard.stats.completedAttempts' | translate }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">
                <app-score-status [score]="userStats()!.averageScore">
                  {{ userStats()!.averageScore | formatPercentile }}%
                </app-score-status>
              </div>
              <div class="stat-label">{{ 'stats.averageScore' | translate }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">
                <app-score-status [score]="userStats()!.bestScore || 0">
                  {{ userStats()!.bestScore || 0 | formatPercentile }}%
                </app-score-status>
              </div>
              <div class="stat-label">{{ 'dashboard.stats.bestScore' | translate }}</div>
            </div>
          </div>
        }

        @if (domainStats().length > 0) {
          <div class="section">
            <h2>{{ 'stats.domainPerformance' | translate }}</h2>
            <div class="domain-stats">
              @for (domain of domainStats(); track domain.awsDomain) {
                <div class="domain-item">
                  <div class="domain-header">
                    <span class="domain-name">{{ domain.awsDomain || ('stats.generalDomain' | translate) }}</span>
                    <span class="domain-accuracy">{{ domain.accuracyRate | formatPercentile }}%</span>
                  </div>
                  <div class="domain-bar">
                    <div class="domain-fill" [style.width.%]="domain.accuracyRate"></div>
                  </div>
                  <div class="domain-details">
                    {{ domain.correctAnswers }} / {{ domain.totalQuestions }} {{ 'stats.correct' | translate }}
                    @if (domain.totalQuestions === 0) {
                      <span class="no-data"> - {{ 'stats.noData' | translate }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="section empty-section">
            <h2>{{ 'stats.domainPerformance' | translate }}</h2>
            <p class="empty-message">{{ 'stats.emptyMessage' | translate }}</p>
          </div>
        }

        @if (attemptHistory().length > 0) {
          <div class="section">
            <h2>{{ 'stats.attemptHistory' | translate }}</h2>
            <div class="history-table" style="overflow: hidden">
              <div class="history-header">
                <div class="col-date">{{ 'stats.columnDate' | translate }}</div>
                <div class="col-exam">{{ 'stats.columnExam' | translate }}</div>
                <div class="col-status">{{ 'stats.columnStatus' | translate }}</div>
                <div class="col-score">{{ 'stats.columnScore' | translate }}</div>
              </div>
              @for (attempt of attemptHistory(); track attempt.attemptId) {
                <a class="history-row" [routerLink]="['/attempt', attempt.attemptId, attempt.status === 'IN_PROGRESS' ? 'run' : 'result']">
                  <div class="col-date">{{ attempt.startedAt | formatDate }}</div>
                  <div class="col-exam">{{ attempt.examTitle }}</div>

                  <div class="col-status">
                    <span class="status-badge" [class]="attempt.status.toLowerCase()">
                      {{ formatStatus(attempt.status) }}
                    </span>
                  </div>

                  <div class="col-score">
                    @if (attempt.score !== null && attempt.score !== undefined) {
                      <app-score-status [score]="attempt.score">
                        {{ attempt.score || 0 }}%
                      </app-score-status>
                    } @else {
                      <span>-</span>
                    }
                  </div>
                </a>
              }
            </div>
          </div>
        }

        <div class="actions">
          <a routerLink="/exams" class="btn-primary">{{ 'stats.newExam' | translate }}</a>
          <a routerLink="/dashboard" class="btn-secondary">{{ 'stats.backToDashboard' | translate }}</a>
        </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  userStats = signal<UserStatsDto | null>(null);
  domainStats = signal<AwsDomainStatsDto[]>([]);
  attemptHistory = signal<AttemptHistoryItemDto[]>([]);
  loading = signal(true);

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly statsApi: StatsApiService,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
    private readonly i18n: I18nService,
  ) {
    const meta = this.seoFactory.website({
      title: 'Estatísticas | SimulaCert',
      description: 'Veja suas estatísticas de desempenho nos simulados da SimulaCert.',
      canonicalPath: '/stats',
      robots: 'noindex, nofollow',
      jsonLdId: 'stats',
    });

    this.seoFacade.set(meta);
  }

  ngOnInit(): void {
    const userId = this.authFacade.currentUser()?.id;
    if (userId) {
      this.loadStats(userId);
    } else {
      this.loading.set(false);
    }
  }

  loadStats(userId: string): void {
    let loaded = 0;

    const done = () => {
      loaded++;
      if (loaded === 3) this.loading.set(false);
    };

    this.statsApi.getUserStatistics(userId).subscribe({
      next: (stats) => {
        this.userStats.set(stats);
        done();
      },
      error: () => done()
    });

    this.statsApi.getPerformanceByDomain(userId).subscribe({
      next: (domains) => {
        this.domainStats.set(domains.sort((a, b) => b.accuracyRate - a.accuracyRate));
        done();
      },
      error: () => done()
    });

    this.statsApi.getAttemptHistory(userId).subscribe({
      next: (history) => {
        this.attemptHistory.set(history.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        ));
        done();
      },
      error: () => done()
    });
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'IN_PROGRESS': this.i18n.instant('attempt.inProgress'),
      'COMPLETED': this.i18n.instant('attempt.completed'),
      'ABANDONED': this.i18n.instant('attempt.abandoned')
    };
    return statusMap[status] || status;
  }
}
