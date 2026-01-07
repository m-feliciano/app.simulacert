import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthFacade} from '../../core/auth/auth.facade';
import {StatsApiService} from '../../api/stats.service';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="achievements-container">
      <div class="header">
        <h1>Conquistas</h1>
        <div class="progress-summary">
          <div class="level-badge">
            <span class="level-icon">⭐</span>
            <span class="level-text">Nível {{ level() }}</span>
          </div>
          <div class="points-badge">
            <span class="points">{{ totalPoints() }}</span>
            <span class="label">pontos</span>
          </div>
        </div>
      </div>

      <div class="streak-section">
        <div class="streak-card">
          <span class="streak-icon">🔥</span>
          <div class="streak-content">
            <div class="streak-number">{{ streakDays() }}</div>
            <div class="streak-label">dias de sequência</div>
          </div>
          <p class="streak-message">Continue assim!</p>
        </div>
      </div>

      <div class="achievements-grid">
        @for (achievement of achievements(); track achievement.id) {
          <div class="achievement-card" [class.unlocked]="achievement.unlocked">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <h3>{{ achievement.title }}</h3>
            <p>{{ achievement.description }}</p>

            @if (!achievement.unlocked) {
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="(achievement.progress / achievement.target) * 100"></div>
              </div>
              <div class="progress-text">{{ achievement.progress }} / {{ achievement.target }}</div>
            } @else {
              <div class="unlocked-badge">✓ Conquistado</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .achievements-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    h1 {
      margin: 0;
      color: var(--color-dark);
      font-size: 28px;
    }

    @media (min-width: 768px) {
      h1 {
        font-size: 32px;
      }
    }

    .progress-summary {
      display: flex;
      gap: var(--spacing-md);
    }

    .level-badge, .points-badge {
      background: var(--color-bg-secondary);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .level-icon {
      font-size: 24px;
    }

    .level-text {
      font-weight: 600;
      color: var(--color-dark);
    }

    .points {
      font-size: 24px;
      font-weight: bold;
      color: var(--color-primary);
    }

    .label {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .streak-section {
      margin-bottom: var(--spacing-xl);
    }

    .streak-card {
      background: linear-gradient(135deg, #ff9900 0%, #ec7211 100%);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      color: white;
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .streak-icon {
      font-size: 48px;
    }

    .streak-content {
      flex: 1;
    }

    .streak-number {
      font-size: 42px;
      font-weight: bold;
      line-height: 1;
    }

    .streak-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .streak-message {
      margin: 0;
      font-weight: 500;
      opacity: 0.95;
    }

    .achievements-grid {
      display: grid;
      gap: var(--spacing-lg);
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    .achievement-card {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: var(--transition-fast);
      opacity: 0.6;
    }

    .achievement-card.unlocked {
      opacity: 1;
      border: 2px solid var(--color-primary);
    }

    .achievement-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .achievement-card:hover {
        transform: none;
      }
    }

    .achievement-icon {
      font-size: 64px;
      margin-bottom: var(--spacing-md);
    }

    .achievement-card h3 {
      margin: 0 0 var(--spacing-sm);
      color: var(--color-dark);
      font-size: 18px;
    }

    .achievement-card p {
      margin: 0 0 var(--spacing-md);
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.5;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--spacing-xs);
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .unlocked-badge {
      background: var(--color-primary);
      color: white;
      padding: 6px 16px;
      border-radius: var(--border-radius-lg);
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
  `]
})
export class AchievementsComponent implements OnInit {
  level = signal(5);
  totalPoints = signal(1250);
  streakDays = signal(7);
  achievements = signal<Achievement[]>([
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro simulado',
      icon: '🎯',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '2',
      title: 'Persistente',
      description: 'Complete 10 simulados',
      icon: '💪',
      unlocked: true,
      progress: 10,
      target: 10
    },
    {
      id: '3',
      title: 'Estudioso',
      description: 'Complete 50 simulados',
      icon: '📚',
      unlocked: false,
      progress: 32,
      target: 50
    },
    {
      id: '4',
      title: 'Aprovado',
      description: 'Obtenha 70% ou mais em um simulado',
      icon: '✅',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '5',
      title: 'Perfeccionista',
      description: 'Obtenha 90% ou mais em um simulado',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      target: 1
    },
    {
      id: '6',
      title: 'Sequência de Fogo',
      description: 'Estude por 7 dias seguidos',
      icon: '🔥',
      unlocked: true,
      progress: 7,
      target: 7
    },
    {
      id: '7',
      title: 'Maratonista',
      description: 'Estude por 30 dias seguidos',
      icon: '🏃',
      unlocked: false,
      progress: 7,
      target: 30
    },
    {
      id: '8',
      title: 'Especialista AWS',
      description: 'Complete todos os exames AWS',
      icon: '☁️',
      unlocked: false,
      progress: 2,
      target: 5
    },
    {
      id: '9',
      title: 'Multi-Cloud',
      description: 'Complete exames de AWS, Azure e GCP',
      icon: '🌐',
      unlocked: false,
      progress: 1,
      target: 3
    }
  ]);

  constructor(
    private authFacade: AuthFacade,
    private statsApi: StatsApiService
  ) {
  }

  ngOnInit(): void {
    // TODO: Carregar achievements reais da API
    // const userId = this.authFacade.currentUser()?.id;
    // if (userId) {
    // }
  }
}

