import {Component, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';
import {Router} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {BreadcrumbsComponent} from '../../shared/components/breadcrumbs.component';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, SeoHeadDirective, NgOptimizedImage, BreadcrumbsComponent],
  template: `
    <div seoHead>
      <app-breadcrumbs [items]="[{label: 'Home', url: '/'},{label: 'Exames'}]" />

      <h1 class="page-title">Exames Disponíveis</h1>
      <div class="exams-container">
        @if (loading()) {
          <div class="skeleton-loader">
            <div class="skeleton-card" *ngFor="let i of [1,2,3]">
              <div class="skeleton-title"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
        }

        @if (error()) {
          <div class="error-state">
            <p>{{ error() }}</p>
          </div>
        }

        @if (!loading() && !error() && exams().length > 0) {
          <div class="exams-grid">
            @for (exam of exams(); track exam.id) {
              <div class="exam-card">
                <div class="exam-header">
                  <h3>{{ exam.title }}</h3>
                  @if (exam.difficulty) {
                    <span class="difficulty-badge" [class]="'difficulty-' + exam.difficulty.toLowerCase()">
                      {{ getDifficultyLabel(exam.difficulty) }}
                    </span>
                  }
                </div>

                @if (exam.slug) {
                  <img class="exam-icon" [ngSrc]="exam.slug + '.png'" [alt]="exam.title + ' ícone'" width="150"
                       height="150" priority/>
                }

                @if (exam.description) {
                  <p class="exam-description">{{ exam.description }}</p>
                }

                <!--                <div class="exam-meta">-->
                <!--                  @if (exam.totalQuestions) {-->
                <!--                    <div class="meta-item">-->
                <!--                      <span class="meta-icon">📝</span>-->
                <!--                      <span class="meta-text">{{ exam.totalQuestions }} questões</span>-->
                <!--                    </div>-->
                <!--                  }-->
                <!--                  @if (exam.durationMinutes) {-->
                <!--                    <div class="meta-item">-->
                <!--                      <span class="meta-icon">⏱️</span>-->
                <!--                      <span class="meta-text">{{ exam.durationMinutes }} min</span>-->
                <!--                    </div>-->
                <!--                  }-->
                <!--                </div>-->

                @if (exam.incoming) {
                  <a class="btn-primary disabled muted" aria-disabled="true" aria-label="Exame em breve">Em breve</a>
                } @else {
                  <a class="btn-primary" (click)="handleClick(exam)"
                     aria-label="Iniciar exame {{ exam.title }}">Iniciar</a>
                }
              </div>
            }
          </div>
        }

        @if (!loading() && !error() && exams().length === 0) {
          <div class="empty-state">
            <p>Nenhum exame disponível no momento.</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: [
    `
      .exam-icon {
        display: block;
        margin: 16px auto;
        max-width: 100%;
        height: auto;
      }
      .page-title {
        text-align: center;
        margin: 32px 0 24px 0;
        font-size: 2.2rem;
        font-weight: 700;
        color: var(--color-dark);
      }

      .skeleton-loader {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 24px;
        margin: 48px 0 32px 0;
        min-height: 220px;
      }

      .skeleton-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        width: 260px;
        padding: 24px 18px 18px 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 180px;
        animation: skeleton-pulse 1.2s infinite ease-in-out;
      }

      .skeleton-title {
        height: 22px;
        width: 70%;
        background: #ececec;
        border-radius: 4px;
      }

      .skeleton-line {
        height: 14px;
        width: 100%;
        background: #ececec;
        border-radius: 4px;
      }

      .skeleton-line.short {
        width: 60%;
      }

      .skeleton-btn {
        height: 32px;
        width: 90px;
        background: #e0e0e0;
        border-radius: 6px;
        margin-top: 12px;
      }

      @keyframes skeleton-pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 1;
        }
      }

      .muted {
      opacity: 0.6;
      cursor: not-allowed !important;
      background: #ccc;
    }

    .exams-container {
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

    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);
    }

    @media (min-width: 768px) {
      .exams-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    .exam-card {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      transition: var(--transition-fast);
    }

    .exam-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .exam-card:hover {
        transform: none;
      }
    }

    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    h3 {
      margin: 0;
      color: var(--color-dark);
      font-size: 18px;
      flex: 1;
    }

    @media (min-width: 768px) {
      h3 {
        font-size: 20px;
      }
    }

    .difficulty-badge {
      padding: 4px 12px;
      border-radius: var(--border-radius-lg);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .difficulty-easy {
      background: #d4edda;
      color: #155724;
    }

    .difficulty-medium {
      background: #fff3cd;
      color: #856404;
    }

    .difficulty-hard {
      background: #f8d7da;
      color: #721c24;
    }

    .exam-description {
      flex: 1;
      margin: 0;
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 14px;
    }

    .exam-meta {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .meta-icon {
      font-size: 16px;
    }

    .meta-text {
      color: var(--color-text-secondary);
      font-size: 13px;
      font-weight: 500;
    }

    .btn-primary {
      display: inline-block;
      padding: 10px 20px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      text-align: center;
      font-weight: 500;
      transition: var(--transition-fast);
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary:hover {
        transform: none;
      }
    }

    .empty-state {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xxl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    @media (min-width: 768px) {
      .empty-state {
        padding: 60px;
      }
    }

    .empty-state p {
      color: var(--color-text-light);
      font-size: 15px;
      margin: 0;
      font-style: italic;
    }

    @media (min-width: 768px) {
      .empty-state p {
        font-size: 16px;
      }
    }

    .loading-state, .error-state {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xxl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .loading-state p {
      color: var(--color-text-secondary);
      font-size: 15px;
      margin: 0;
    }

    .error-state {
      background: var(--color-bg-danger);
    }

    .error-state p {
      color: #721c24;
      font-size: 15px;
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class ExamsListComponent implements OnInit {
  exams = signal<ExamResponse[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(
    private examsApi: ExamsApiService,
    private router: Router,
    private seoFactory: SeoFactoryService,
    private seoFacade: SeoFacadeService,
  ) {
  }

  ngOnInit(): void {
    this.loadExams();

    const seo = this.seoFactory.website({
      title: 'Exames Disponíveis | SimulaCert',
      description: 'Simulados para certificações AWS, Azure, GCP e outras. Prepare-se com questões atualizadas e explicações detalhadas.',
      canonicalPath: '/exams',
      robots: 'index, follow',
      jsonLdId: 'exams-list',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Exames Disponíveis',
        description: 'Simulados para certificações AWS, Azure, GCP e outras.',
        url: this.seoFactory.canonicalFromPath('/exams'),
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: this.seoFactory.origin(),
        },
      },
    })

    this.seoFacade.set(seo);
  }

  loadExams(): void {
    this.loading.set(true);
    this.error.set('');

    this.examsApi.getAllExams().subscribe({
      next: (exams) => {
        this.exams.set([...exams, ...this.incomingExams()]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar exames. Por favor, tente novamente.');
        this.loading.set(false);
      }
    });
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'EASY': 'Fácil',
      'MEDIUM': 'Médio',
      'HARD': 'Difícil'
    };
    return labels[difficulty] || difficulty;
  }

  handleClick(exam: ExamResponse): void {
    const slug = exam.slug;
    if (slug && this.isTextualSlug(slug)) {
      this.router.navigate(['/exams', slug]);
    } else {
      this.router.navigate(['/exams', exam.id]);
    }
  }

  private isTextualSlug(slug: string): boolean {
    if (!slug) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(slug);
  }

  private incomingExams(): ExamResponse[] {
    return [
      {
        id: '1f0ecad5-1bcb-63e8-8ec7-4b60a5d7c8e8',
        title: 'AWS Certified Developer - Associate (DVA-C02)',
        description: 'Exame prático com questões alinhadas ao conteúdo e ao nível de dificuldade da certificação AWS Certified Developer – Associate, voltado para treino e revisão.',
        difficulty: 'MEDIUM',
        totalQuestions: 235,
        incoming: true,
        slug: 'aws-certified-developer-dva-c02'
      },
      {
        id: '2a1bdc34-2d4f-4c3b-9f7e-5b1e6d9f7c9f',
        title: 'Microsoft Certified Azure Fundamentals (AZ-900)',
        description: 'Exame prático para avaliar conhecimentos nos conceitos fundamentais do Microsoft Azure, conforme os tópicos cobrados na certificação.',
        difficulty: 'EASY',
        totalQuestions: 174,
        incoming: true,
        slug: 'azure-certified-fundamentals-az-900'
      }
    ];
  }
}
