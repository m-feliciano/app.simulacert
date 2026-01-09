import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {AttemptsApiService} from '../../api/attempts.service';
import {StatsApiService} from '../../api/stats.service';
import {AttemptResponse, UserStatsDto} from '../../api/domain';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      @if (loading()) {
        <div class="loading-indicator">
          <span class="spinner"></span>
          Carregando...
        </div>
      } @else {
        @if (isFirstAccess()) {
          <div class="welcome-state">
            <h1>Simulador de Certificações</h1>
            <p class="welcome-intro">
              Treine com simulados no formato real das principais certificações de cloud.
            </p>
            <div class="quick-actions">
              <a routerLink="/exams" class="btn-primary-large">
                Iniciar
              </a>
              <p class="helper-text">
                AWS, Azure, GCP e outras certificações
              </p>
            </div>
          </div>

        } @else {
          <!-- Dashboard normal com estatísticas -->
          <h1>Bem-vindo de volta!</h1>

          <!-- Recomendações Inteligentes -->
          @if (showRecommendations()) {
            <div class="recommendations-section">
              <div class="recommendation-card">
                <div class="recommendation-icon">💡</div>
                <div class="recommendation-content">
                  <h3>Recomendação para você</h3>
                  <p>{{ recommendation() }}</p>
                  <a [routerLink]="recommendationLink()" class="btn-recommendation">
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
                    @if (attempt.score) {
                      <div class="attempt-score"
                           [ngClass]="{'green': attempt.score >= 75,
                                      'red': attempt.score < 40,
                                      'yellow': attempt.score >= 40 && attempt.score <= 74}
                                  ">
                        {{ attempt.score }}%
                      </div>
                    }
                  </a>
                }
              </div>
            }
          </div>

          <div class="actions">
            <a routerLink="/exams" class="btn-primary">Fazer Novo Simulado</a>
            <a routerLink="/stats" class="btn-secondary">Ver Estatísticas Completas</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Welcome State (Empty State) */
    .welcome-state {
      text-align: center;
      padding: var(--spacing-xxl) var(--spacing-lg);
      background: var(--color-bg-secondary);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      max-width: 600px;
      margin: var(--spacing-xxl) auto;
    }

    .welcome-icon {
      font-size: 64px;
      margin-bottom: var(--spacing-lg);
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .welcome-icon {
        animation: none;
      }
    }

    .welcome-state h1 {
      margin: 0 0 var(--spacing-md);
      color: var(--color-dark);
      font-size: 28px;
    }

    @media (min-width: 768px) {
      .welcome-state h1 {
        font-size: 32px;
      }
    }

    .welcome-intro {
      color: var(--color-text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 var(--spacing-xl);
    }

    @media (min-width: 768px) {
      .welcome-intro {
        font-size: 18px;
      }
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: center;
    }

    .btn-primary-large {
      display: inline-block;
      padding: 16px 32px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      font-size: 18px;
      font-weight: 600;
      transition: var(--transition-fast);
      box-shadow: var(--shadow-md);
    }

    .btn-primary-large:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary-large:hover {
        transform: none;
      }
    }

    .helper-text {
      color: var(--color-text-light);
      font-size: 14px;
      margin: 0;
    }

    /* Normal Dashboard Styles */
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

    /* Recommendations Section */
    .recommendations-section {
      margin-bottom: var(--spacing-xl);
    }

    .recommendation-card {
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      display: flex;
      gap: var(--spacing-lg);
      align-items: center;
      color: white;
    }

    .recommendation-icon {
      font-size: 48px;
      flex-shrink: 0;
    }

    .recommendation-content {
      flex: 1;
    }

    .recommendation-content h3 {
      margin: 0 0 var(--spacing-sm);
      font-size: 20px;
      font-weight: 600;
    }

    .recommendation-content p {
      margin: 0 0 var(--spacing-md);
      font-size: 15px;
      line-height: 1.5;
      opacity: 0.95;
    }

    .btn-recommendation {
      display: inline-block;
      padding: 10px 20px;
      background: white;
      color: #357abd;
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      font-weight: 600;
      font-size: 14px;
      transition: var(--transition-fast);
    }

    .btn-recommendation:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-recommendation:hover {
        transform: none;
      }
    }

    @media (max-width: 768px) {
      .recommendation-card {
        flex-direction: column;
        text-align: center;
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
    }

    .attempt-score.yellow {
      color: #ffc107;
    }

    .attempt-score.green {
      color: #28a745;
    }

    .attempt-score.red {
      color: #d13212;
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

    .loading-indicator {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      text-align: center;
      font-size: 18px;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      padding: 32px 40px;
      min-width: 220px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<UserStatsDto | null>(null);
  recentAttempts = signal<AttemptResponse[]>([]);
  isFirstAccess = signal<boolean>(true);
  showRecommendations = signal<boolean>(false);
  recommendation = signal<string>('');
  recommendationCTA = signal<string>('');
  recommendationLink = signal<string>('/exams');
  loading = signal<boolean>(false);

  constructor(
    private authFacade: AuthFacade,
    private attemptsApi: AttemptsApiService,
    private statsApi: StatsApiService
  ) {}

  ngOnInit(): void {
    const user = this.authFacade.currentUser();
    if (user) {
      this.loadStats(user.id);
      this.loadRecentAttempts(user.id);
    }
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

    // Recomendação baseada na média de pontuação
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

    // Recomendação baseada em quantidade de simulados
    if (totalAttempts < 5) {
      this.showRecommendations.set(true);
      this.recommendation.set('Complete mais simulados para ter uma visão melhor do seu desempenho e identificar pontos de melhoria.');
      this.recommendationCTA.set('Fazer Novo Simulado');
      this.recommendationLink.set('/exams');
    }

    // Recomendação para simulados incompletos
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
