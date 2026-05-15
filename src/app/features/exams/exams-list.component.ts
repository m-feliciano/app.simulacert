import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';
import {Router} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {BreadcrumbsComponent} from '../../shared/components/breadcrumbs.component';
import {I18nService} from '../../core/i18n/i18n.service';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, SeoHeadDirective, NgOptimizedImage, BreadcrumbsComponent, TranslatePipe],
  template: `
    <div seoHead>
      <app-breadcrumbs [items]="[{ label: 'Home', url: '/' }, { label: 'exams.list.breadcrumbs' | translate }]"/>

      <div class="exams-container">
        @if (loading()) {
          <div class="skeleton-loader">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="skeleton-card">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-btn"></div>
              </div>
            }
          </div>

        } @else if (error()) {
          <div class="error-state">
            <p>{{ 'exams.list.error' | translate }}</p>
          </div>

        } @else if (exams().length > 0) {

          <div class="page-shell" [class.visible]="ready()">
            <h1 class="page-title">
              {{ 'exams.list.title' | translate }}
            </h1>

            <div class="exams-grid">
              @for (exam of exams(); track exam.id) {

                <div class="exam-card">

                  <div class="exam-header">
                    <h3>{{ exam.title }}</h3>

                    @if (exam.difficulty) {
                      <span
                        class="difficulty-badge"
                        [class]="'difficulty-' + exam.difficulty.toLowerCase()">
                        {{ ('exams.list.difficulty.' + exam.difficulty) | translate }}
                      </span>
                    }
                  </div>

                  @if (exam.slug) {
                    <img
                      class="exam-icon"
                      [ngSrc]="exam.slug + '.png'"
                      [alt]="exam.title + ' ícone'"
                      width="120"
                      height="120"
                      [priority]="$index < 1"
                    />
                  }

                  @if (exam.description) {
                    <p class="exam-description">
                      {{ exam.description }}
                    </p>
                  }

                  @if (exam.incoming) {
                    <a class="btn-primary disabled muted"
                       aria-disabled="true"
                       [attr.aria-label]="'exams.list.comingSoon' | translate">
                      {{ 'exams.list.comingSoon' | translate }}
                    </a>

                  } @else {
                    <a class="btn-primary"
                       (click)="handleClick(exam)"
                       [attr.aria-label]="i18nService.instant('exams.list.start') + ' ' + exam.title">
                      {{ 'exams.list.start' | translate }}
                    </a>
                  }
                </div>
              }
            </div>
          </div>

        } @else {
          <div class="empty-state">
            <p>{{ 'exams.list.empty' | translate }}</p>
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
        width: 120px;
        height: 120px;
        object-fit: contain;
      }

      .page-title {
        text-align: center;
        margin: 32px 0 24px 0;
        font-size: 2.2rem;
        font-weight: 700;
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
        background: var(--color-bg-secondary);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        width: 300px;
        padding: 24px 18px 18px 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 380px;
        animation: skeleton-pulse 1.2s infinite ease-in-out;
      }

      .skeleton-title {
        height: 22px;
        width: 70%;
        background: var(--color-bg-secondary);
        border-radius: 4px;
      }

      .skeleton-line {
        height: 14px;
        width: 100%;
        background: var(--color-bg-secondary);
        border-radius: 4px;
      }

      .skeleton-line.short {
        width: 60%;
      }

      .skeleton-btn {
        height: 32px;
        width: 90px;
        background: var(--color-bg-secondary);
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
        color: var(--text);
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

      .page-shell {
        opacity: 0;
        transition: opacity 120ms ease;
      }

      .page-shell.visible {
        opacity: 1;
      }
    `]
})
export class ExamsListComponent implements OnInit, AfterViewInit {
  exams = signal<ExamResponse[]>([]);
  loading = signal(true);
  error = signal('');
  ready = signal(false);

  constructor(
    private readonly examsApi: ExamsApiService,
    private readonly router: Router,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
    readonly i18nService: I18nService,
    @Inject(PLATFORM_ID) public readonly platformId: string
  ) {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        this.ready.set(true);
      });
    }
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
    this.examsApi.getAllExams().subscribe({
      next: (exams) => {
        this.exams.set([...exams, ...this.incomingExams()]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('loading-error');
        this.loading.set(false);
      }
    });
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
        id: '4d3f6a89-4b2c-5e7d-9f8a-7c9d0e1f2a3b',
        title: 'AWS Certified AI Practitioner',
        description: 'Exame prático focado em inteligência artificial e machine learning na AWS, com questões alinhadas ao conteúdo da certificação AWS Certified AI Practitioner, ideal para quem busca se aprofundar nessa área.',
        difficulty: 'EASY',
        totalQuestions: 150,
        incoming: true,
        slug: 'aws-certified-ai-practitioner'
      },
      {
        id: '2a1bdc34-2d4f-4c3b-9f7e-5b1e6d9f7c9f',
        title: 'Microsoft Certified Azure Fundamentals (AZ-900)',
        description: 'Exame prático para avaliar conhecimentos nos conceitos fundamentais do Microsoft Azure, conforme os tópicos cobrados na certificação.',
        difficulty: 'EASY',
        totalQuestions: 174,
        incoming: true,
        slug: 'azure-certified-fundamentals-az-900'
      },
      {
        id: '3c5e7a89-4b2c-5e7d-9f8a-7c9d0e1f2a3c',
        title: 'Microsoft Certified Azure AI Fundamentals (AI-900)',
        description: 'Exame prático para avaliar conhecimentos nos conceitos fundamentais de inteligência artificial e machine learning no Microsoft Azure, conforme os tópicos cobrados na certificação.',
        difficulty: 'EASY',
        totalQuestions: 120,
        incoming: true,
        slug: 'azure-certified-fundamentals-ai-900'
      }
    ];
  }
}
