import {Component, computed, OnInit, signal} from '@angular/core';
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
  CheckSquare,
  Cloud,
  Crown,
  Flame,
  Globe,
  LucideAngularModule,
  Medal,
  MessageCircle,
  Search,
  Target,
  ThumbsUp,
  Trophy,
  Users,
} from 'lucide-angular';
import {ReviewsApiService} from '../../api/reviews.service';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';
import {Achievement} from '../../api/domain/progress.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SeoHeadDirective, TranslatePipe],
  template: `
    <div seoHead>
      <div class="sc-container achievements">
        <header class="header">
          <div class="title">
            <h1>{{ 'achievements.title' | translate }}</h1>
            <p class="subtitle">{{ 'achievements.subtitle' | translate }}</p>
          </div>

          <div class="summary" role="group" [attr.aria-label]="'achievements.aria.summary' | translate">
            <div class="pill">
              <lucide-icon class="pill-icon" [img]="icons.level" aria-hidden="true"></lucide-icon>
              <span class="pill-strong">{{ 'achievements.level' | translate }}: {{ level() }}</span>
            </div>
            <div class="pill">
              <lucide-icon class="pill-icon" [img]="icons.points" aria-hidden="true"></lucide-icon>
              <span class="pill-strong">{{ totalPoints() }}</span>
              <span class="pill-muted">{{ 'achievements.points' | translate }}</span>
            </div>
          </div>
        </header>

        <section class="streak sc-card" [attr.aria-label]="'achievements.aria.streak' | translate">
          <div class="streak-left">
            <div class="streak-badge" aria-hidden="true">
              <lucide-icon [img]="icons.streak" class="streak-icon"></lucide-icon>
            </div>
            <div>
              <div class="streak-number">{{ streakDays() }}</div>
              <div class="streak-label">{{ 'achievements.streakDays' | translate }}</div>
            </div>
          </div>
          <div class="streak-right">
            <p class="streak-message">{{ 'achievements.streakMessage' | translate }}</p>
          </div>
        </section>

        @if (loading()) {
          <div class="sc-card achievements-loading">{{ 'achievements.loading' | translate }}</div>
        } @else {
          <details class="milestones-section collapsible"
                   [attr.aria-label]="'achievements.inProgress' | translate" open>
            <summary class="section-header section-header--summary">
              <h2 class="section-title">{{ 'achievements.inProgress' | translate }}</h2>
              <span class="section-count">{{ inProgressAchievements().length }}</span>
            </summary>

            <section class="grid" [attr.aria-label]="'achievements.aria.list' | translate">
              @for (achievement of inProgressAchievements(); track achievement.id) {
                @if (!(achievement.id == 'firstStep') && (achievement.progress || 0) === 0) {
                  <article class="card sc-card discovery"
                    [attr.aria-label]="('achievements.items.' + achievement.id + '.title') | translate">

                    <div class="discovery-icon" aria-hidden="true">
                      <lucide-icon class="discovery-icon-svg" [img]="iconsByAchievement[achievement.icon]"></lucide-icon>
                    </div>
                  </article>
                } @else {
                  <article class="card sc-card" [class.unlocked]="achievement.unlocked">
                    <div class="card-top">
                      <div class="icon" aria-hidden="true">
                        <lucide-icon class="icon-svg" [img]="iconsByAchievement[achievement.icon]"></lucide-icon>
                      </div>
                      <span class="state state--locked">{{ 'achievements.inProgress' | translate }}</span>
                    </div>

                    <h3>{{ ('achievements.items.' + achievement.id + '.title') | translate }}</h3>
                    <p>{{ ('achievements.items.' + achievement.id + '.description') | translate }}</p>

                    <div class="progress" role="progressbar"
                         [attr.aria-valuemin]="0"
                         [attr.aria-valuenow]="achievement.progress"
                         [attr.aria-valuemax]="achievement.target"
                         [attr.aria-label]="'achievements.progress' | translate">
                      <div class="progress-track">
                        <div class="progress-fill"
                             [style.width.%]="((achievement!.progress || 0) / achievement.target) * 100"></div>
                      </div>
                      <div class="progress-text">{{ achievement.progress }} / {{ achievement.target }}</div>
                    </div>
                  </article>
                }
              }
            </section>
          </details>

          <section class="milestones-section" [attr.aria-label]="'achievements.unlocked' | translate">
            <div class="section-header">
              <h2 class="section-title">{{ 'achievements.unlocked' | translate }}</h2>
              <span class="section-count">{{ unlockedAchievements().length }}</span>
            </div>

            <section class="grid" [attr.aria-label]="'achievements.aria.list' | translate">
              @for (achievement of unlockedAchievements(); track achievement.id) {
                <article class="card sc-card unlocked" [class.unlocked]="true">
                  <div class="card-top">
                    <div class="icon" aria-hidden="true">
                      <lucide-icon class="icon-svg" [img]="iconsByAchievement[achievement.icon]"></lucide-icon>
                    </div>
                    <span class="state state--unlocked">{{ 'achievements.unlocked' | translate }}</span>
                  </div>

                  <h3>{{ ('achievements.items.' + achievement.id + '.title') | translate }}</h3>
                  <p>{{ ('achievements.items.' + achievement.id + '.description') | translate }}</p>
                </article>
              }
            </section>
          </section>
        }
      </div>
    </div>
  `,
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements OnInit {
  private readonly _pointsPerAchievement = 50;

  level = signal(0);
  totalPoints = signal(0);
  streakDays = signal(0);
  loading = signal(true);

  protected readonly achievements = signal<Achievement[]>([
    {
      id: 'firstStep',
      icon: 'target',
      progress: 0,
      target: 1
    },
    {
      id: 'persistent',
      icon: 'strength',
      progress: 0,
      target: 10
    },
    {
      id: 'studious',
      icon: 'book',
      progress: 0,
      target: 50
    },
    {
      id: 'approved',
      icon: 'award',
      progress: 0,
      target: 1
    },
    {
      id: 'perfectionist',
      icon: 'trophy',
      progress: 0,
      target: 1
    },
    {
      id: 'fireStreak',
      icon: 'flame',
      progress: 0,
      target: 7
    },
    {
      id: 'marathoner',
      icon: 'medal',
      progress: 0,
      target: 30
    },
    {
      id: 'awsSpecialist',
      icon: 'cloud',
      progress: 0,
      target: 4
    },
    {
      id: 'cloudMaster',
      icon: 'globe',
      progress: 0,
      target: 3
    },
    {
      id: 'helpfulCommunity',
      icon: 'message-circle',
      progress: 0,
      target: 5
    },
    {
      id: 'questionSearch',
      icon: 'search',
      progress: 0,
      target: 100
    },
    {
      id: 'feedback100',
      icon: 'check-square',
      progress: 0,
      target: 100
    },
    {
      id: 'amazonRecommender',
      icon: 'thumbs-up',
      progress: 0,
      target: 100
    },
    {
      id: 'feedbackLeader',
      icon: 'users',
      progress: 0,
      target: 10
    },
    {
      id: 'contentInfluencer',
      icon: 'crown',
      progress: 0,
      target: 25
    }
  ]);

  protected readonly unlockedAchievements = computed(() => this.achievements().filter((a) => !!a.unlocked));
  protected readonly inProgressAchievements = computed(() => this.achievements().filter((a) => !a.unlocked));

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
    if (!user?.id) {
      this.loading.set(false);
      return;
    }
    this.loadData(user.id);
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
          const achievement = {...a} as Achievement;

          switch (achievement.id) {
            case 'firstStep':
              achievement.progress = Math.min(completed, achievement.target);
              achievement.unlocked = completed >= achievement.target
              break;
            case 'persistent':
            case 'studious':
              achievement.progress = Math.min(completed, achievement.target);
              achievement.unlocked = completed >= achievement.target;
              break;
            case 'approved':
              achievement.progress = bestScore >= 70 ? achievement.target : 0;
              achievement.unlocked = bestScore >= achievement.target;
              break;
            case 'perfectionist':
              achievement.progress = bestScore >= 90 ? achievement.target : 0;
              achievement.unlocked = bestScore >= achievement.target;
              break;
            case 'fireStreak':
            case 'marathoner':
              achievement.progress = Math.min(streak, achievement.target);
              achievement.unlocked = streak >= achievement.target;
              break;
            case 'awsSpecialist':
              achievement.progress = Math.min(domains?.length || 0, achievement.target);
              achievement.unlocked = (domains?.length || 0) >= achievement.target;
              break;
            case 'cloudMaster':
              achievement.progress = Math.min(awsProviders.size, achievement.target);
              achievement.unlocked = awsProviders.size >= achievement.target;
              break;
            case 'questionSearch': {
              const totalQuestionsCovered = domains?.reduce((sum, d) => sum + (d.totalQuestions ?? 0), 0) || 0;
              achievement.progress = Math.min(totalQuestionsCovered, achievement.target);
              achievement.unlocked = totalQuestionsCovered >= achievement.target;
              break;
            }
            case 'feedback100':
              achievement.progress = Math.min((feedbacks?.submitted ?? 0), achievement.target);
              achievement.unlocked = (feedbacks?.submitted ?? 0) >= achievement.target;
              break;
            case 'amazonRecommender':
              achievement.progress = Math.min((feedbacks?.useful ?? 0), achievement.target);
              achievement.unlocked = (feedbacks?.useful ?? 0) >= achievement.target;
              break;
            case 'feedbackLeader':
            case 'helpfulCommunity':
            case 'contentInfluencer':
              achievement.progress = Math.min((feedbacks?.approved ?? 0), achievement.target);
              achievement.unlocked = (feedbacks?.approved ?? 0) >= achievement.target;
              break;
          }

          return achievement;
        });

        const achievements = updated.sort(({unlocked: a}, {unlocked: b}) => {
          if (a && !b) return -1;
          if (!a && b) return 1;
          return 0;
        });

        this.achievements.set(achievements);

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
      description: `Você desbloqueou ${unlockedCount} de ${updated.length} conquistas na SimulaCert. Acompanhe seu progresso e desbloqueie novas.`,
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

