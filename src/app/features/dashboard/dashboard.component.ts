import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AttemptsApiService } from '../../api/attempts.service';
import { StatsApiService } from '../../api/stats.service';
import { AttemptResponse, UserStatsDto } from '../../api/domain';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

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
          <div class="stat-value">{{ stats()?.averageScore?.toFixed(1) || 0 }}%</div>
          <div class="stat-label">Média de Pontuação</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ stats()?.bestScore || 0 }}%</div>
          <div class="stat-label">Melhor Pontuação</div>
        </div>
      </div>

      <div class="section">
        <h2>Tentativas Recentes</h2>
        @if (recentAttempts().length > 0) {
          <div class="attempts-list">
            @for (attempt of recentAttempts(); track attempt.id) {
              <a class="attempt-item" [routerLink]="['/attempt', attempt.id, 'result']">
                <div class="attempt-info">
                  <div class="attempt-date">{{ formatDate(attempt.startedAt) }}</div>
                  <div class="attempt-status" [class]="attempt.status.toLowerCase()">
                    {{ formatStatus(attempt.status) }}
                  </div>
                </div>
                @if (attempt.score !== null && attempt.score !== undefined) {
                  <div class="attempt-score">
                    {{ attempt.score }}%
                  </div>
                }
              </a>
            }
          </div>
        } @else {
          <p class="empty-message">Nenhuma tentativa ainda</p>
        }
      </div>

      <div class="actions">
        <a routerLink="/exams" class="btn-primary">Ver Exames</a>
        <a routerLink="/stats" class="btn-secondary">Ver Estatísticas Completas</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
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
      margin: var(--spacing-xl) 0 var(--spacing-lg);
      color: var(--color-dark);
      font-size: 20px;
    }

    @media (min-width: 768px) {
      h2 {
        font-size: 24px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xxl);
    }

    @media (min-width: 768px) {
      .stats-grid {
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

    .attempts-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .attempt-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--color-bg-primary);
      border-radius: var(--border-radius-sm);
      transition: var(--transition-fast);
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .attempt-item:hover {
      background: #ececec;
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .attempt-item:hover {
        transform: none;
      }
    }

    .attempt-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    @media (min-width: 768px) {
      .attempt-info {
        flex-direction: row;
        gap: var(--spacing-md);
        align-items: center;
      }
    }

    .attempt-date {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    @media (min-width: 768px) {
      .attempt-date {
        font-size: 14px;
      }
    }

    .attempt-status {
      padding: 4px 12px;
      border-radius: var(--border-radius-lg);
      font-size: 11px;
      font-weight: 500;
      width: fit-content;
    }

    @media (min-width: 768px) {
      .attempt-status {
        font-size: 12px;
      }
    }

    .attempt-status.completed {
      background: var(--color-bg-success);
      color: #155724;
    }

    .attempt-status.in_progress {
      background: var(--color-bg-warning);
      color: var(--color-warning);
    }

    .attempt-status.abandoned {
      background: var(--color-bg-danger);
      color: #721c24;
    }

    .attempt-score {
      font-size: 16px;
      font-weight: bold;
      color: var(--color-primary);
    }

    @media (min-width: 768px) {
      .attempt-score {
        font-size: 18px;
      }
    }

    .empty-message {
      text-align: center;
      color: var(--color-text-light);
      padding: var(--spacing-lg);
      font-style: italic;
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
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<UserStatsDto | null>(null);
  recentAttempts = signal<AttemptResponse[]>([]);

  constructor(
    private authFacade: AuthFacade,
    private attemptsApi: AttemptsApiService,
    private statsApi: StatsApiService
  ) {}

  ngOnInit(): void {
    const userId = this.authFacade.currentUser?.id;
    if (userId) {
      this.loadStats(userId);
      this.loadRecentAttempts(userId);
    }
  }

  loadStats(userId: string): void {
    this.statsApi.getUserStatistics(userId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadRecentAttempts(userId: string): void {
    this.attemptsApi.getAttemptsByUser(userId).subscribe({
      next: (attempts) => {
        const sorted = attempts
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
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
      'ABANDONED': 'Abandonado'
    };
    return statusMap[status] || status;
  }
}

