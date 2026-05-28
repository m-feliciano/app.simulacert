import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';
import {RouterLink} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {BreadcrumbsComponent} from '../../shared/components/breadcrumbs.component';
import {TranslatePipe} from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, SeoHeadDirective, NgOptimizedImage, BreadcrumbsComponent, TranslatePipe, RouterLink],
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

                <div class="exam-card" [class.incoming]="exam.incoming">

                  <div class="exam-card-content">
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
                  </div>

                  @if (exam.incoming) {
                    <a class="btn-primary disabled muted"
                       aria-disabled="true"
                       [attr.aria-label]="'exams.list.comingSoon' | translate">
                      {{ 'exams.list.comingSoon' | translate }}
                    </a>

                  } @else {
                    <a class="btn-primary"
                       [routerLink]="['/exams', exam.slug]"
                       [attr.aria-label]="('exams.list.start' | translate) + ' ' + exam.title">
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

      .exam-card-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        flex: 1;
      }

      .exam-card.incoming {
        border: 1px dashed rgba(17, 24, 39, 0.16);
      }

      .exam-card.incoming .exam-header {
        opacity: 0.92;
      }

      .exam-card.incoming .exam-icon,
      .exam-card.incoming .exam-description {
        filter: blur(1.6px);
        opacity: 0.82;
        transition: filter 140ms ease, opacity 140ms ease;
      }

      .exam-card.incoming:hover .exam-icon,
      .exam-card.incoming:hover .exam-description {
        filter: blur(1px);
        opacity: 0.9;
      }

      .exam-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }

      @media (prefers-reduced-motion: reduce) {
        .exam-card:hover {
          transform: none;
        }

        .exam-card.incoming .exam-icon,
        .exam-card.incoming .exam-description,
        .exam-card.incoming:hover .exam-icon,
        .exam-card.incoming:hover .exam-description {
          transition: none;
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
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
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
    this.examsApi.getAll().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('loading-error');
        this.loading.set(false);
      }
    });
  }
}
