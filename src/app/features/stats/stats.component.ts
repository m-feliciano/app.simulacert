import {Component, OnInit, Renderer2, signal} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {StatsApiService} from '../../api/stats.service';
import {AttemptHistoryItemDto, AwsDomainStatsDto, UserStatsDto} from '../../api/domain';
import {ScoreStatusComponent} from '../../shared/components/score-status/score-status.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, ScoreStatusComponent, SeoHeadDirective],
  template: `
    <div seoHead
         [seoTitle]="'Estatísticas | SimulaCert'"
         [seoDescription]="'Veja suas estatísticas de desempenho nos simulados da SimulaCert.'"
         [seoRobots]="'index, follow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">
      <div class="stats-container">
        <h1>Estatísticas</h1>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Carregando estatísticas...</p>
          </div>
        } @else {

          @if (userStats()) {
          <div class="stats-overview">
            <div class="stat-card">
              <div class="stat-value">{{ userStats()!.totalAttempts }}</div>
              <div class="stat-label">Total de Tentativas</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{{ userStats()!.completedAttempts }}</div>
              <div class="stat-label">Tentativas Completas</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">
                <app-score-status [score]="userStats()!.averageScore">
                  {{ userStats()!.averageScore }}%
                </app-score-status>
              </div>
              <div class="stat-label">Pontuação Média</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">
                <app-score-status [score]="userStats()!.bestScore || 0">
                  {{ userStats()!.bestScore || 0 }}%
                </app-score-status>
              </div>
              <div class="stat-label">Melhor Pontuação</div>
            </div>
          </div>
        }

        @if (domainStats().length > 0) {
          <div class="section">
            <h2>Performance por Domínio</h2>
            <div class="domain-stats">
              @for (domain of domainStats(); track domain.awsDomain) {
                <div class="domain-item">
                  <div class="domain-header">
                    <span class="domain-name">{{ domain.awsDomain || 'Domínio Geral' }}</span>
                    <span class="domain-accuracy">{{ (domain.accuracyRate).toFixed(1) }}%</span>
                  </div>
                  <div class="domain-bar">
                    <div class="domain-fill" [style.width.%]="domain.accuracyRate"></div>
                  </div>
                  <div class="domain-details">
                    {{ domain.correctAnswers }} / {{ domain.totalQuestions }} corretas
                    @if (domain.totalQuestions === 0) {
                      <span class="no-data"> - Sem dados disponíveis</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="section empty-section">
            <h2>Performance por Domínio</h2>
            <p class="empty-message">Nenhum dado de domínio disponível. Complete alguns exames para ver suas
              estatísticas por domínio.</p>
          </div>
        }

        @if (attemptHistory().length > 0) {
          <div class="section">
            <h2>Histórico de Tentativas</h2>
            <div class="history-table" style="overflow: hidden">
              <div class="history-header">
                <div class="col-date">Data</div>
                <div class="col-exam">Exame</div>
                <div class="col-status">Status</div>
                <div class="col-score">Pontuação</div>
              </div>
              @for (attempt of attemptHistory(); track attempt.attemptId) {
                <a class="history-row" [routerLink]="['/attempt', attempt.attemptId, 'result']">
                  <div class="col-date">{{ formatDate(attempt.startedAt) }}</div>
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
          <a routerLink="/exams" class="btn-primary">Fazer Novo Exame</a>
          <a routerLink="/dashboard" class="btn-secondary">Voltar ao Dashboard</a>
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
    private authFacade: AuthFacade,
    private statsApi: StatsApiService,
    private _renderer: Renderer2,
    private location: Location
  ) {}

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}${this.location.prepareExternalUrl('/stats')}`;
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
      error: (error) => {
        console.error('Error loading user stats:', error);
        done();
      }
    });

    this.statsApi.getPerformanceByDomain(userId).subscribe({
      next: (domains) => {
        this.domainStats.set(domains.sort((a, b) => b.accuracyRate - a.accuracyRate));
        done();
      },
      error: (error) => {
        console.error('Error loading domain stats:', error);
        done();
      }
    });

    this.statsApi.getAttemptHistory(userId).subscribe({
      next: (history) => {
        this.attemptHistory.set(history.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        ));
        done();
      },
      error: (error) => {
        console.error('Error loading attempt history:', error);
        done();
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
