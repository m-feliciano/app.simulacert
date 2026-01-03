import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { StatsApiService } from '../../api/stats.service';
import { UserStatsDto, AttemptHistoryItemDto, AwsDomainStatsDto } from '../../api/domain';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="stats-container">
      <h1>Estatísticas</h1>

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
            <div class="stat-value">{{ userStats()!.averageScore.toFixed(1) }}%</div>
            <div class="stat-label">Pontuação Média</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ userStats()!.bestScore }}%</div>
            <div class="stat-label">Melhor Pontuação</div>
          </div>
        </div>
      }

      @if (domainStats().length > 0) {
        <div class="section">
          <h2>Performance por Domínio AWS</h2>
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
          <h2>Performance por Domínio AWS</h2>
          <p class="empty-message">Nenhum dado de domínio disponível. Complete alguns exames para ver suas estatísticas por domínio.</p>
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
                    <span [class.passed]="attempt.score >= 72" [class.failed]="attempt.score < 72">
                      {{ attempt.score }}%
                    </span>
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
    </div>
  `,
  styles: [`
    .stats-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 var(--spacing-xl);
      color: var(--color-dark);
      font-size: 28px;
    }

    @media (min-width: 768px) {
      h1 {
        font-size: 32px;
      }
    }

    h2 {
      margin: 0 0 var(--spacing-lg);
      color: var(--color-dark);
      font-size: 20px;
    }

    @media (min-width: 768px) {
      h2 {
        font-size: 24px;
      }
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xxl);
    }

    @media (min-width: 768px) {
      .stats-overview {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    .stat-card {
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: var(--transition-fast);
    }

    @media (min-width: 768px) {
      .stat-card {
        padding: var(--spacing-xl);
      }
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .stat-card:hover {
        transform: none;
      }
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }

    @media (min-width: 768px) {
      .stat-value {
        font-size: 36px;
      }
    }

    .stat-label {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    @media (min-width: 768px) {
      .stat-label {
        font-size: 14px;
      }
    }

    .section {
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-xl);
    }

    @media (min-width: 768px) {
      .section {
        padding: var(--spacing-xl);
      }
    }

    .domain-stats {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .domain-item {
      padding: var(--spacing-md);
      background: var(--color-bg-primary);
      border-radius: var(--border-radius-md);
      transition: var(--transition-fast);
    }

    .domain-item:hover {
      background: #ececec;
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .domain-item:hover {
        transform: none;
      }
    }

    .domain-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      gap: var(--spacing-sm);
    }

    .domain-name {
      font-weight: 500;
      color: var(--color-dark);
      font-size: 14px;
    }

    @media (min-width: 768px) {
      .domain-name {
        font-size: 15px;
      }
    }

    .domain-accuracy {
      font-weight: bold;
      color: var(--color-primary);
      font-size: 14px;
    }

    @media (min-width: 768px) {
      .domain-accuracy {
        font-size: 15px;
      }
    }

    .domain-bar {
      height: 8px;
      background: var(--color-border-light);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      margin-bottom: 8px;
    }

    .domain-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
      transition: var(--transition-normal);
    }

    .domain-details {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    @media (min-width: 768px) {
      .domain-details {
        font-size: 12px;
      }
    }

    .domain-details .no-data {
      color: var(--color-warning);
      font-style: italic;
    }

    .empty-section {
      text-align: center;
    }

    .empty-message {
      color: var(--color-text-secondary);
      font-style: italic;
      margin: var(--spacing-md) 0;
    }

    .history-table {
      display: flex;
      flex-direction: column;
      overflow-x: auto;
    }

    .history-header, .history-row {
      display: grid;
      grid-template-columns: 180px 1fr 150px 120px;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      align-items: center;
      min-width: 600px;
    }

    .history-header {
      background: var(--color-bg-primary);
      font-weight: bold;
      color: var(--color-dark);
      border-radius: var(--border-radius-sm);
      font-size: 13px;
    }

    @media (min-width: 768px) {
      .history-header {
        font-size: 14px;
      }
    }

    .history-row {
      border-bottom: 1px solid var(--color-border-light);
      transition: var(--transition-fast);
      font-size: 13px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .history-row {
        font-size: 14px;
      }
    }

    .history-row:hover {
      background: var(--color-bg-primary);
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .history-row:hover {
        transform: none;
      }
    }

    .col-date {
      color: var(--color-text-secondary);
    }

    .col-exam {
      font-weight: 500;
      color: var(--color-dark);
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: var(--border-radius-lg);
      font-size: 11px;
      font-weight: 500;
      display: inline-block;
    }

    @media (min-width: 768px) {
      .status-badge {
        font-size: 12px;
      }
    }

    .status-badge.completed {
      background: var(--color-bg-success);
      color: #155724;
    }

    .status-badge.in_progress {
      background: var(--color-bg-warning);
      color: var(--color-warning);
    }

    .status-badge.abandoned {
      background: var(--color-bg-danger);
      color: #721c24;
    }

    .col-score {
      font-size: 16px;
      font-weight: bold;
      text-align: right;
    }

    @media (min-width: 768px) {
      .col-score {
        font-size: 18px;
      }
    }

    .col-score .passed {
      color: var(--color-success);
    }

    .col-score .failed {
      color: var(--color-danger);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    @media (min-width: 768px) {
      .actions {
        flex-direction: row;
      }
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      transition: var(--transition-fast);
      border: none;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: var(--color-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary:hover, .btn-secondary:hover {
        transform: none;
      }
    }

    @media (max-width: 768px) {
      .history-header, .history-row {
        grid-template-columns: 1fr;
        gap: 8px;
        min-width: auto;
      }

      .history-header {
        display: none;
      }

      .col-date, .col-exam, .col-status, .col-score {
        text-align: left;
      }

      .history-row {
        padding: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        margin-bottom: var(--spacing-sm);
      }
    }
  `]
})
export class StatsComponent implements OnInit {
  userStats = signal<UserStatsDto | null>(null);
  domainStats = signal<AwsDomainStatsDto[]>([]);
  attemptHistory = signal<AttemptHistoryItemDto[]>([]);

  constructor(
    private authFacade: AuthFacade,
    private statsApi: StatsApiService
  ) {}

  ngOnInit(): void {
    const userId = this.authFacade.currentUser()?.id;
    if (userId) {
      this.loadStats(userId);
    }
  }

  loadStats(userId: string): void {
    this.statsApi.getUserStatistics(userId).subscribe({
      next: (stats) => {
        this.userStats.set(stats);
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });

    this.statsApi.getPerformanceByDomain(userId).subscribe({
      next: (domains) => {
        this.domainStats.set(domains.sort((a, b) => b.accuracyRate - a.accuracyRate));
      },
      error: (error) => {
        console.error('Error loading domain stats:', error);
      }
    });

    this.statsApi.getAttemptHistory(userId).subscribe({
      next: (history) => {
        this.attemptHistory.set(history.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        ));
      },
      error: (error) => {
        console.error('Error loading attempt history:', error);
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
      'ABANDONED': 'Abandonado'
    };
    return statusMap[status] || status;
  }
}

