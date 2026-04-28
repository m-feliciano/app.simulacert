import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthFacade} from '../../core/auth/auth.facade';
import {StatsApiService} from '../../api/stats.service';
import {
  Award,
  BarChart3,
  BookOpen,
  Cloud,
  Flame,
  Globe,
  LucideAngularModule,
  Medal,
  Target,
  Trophy,
} from 'lucide-angular';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'target' | 'strength' | 'book' | 'award' | 'trophy' | 'flame' | 'medal' | 'cloud' | 'globe';
  unlocked: boolean;
  progress: number;
  target: number;
}

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="sc-page">
      <div class="sc-container achievements">
        <header class="header">
          <div class="title">
            <h1>Conquistas</h1>
            <p class="subtitle">Acompanhe seu progresso e desbloqueie marcos de estudo.</p>
          </div>

          <div class="summary" role="group" aria-label="Resumo de progresso">
            <div class="pill">
              <lucide-icon class="pill-icon" [img]="icons.level" aria-hidden="true"></lucide-icon>
              <span class="pill-strong">Nível {{ level() }}</span>
            </div>
            <div class="pill">
              <lucide-icon class="pill-icon" [img]="icons.points" aria-hidden="true"></lucide-icon>
              <span class="pill-strong">{{ totalPoints() }}</span>
              <span class="pill-muted">pontos</span>
            </div>
          </div>
        </header>

        <section class="streak sc-card" aria-label="Sequência de estudo">
          <div class="streak-left">
            <div class="streak-badge" aria-hidden="true">
              <lucide-icon [img]="icons.streak" class="streak-icon"></lucide-icon>
            </div>
            <div>
              <div class="streak-number">{{ streakDays() }}</div>
              <div class="streak-label">dias de sequência</div>
            </div>
          </div>
          <div class="streak-right">
            <p class="streak-message">Consistência vence intensidade. Continue assim.</p>
          </div>
        </section>

        <section class="grid" aria-label="Lista de conquistas">
          @for (achievement of achievements(); track achievement.id) {
            <article class="card sc-card" [class.unlocked]="achievement.unlocked">
              <div class="card-top">
                <div class="icon" aria-hidden="true">
                  <lucide-icon class="icon-svg" [img]="iconsByAchievement[achievement.icon]"></lucide-icon>
                </div>
                @if (achievement.unlocked) {
                  <span class="state state--unlocked">Conquistado</span>
                } @else {
                  <span class="state state--locked">Em progresso</span>
                }
              </div>

              <h3>{{ achievement.title }}</h3>
              <p>{{ achievement.description }}</p>

              @if (!achievement.unlocked) {
                <div class="progress" role="progressbar"
                     [attr.aria-valuenow]="achievement.progress"
                     [attr.aria-valuemin]="0"
                     [attr.aria-valuemax]="achievement.target"
                     [attr.aria-label]="'Progresso: ' + achievement.progress + ' de ' + achievement.target">
                  <div class="progress-track">
                    <div class="progress-fill" [style.width.%]="(achievement.progress / achievement.target) * 100"></div>
                  </div>
                  <div class="progress-text">{{ achievement.progress }} / {{ achievement.target }}</div>
                </div>
              }
            </article>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .achievements {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .title h1 {
      margin: 0;
      font-size: clamp(1.6rem, 2.4vw, 2rem);
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .subtitle {
      margin-top: var(--spacing-xs);
      color: var(--muted);
      max-width: 60ch;
      line-height: 1.6;
    }

    .summary {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 999px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-xs);
    }

    .pill-icon {
      width: 18px;
      height: 18px;
      color: var(--brand-secondary);
    }

    .pill-strong {
      font-weight: 700;
      color: var(--text);
    }

    .pill-muted {
      font-size: 12px;
      color: var(--muted);
    }

    .streak {
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 153, 0, 0.24);
      background:
        radial-gradient(1200px 300px at 0% 0%, rgba(255, 153, 0, 0.22), transparent 55%),
        radial-gradient(900px 240px at 100% 0%, rgba(236, 114, 17, 0.18), transparent 55%),
        var(--surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-lg);
    }

    .streak-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .streak-badge {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(255, 153, 0, 0.14);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--brand-primary-600);
      border: 1px solid rgba(255, 153, 0, 0.22);
    }

    .streak-icon {
      width: 20px;
      height: 20px;
    }

    .streak-number {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .streak-label {
      margin-top: 4px;
      font-size: 13px;
      color: var(--muted);
    }

    .streak-message {
      margin: 0;
      color: var(--text-2);
    }

    .grid {
      display: grid;
      gap: var(--spacing-md);
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }

    .card {
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-strong);
    }

    @media (prefers-reduced-motion: reduce) {
      .card:hover {
        transform: none;
      }
    }

    .card.unlocked {
      border-color: rgba(22, 163, 74, 0.28);
      box-shadow: var(--shadow-sm);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(17, 24, 39, 0.04);
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--brand-secondary);
    }

    .card.unlocked .icon {
      background: rgba(22, 163, 74, 0.08);
      border-color: rgba(22, 163, 74, 0.18);
      color: var(--success);
    }

    .icon-svg {
      width: 20px;
      height: 20px;
    }

    h3 {
      margin: 0;
      color: var(--text);
      font-size: 16px;
      letter-spacing: -0.01em;
    }

    p {
      margin: var(--spacing-xs) 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.55;
    }

    .state {
      font-size: 12px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text-2);
      white-space: nowrap;
    }

    .state--unlocked {
      border-color: rgba(22, 163, 74, 0.22);
      background: rgba(22, 163, 74, 0.08);
      color: var(--success);
    }

    .state--locked {
      border-color: rgba(255, 153, 0, 0.20);
      background: rgba(255, 153, 0, 0.08);
      color: var(--brand-primary-600);
    }

    .progress {
      margin-top: var(--spacing-md);
    }

    .progress-track {
      width: 100%;
      height: 10px;
      background: rgba(17, 24, 39, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--brand-primary), var(--brand-primary-600));
      transition: width var(--transition-normal);
    }

    .progress-text {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    @media (max-width: 520px) {
      .streak {
        flex-direction: column;
        align-items: flex-start;
      }
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
      icon: 'target',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '2',
      title: 'Persistente',
      description: 'Complete 10 simulados',
      icon: 'strength',
      unlocked: true,
      progress: 10,
      target: 10
    },
    {
      id: '3',
      title: 'Estudioso',
      description: 'Complete 50 simulados',
      icon: 'book',
      unlocked: false,
      progress: 32,
      target: 50
    },
    {
      id: '4',
      title: 'Aprovado',
      description: 'Obtenha 70% ou mais em um simulado',
      icon: 'award',
      unlocked: true,
      progress: 1,
      target: 1
    },
    {
      id: '5',
      title: 'Perfeccionista',
      description: 'Obtenha 90% ou mais em um simulado',
      icon: 'trophy',
      unlocked: false,
      progress: 0,
      target: 1
    },
    {
      id: '6',
      title: 'Sequência de Fogo',
      description: 'Estude por 7 dias seguidos',
      icon: 'flame',
      unlocked: true,
      progress: 7,
      target: 7
    },
    {
      id: '7',
      title: 'Maratonista',
      description: 'Estude por 30 dias seguidos',
      icon: 'medal',
      unlocked: false,
      progress: 7,
      target: 30
    },
    {
      id: '8',
      title: 'Especialista AWS',
      description: 'Complete todos os exames AWS',
      icon: 'cloud',
      unlocked: false,
      progress: 2,
      target: 5
    },
    {
      id: '9',
      title: 'Multi-Cloud',
      description: 'Complete exames de AWS, Azure e GCP',
      icon: 'globe',
      unlocked: false,
      progress: 1,
      target: 3
    }
  ]);

  readonly icons = {
    level: Trophy,
    points: BarChart3,
    streak: Flame,
  };

  readonly iconsByAchievement = {
    target: Target,
    strength: Medal,
    book: BookOpen,
    award: Award,
    trophy: Trophy,
    flame: Flame,
    medal: Medal,
    cloud: Cloud,
    globe: Globe,
  } as const;

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

