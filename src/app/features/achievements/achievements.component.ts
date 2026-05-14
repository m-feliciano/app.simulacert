import {Component, OnInit, signal} from '@angular/core';
import {forkJoin} from 'rxjs';
import {CommonModule} from '@angular/common';
import {AuthFacade} from '../../core/auth/auth.facade';
import {StatsApiService} from '../../api/stats.service';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {
  Award,
  BarChart3,
  BookOpen,
  Cloud,
  Crown,
  Flame,
  Globe,
  LucideAngularModule,
  Medal,
  Target,
  MessageCircle,
  Search,
  CheckSquare,
  ThumbsUp,
  Users,
  Trophy,
} from 'lucide-angular';
import {ReviewsApiService} from '../../api/reviews.service';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'target' | 'strength' | 'book' | 'award' | 'trophy' | 'flame' | 'medal' | 'cloud' | 'globe' | 'crown' | 'message-circle' | 'search' | 'check-square' | 'thumbs-up' | 'users';
  unlocked?: boolean;
  progress?: number;
  target: number;
}

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SeoHeadDirective],
  template: `
    <div seoHead>
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

        @if (loading()) {
          <div class="sc-card achievements-loading">Carregando conquistas...</div>
        } @else {
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
                      <div class="progress-fill"
                           [style.width.%]="((achievement!.progress || 0) / achievement.target) * 100"></div>
                    </div>
                    <div class="progress-text">{{ achievement.progress }} / {{ achievement.target }}</div>
                  </div>
                }
              </article>
            }
          </section>
        }
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
      margin-top: 5px;
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

    .achievements-loading {
      text-align: center;
      color: var(--muted);
      padding: 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      height: 200px;
      align-content: center;
    }
  `]
})
export class AchievementsComponent implements OnInit {
  private readonly _pointsPerAchievement = 50;

  level = signal(0);
  totalPoints = signal(0);
  streakDays = signal(0);
  loading = signal(true);
  achievements = signal<Achievement[]>([
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro simulado',
      icon: 'target',
      progress: 0,
      target: 1
    },
    {
      id: '2',
      title: 'Persistente',
      description: 'Complete 10 simulados',
      icon: 'strength',
      progress: 0,
      target: 10
    },
    {
      id: '3',
      title: 'Estudioso',
      description: 'Complete 50 simulados',
      icon: 'book',
      progress: 0,
      target: 50
    },
    {
      id: '4',
      title: 'Aprovado',
      description: 'Obtenha 70% ou mais em um simulado',
      icon: 'award',
      progress: 0,
      target: 1
    },
    {
      id: '5',
      title: 'Perfeccionista',
      description: 'Obtenha 90% ou mais em um simulado',
      icon: 'trophy',
      progress: 0,
      target: 1
    },
    {
      id: '6',
      title: 'Sequência de Fogo',
      description: 'Estude por 7 dias seguidos',
      icon: 'flame',
      progress: 0,
      target: 7
    },
    {
      id: '7',
      title: 'Maratonista',
      description: 'Estude por 30 dias seguidos',
      icon: 'medal',
      progress: 0,
      target: 30
    },
    {
      id: '8',
      title: 'Especialista AWS',
      description: 'Complete todos os exames AWS',
      icon: 'cloud',
      progress: 0,
      target: 4
    },
    {
      id: '9',
      title: 'Multi-Cloud',
      description: 'Complete exames de AWS, Azure e GCP',
      icon: 'globe',
      progress: 0,
      target: 3
    },
    {
      id: '10',
      title: 'Veterano',
      description: 'Complete 100 simulados',
      icon: 'crown',
      progress: 0,
      target: 100
    },
    {
      id: '11',
      title: 'Primeira Impressão',
      description: 'Envie seu primeiro feedback útil sobre um simulado',
      icon: 'message-circle',
      progress: 0,
      target: 1
    },
    {
      id: '12',
      title: 'Analista',
      description: 'Envie 10 feedbacks relevantes sobre simulados',
      icon: 'search',
      progress: 0,
      target: 10
    },
    {
      id: '13',
      title: 'Revisor Técnico',
      description: 'Envie 25 feedbacks detalhados e consistentes',
      icon: 'check-square',
      progress: 0,
      target: 25
    },
    {
      id: '14',
      title: 'Especialista em Qualidade',
      description: 'Tenha 10 feedbacks marcados como úteis por outros usuários',
      icon: 'thumbs-up',
      progress: 0,
      target: 10
    },
    {
      id: '15',
      title: 'Influenciador de Conteúdo',
      description: 'Tenha 25 feedbacks aprovados pela comunidade',
      icon: 'users',
      progress: 0,
      target: 25
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
    crown: Crown,
    cloud: Cloud,
    globe: Globe,
    'message-circle': MessageCircle,
    search: Search,
    'check-square': CheckSquare,
    'thumbs-up': ThumbsUp,
    users: Users,
  } as const;


  constructor(
    private readonly authFacade: AuthFacade,
    private readonly statsApi: StatsApiService,
    private readonly reviewsService: ReviewsApiService,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
  ) {
    const seo = this.seoFactory.website({
      title: 'Conquistas | SimulaCert',
      description: 'Acompanhe suas conquistas e marcos de estudo na SimulaCert.',
      canonicalPath: '/achievements',
      robots: 'index, follow',
      jsonLdId: 'achievements',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Conquistas',
        description: 'Acompanhe suas conquistas e marcos de estudo na SimulaCert.',
        url: this.seoFactory.canonicalFromPath('/achievements'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: this.seoFactory.origin(),
        },
      }
    });

    this.seoFacade.set(seo);
  }

  ngOnInit(): void {
    const user = this.authFacade.currentUser();
    const userId = user?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.loadData(userId);
  }

  private loadData(userId: string) {
    forkJoin({
      stats: this.statsApi.getUserStatistics(userId),
      history: this.statsApi.getAttemptHistory(userId),
      domains: this.statsApi.getPerformanceByDomain(userId),
      feedbacks: this.reviewsService.getReviesSummary(userId)
    }).subscribe({
      next: ({stats, history, domains, feedbacks}) => {
        const streak = this.calculateStreak(history || []);
        this.streakDays.set(streak);

        const awsProviders = new Set<string>();
        domains?.forEach(d => {
          const name = d.awsDomain?.toLowerCase();
          if (!name) return;

          if (name.includes('aws'))
            awsProviders.add('aws');

          if (name.includes('azure'))
            awsProviders.add('azure');

          if (name.includes('gcp') || name.includes('google'))
            awsProviders.add('gcp');
        });

        const completed = stats.completedAttempts ?? 0;
        const bestScore = stats.bestScore ?? 0;

        const updated = this.achievements().map(a => {
          const copy = {...a} as Achievement;
          switch (copy.id) {
            case '1':
              copy.progress = Math.min(completed, copy.target);
              copy.unlocked = completed >= 1;
              break;
            case '2':
              copy.progress = Math.min(completed, copy.target);
              copy.unlocked = completed >= 10;
              break;
            case '3':
              copy.progress = Math.min(completed, copy.target);
              copy.unlocked = completed >= 50;
              break;
            case '4':
              copy.progress = bestScore >= 70 ? copy.target : 0;
              copy.unlocked = bestScore >= 70;
              break;
            case '5':
              copy.progress = bestScore >= 90 ? copy.target : 0;
              copy.unlocked = bestScore >= 90;
              break;
            case '6':
              copy.progress = Math.min(streak, copy.target);
              copy.unlocked = streak >= 7;
              break;
            case '7':
              copy.progress = Math.min(streak, copy.target);
              copy.unlocked = streak >= 30;
              break;
            case '8':
              copy.progress = Math.min(domains?.length || 0, copy.target);
              copy.unlocked = (domains?.length || 0) >= copy.target;
              break;
            case '9':
              copy.progress = Math.min(awsProviders.size, copy.target);
              copy.unlocked = awsProviders.size >= copy.target;
              break;
            case '10':
              copy.progress = Math.min(completed, copy.target);
              copy.unlocked = completed >= 100;
              break;
            case '11':
              copy.progress = Math.min((feedbacks?.submitted ?? 0), copy.target);
              copy.unlocked = (feedbacks?.submitted ?? 0) >= copy.target;
              break;
            case '12':
              copy.progress = Math.min((feedbacks?.submitted ?? 0), copy.target);
              copy.unlocked = (feedbacks?.submitted ?? 0) >= copy.target;
              break;
            case '13':
              copy.progress = Math.min((feedbacks?.detailed ?? 0), copy.target);
              copy.unlocked = (feedbacks?.detailed ?? 0) >= copy.target;
              break;
            case '14':
              copy.progress = Math.min((feedbacks?.useful ?? 0), copy.target);
              copy.unlocked = (feedbacks?.useful ?? 0) >= copy.target;
              break;
            case '15':
              copy.progress = Math.min((feedbacks?.approved ?? 0), copy.target);
              copy.unlocked = (feedbacks?.approved ?? 0) >= copy.target;
              break;
          }
          return copy;
        });

        this.achievements.set(updated);

        const unlockedCount = updated.filter(a => a.unlocked).length;

        const levelBase = Math.floor((stats.completedAttempts ?? 0) / 10);
        const levelBonus = Math.floor(unlockedCount / 5);
        this.level.set(Math.max(1, levelBase + levelBonus + 1));

        const basePoints = (stats.completedAttempts ?? 0) * (stats.averageScore ?? 0);
        this.totalPoints.set(Math.floor(basePoints + (unlockedCount * this._pointsPerAchievement)));

        this.seoFacade.set(this.buildSeoMeta(updated));

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private buildSeoMeta(updated: { unlocked?: boolean }[]) {
    const unlockedCount = updated.filter(a => a.unlocked).length;
    return this.seoFactory.website({
      title: `Conquistas (${unlockedCount}) | SimulaCert`,
      description: `Você desbloqueou ${unlockedCount} de ${updated.length} conquistas na SimulaCert. Acompanhe seu progresso e desbloqueie novos marcos.`,
      canonicalPath: '/achievements',
      robots: 'index, follow',
      jsonLdId: 'achievements',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Conquistas (${unlockedCount})`,
        description: `Você desbloqueou ${unlockedCount} de ${updated.length} conquistas na SimulaCert.`,
        url: this.seoFactory.canonicalFromPath('/achievements'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: this.seoFactory.origin(),
        },
      }
    });
  }

  private calculateStreak(history: { finishedAt?: string }[]): number {
    if (!history?.length) return 0;

    const daySet = new Set<string>();
    history.forEach(h => {
      if (!h.finishedAt) return;

      const d = new Date(h.finishedAt);
      if (!Number.isNaN(d.getTime())) {
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        daySet.add(key);
      }
    });

    let streak = 0;
    let cur = new Date();

    while (true) {
      const key = cur.toISOString().slice(0, 10);
      if (daySet.has(key)) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

