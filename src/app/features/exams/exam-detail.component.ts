import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptsApiService} from '../../api/attempts.service';
import {AuthFacade} from '../../core/auth/auth.facade';
import {ExamResponse} from '../../api/domain';
import {RegisterPromptModalComponent} from '../../shared/components/register-prompt-modal.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {BreadcrumbsComponent} from '../../shared/components/breadcrumbs.component';
import {SeoRichTemplateComponent} from '../../shared/components/seo-rich-template.component';
import {RelatedExamsComponent} from './related-exams.component';
import {getExamSeoContent} from './exam-seo-content.registry';
import {AttemptDifficulty, AttemptSetup, DEFAULT_ATTEMPT_SETUP} from './exam-attempt-setup.model';
import {ExamAttemptSetupPreferencesService} from './exam-attempt-setup-preferences.service';
import {BookOpen, Clock, LucideAngularModule, Play, Settings2} from 'lucide-angular';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule, RegisterPromptModalComponent, SeoHeadDirective, BreadcrumbsComponent, SeoRichTemplateComponent, RelatedExamsComponent, LucideAngularModule, NgOptimizedImage, FormsModule],
  template: `
    <div seoHead>
      @if (showRegisterPrompt()) {
        <app-register-prompt-modal (register)="goToRegister()"
                                   (anonymous)="createAnonymousAndStart()"
                                   (close)="showRegisterPrompt.set(false)"
                                   [loading]="loadingAnonymous()">
        </app-register-prompt-modal>
      }

      <div class="exam-detail sc-page">
        <div class="sc-container">
          <app-breadcrumbs [items]="breadcrumbs()"/>

          <div class="breadcrumb" style="display:none">
            <a (click)="goBack()" class="back-link" aria-label="Voltar para lista de exames">← Voltar</a>
          </div>

          @if (loadingExam()) {
            <div class="loading-state sc-card">
              <p>Carregando detalhes do exame...</p>
            </div>
          }

          @if (!loadingExam() && exam()) {
            <section class="exam-header sc-card sc-card--padded">
              <div class="exam-header-content">
                <div class="exam-header-logo">
                  <img class="exam-icon"
                       [ngSrc]="exam()?.slug + '.png'"
                       [alt]="exam()?.title + ' ícone'"
                       width="150" height="150"
                       priority/>
                </div>

                <div class="exam-header-text">
                  <h1>{{ exam()!.title }}</h1>
                  <p class="exam-description">{{ exam()!.description }}</p>
                </div>
              </div>
            </section>

            <section class="mode-selection">
              <h2>Modo de estudo</h2>
              <div class="mode-cards">

                <div type="button"
                     class="mode-card"
                     (click)="selectMode('practice')"
                     [class.selected]="selectedMode() === 'practice'"
                     aria-label="Modo prática">
                  <div class="mode-icon" aria-hidden="true">
                    <lucide-icon [img]="icons.practice" class="mode-icon-svg"></lucide-icon>
                  </div>
                  <div>
                    <h3>Modo Prática</h3>
                    <p class="mode-caption">Em breve</p>
                    <ul class="mode-features">
                      <li>Veja explicações durante o simulado</li>
                      <li>Sem limite de tempo</li>
                      <li>Ideal para aprender</li>
                    </ul>
                  </div>
                </div>

                <div type="button"
                     class="mode-card"
                     [class.selected]="selectedMode() === 'exam'"
                     (click)="selectMode('exam')"
                     aria-label="Selecionar modo exame">
                  <div class="mode-icon" aria-hidden="true">
                    <lucide-icon [img]="icons.exam" class="mode-icon-svg"></lucide-icon>
                  </div>
                  <div>
                    <h3>Modo Exame</h3>
                    <p class="mode-caption">Simulação fiel, resultado ao final</p>
                    <ul class="mode-features">
                      <li>Simula o exame real</li>
                      <li>Tempo cronometrado</li>
                      <li>Sem explicações durante</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <div class="exam-info">
              <div class="info-card sc-card sc-card--padded">
                <h3>Informações do Exame</h3>
                <ul>
                  <li><strong>Tipo:</strong> Simulado AWS</li>
                  <li><strong>Duração:</strong> {{ setup().durationMinutes }} minutos</li>
                  <li><strong>Questões:</strong> {{ questionCount() }}</li>
                  <li><strong>Pontuação mínima:</strong> 72%</li>
                </ul>
              </div>

              <div class="info-card sc-card sc-card--padded">
                <h3>Regras</h3>
                <ul>
                  <li>Você terá {{ setup().durationMinutes }} minutos para completar o exame</li>
                  <li>São {{ questionCount() }} questões de múltipla escolha</li>
                  <li>Você pode pausar e retomar o exame a qualquer momento</li>
                  <li>Você pode revisar suas respostas antes de finalizar</li>
                </ul>
              </div>
            </div>

            <div class="question-selector sc-card sc-card--padded">
              <h3>Personalize seu simulado</h3>

              <div class="setup-row">
                <div class="setup-field">
                  <label class="setup-label">Quantidade de questões</label>
                  <div class="question-options">

                    @if (isCustomQuestionCountSelected()) {
                      <div style="margin-top: 5px">Personalizado</div>

                  } @else {
                    <select class="setup-select"
                            [value]="questionCount()"
                            (change)="selectQuestionCount($any($event.target).value)">

                        @for (count of questionCountOptions; track count) {
                          <option [value]="count" [selected]="questionCount() === count">{{ count }} questões</option>
                        }

                        <option value="custom" selected>Personalizado</option>
                      </select>
                    }

                    @if (isCustomQuestionCountSelected()) {
                      <input
                        type="number"
                        min="10"
                        max="100"
                        step="5"
                        class="setup-input"
                        [value]="customQuestionCount()"
                        (blur)="$any($event.target).value < 10 ? setCustomQuestionCount( 10) : void 0"
                        (input)="setCustomQuestionCount($any($event.target).value)"
                        aria-label="Quantidade de questões personalizada"/>
                    }
                  </div>
                </div>

                <div class="setup-field">
                  <label class="setup-label" for="durationMinutes">Tempo (minutos)</label>
                  <input
                    id="durationMinutes"
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    [value]="setup().durationMinutes"
                    (input)="setDurationMinutes(($any($event.target).value))"
                    class="setup-input"/>
                  <!--                <div class="setup-hint">Sugestão: {{ recommendedMinutes() }} min para {{ questionCount() }} questões</div>-->
                </div>

                <div class="setup-field">
                  <label class="setup-label" for="difficulty">Dificuldade</label>
                  <select id="difficulty" class="setup-select"
                          [value]="setup().difficulty"
                          (change)="setDifficulty($any($event.target).value)">
                    <option value="any">Todas</option>
                    <option value="easy">Fácil</option>
                    <option value="medium">Média</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>

              <div class="setup-actions">
                <button type="button" class="sc-btn sc-btn--ghost" (click)="applyRecommendedTime()">
                  Usar tempo recomendado
                </button>
                <button type="button" class="sc-btn sc-btn--ghost" (click)="resetSetup()">
                  Resetar
                </button>
              </div>
            </div>

            <div class="actions">
              <button class="sc-btn sc-btn--primary" (click)="startExam()" [disabled]="loading()"
                      aria-label="Iniciar simulado">
                <lucide-icon [img]="icons.play" class="sc-icon" aria-hidden="true"></lucide-icon>
                {{ loading() ? 'Iniciando...' : 'Iniciar com ' + questionCount() + ' questões' }}
              </button>
            </div>
            <div class="actions">
              <button class="sc-btn sc-btn--ghost" disabled type="button" aria-label="Imprimir simulado (em breve)">
                Imprimir (em breve)
              </button>
            </div>
          }

          @if (errorMessage()) {
            <div class="error sc-card">{{ errorMessage() }}</div>
          }

          @if (!loadingExam() && exam()) {
            <app-seo-rich-template [exam]="exam()!"/>
            <app-related-exams [currentExam]="exam()!"/>
          }

        </div>
      </div>
    </div>
  `,
  styleUrls: ['./exam-detail.component.css']
})
export class ExamDetailComponent implements OnInit {

  readonly icons = {
    practice: BookOpen,
    exam: Clock,
    play: Play,
    settings: Settings2,
  };

  questionCountOptions = [10, 20, 30, 40, 50, 65];
  private readonly lastSelectedQuestionCountOption = signal<number | 'custom'>(20);

  customQuestionCount = signal<number>(20);
  exam = signal<ExamResponse | null>(null);
  loading = signal(false);
  loadingExam = signal(false);
  errorMessage = signal('');
  loadingAnonymous = signal(false);
  showRegisterPrompt = signal(false);
  setup = signal<AttemptSetup>(DEFAULT_ATTEMPT_SETUP);
  selectedMode = signal<'practice' | 'exam'>('exam');

  questionCount = computed(() => this.setup().questionCount);
  recommendedMinutes = computed(() => Math.round(this.questionCount() * 1.5));
  breadcrumbs = computed(() => {
    const exam = this.exam();
    return [
      {label: 'Home', url: '/'},
      {label: 'Exames', url: '/exams'},
      {label: exam?.title || 'Simulado'},
    ];
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly examsApi: ExamsApiService,
    private readonly attemptsApi: AttemptsApiService,
    private readonly authFacade: AuthFacade,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
    private readonly setupPrefs: ExamAttemptSetupPreferencesService,
  ) {
  }

  get seo() {
    const exam = this.exam();
    const title = exam ? `${exam.title} | SimulaCert` : 'Simulado | SimulaCert';
    const description = exam?.description || 'Simulado de certificação.';
    const canonicalUrl = exam?.slug ? this.seoFactory.canonicalFromPath(`/exams/${exam.slug}`) : '';
    const origin = this.seoFactory.origin();
    const image = exam?.slug ? `${origin}/${exam.slug}.png` : `${origin}/simulacert-logo.svg`;

     const content = getExamSeoContent(exam);
     const faqJsonLd = exam?.slug
       ? {
         '@context': 'https://schema.org',
         '@type': 'FAQPage',
         mainEntity: content.faq.map((f) => ({
           '@type': 'Question',
           name: f.question,
           acceptedAnswer: {
             '@type': 'Answer',
             text: f.answer,
           },
         })),
       }
       : null;

    const jsonLd = exam?.slug
      ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {'@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/`},
            {'@type': 'ListItem', position: 2, name: 'Exames', item: `${origin}/exams`},
            {'@type': 'ListItem', position: 3, name: exam.title, item: canonicalUrl},
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: exam.title,
          description,
          url: canonicalUrl,
          isPartOf: {'@type': 'WebSite', name: 'SimulaCert', url: origin},
        },
        ...(faqJsonLd ? [faqJsonLd] : []),
      ]
      : null;

    return this.seoFactory.build({
      title,
      description,
      robots: exam?.slug ? 'index, follow' : 'noindex, follow',
      canonicalUrl,
      openGraph: exam?.slug
        ? {
          type: 'article',
          url: canonicalUrl,
          image,
        }
        : undefined,
      twitter: exam?.slug
        ? {
          card: 'summary_large_image',
          image,
        }
        : undefined,
      jsonLd,
      jsonLdId: 'exam-detail',
    });
  }

  ngOnInit(): void {
    const resolvedExam = this.route.snapshot.data['exam'] as ExamResponse | undefined;
    const slug = this.route.snapshot.paramMap.get('slug');

    if (resolvedExam) {
      this.exam.set(resolvedExam);
      this.restoreSetupForExam(resolvedExam.id);
      this.seoFacade.set(this.seo);
      return;

    } else {
      const meta = this.seoFactory.website({
        title: 'Simulado não encontrado | SimulaCert',
        description: 'O simulado solicitado não foi encontrado. Veja a lista de exames disponíveis.',
        canonicalPath: '/exams',
        robots: 'noindex, follow',
        jsonLdId: 'exam-not-found'
      });

      this.seoFacade.set(meta);
    }

    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(examId, true);
    } else if (slug) {
      this.loadExamBySlug(slug);
    }
  }

  loadExam(examId: string, redirectToSlug = false): void {
    this.loadingExam.set(true);
    this.errorMessage.set('');

    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        if (redirectToSlug && exam.slug && this.isTextualSlug(exam.slug)) {
          this.router.navigate(['/exams', exam.slug]);
        } else {
          this.exam.set(exam);
          this.restoreSetupForExam(exam.id);
          this.applySeo();
          this.loadingExam.set(false);
        }
      },
      error: () => {
        this.errorMessage.set('Erro ao carregar exame');
        this.loadingExam.set(false);
      }
    });
  }

  startExam(): void {
    const currentExam = this.exam();
    if (!currentExam) return;

    if (!this.authFacade.currentUser()) {
      this.showRegisterPrompt.set(true);
      return;
    }

    this.doStartAttempt(currentExam);
  }

  private doStartAttempt(exam: ExamResponse): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.setupPrefs.saveForExam(exam.id, this.setup());
    this.setupPrefs.saveGlobal(this.setup());

    const setup = this.setup();
    const limitSeconds = Math.min(setup.durationMinutes * 60, 3600 * 4);

    this.attemptsApi.startAttempt({
      examId: exam.id,
      userId: this.authFacade.currentUser()!.id,
      questionCount: setup.questionCount,
      limitSeconds,
      durationMinutes: setup.durationMinutes,
      difficulty: setup.difficulty,
      mode: this.selectedMode(),
    }).subscribe({
      next: (response) => {
        const location = response.headers.get('Location') || response.headers.get('location');
        const attemptId = location ? location?.split('/').pop() : null;

        if (!attemptId) {
          this.loading.set(false);
          this.errorMessage.set('Não foi possível iniciar o exame. Tente novamente.');
          return;
        }

        this.router.navigate(['/attempt', attemptId, 'run']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Erro ao iniciar exame');
      }
    });
  }

  createAnonymousAndStart() {
    this.loadingAnonymous.set(true);
    this.authFacade.createAnonymousUser().subscribe({
      next: () => {
        this.loadingAnonymous.set(false);
        this.showRegisterPrompt.set(false);
        const currentExam = this.exam();
        if (currentExam) {
          this.doStartAttempt(currentExam);
        }
      },
      error: () => {
        this.loadingAnonymous.set(false);
        this.errorMessage.set('Erro ao criar usuário anônimo');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  loadExamBySlug(slug: string): void {
    this.loadingExam.set(true);
    this.errorMessage.set('');

    this.examsApi.getExamBySlug(slug).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.applySeo();
        this.loadingExam.set(false);
      },
      error: () => {
        this.errorMessage.set('Erro ao carregar exame');
        this.loadingExam.set(false);
      }
    });
  }

  private applySeo(): void {
    this.seoFacade.set(this.seo);
  }

  selectQuestionCount(count: number): void {
    const raw = count as unknown;
    const value = raw === 'custom' ? 'custom' : this.clampInt(raw, 1, 100, this.setup().questionCount);

    if (value === 'custom') {
      this.lastSelectedQuestionCountOption.set('custom');
      const nextCustom = this.clampInt(this.customQuestionCount(), 1, 100, this.setup().questionCount);
      this.applyQuestionCount(nextCustom);
      return;
    }

    this.lastSelectedQuestionCountOption.set(value);
    const nextCount = value;
    const nextDuration = this.setup().durationMinutes;
    this.applyQuestionCount(nextCount, nextDuration);
  }

  isCustomQuestionCountSelected(): boolean {
    return this.lastSelectedQuestionCountOption() === 'custom';
  }

  setCustomQuestionCount(rawValue: unknown): void {
    const next = this.clampInt(rawValue, 10, 100, this.customQuestionCount());
    this.customQuestionCount.set(next);
    this.applyQuestionCount(next);
  }

  private applyQuestionCount(nextCount: number, previousDurationMinutes?: number): void {
    const prevDuration = previousDurationMinutes ?? this.setup().durationMinutes;
    this.setup.set({...this.setup(), questionCount: nextCount});

    if (prevDuration === this.recommendedMinutes()) {
      this.setup.set({...this.setup(), questionCount: nextCount, durationMinutes: this.recommendedMinutes()});
    }
  }

  setDurationMinutes(rawValue: unknown): void {
    const next = this.clampInt(rawValue, 5, 240, this.setup().durationMinutes);
    this.setup.set({...this.setup(), durationMinutes: next});
  }

  setDifficulty(raw: AttemptDifficulty | string): void {
    const allowed: AttemptDifficulty[] = ['any', 'easy', 'medium', 'hard'];
    const next = allowed.includes(raw as AttemptDifficulty) ? (raw as AttemptDifficulty) : 'any';
    this.setup.set({...this.setup(), difficulty: next});
  }

  applyRecommendedTime(): void {
    this.setup.set({...this.setup(), durationMinutes: this.recommendedMinutes()});
  }

  resetSetup(): void {
    const global = this.setupPrefs.loadGlobal();
    this.setup.set({...DEFAULT_ATTEMPT_SETUP, ...global});
  }

  selectMode(mode: 'practice' | 'exam'): void {
    this.selectedMode.set(mode);
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }

  private isTextualSlug(slug: string): boolean {
    if (!slug) return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(slug);
  }

  private restoreSetupForExam(examId: string): void {
    const stored = this.setupPrefs.loadForExam(examId);

    this.setup.set({...DEFAULT_ATTEMPT_SETUP, ...stored});

    const initialCount = this.setup().questionCount;
    this.customQuestionCount.set(initialCount);

    const isPreset = this.questionCountOptions.includes(initialCount);
    this.lastSelectedQuestionCountOption.set(isPreset ? initialCount : 'custom');
  }

  private clampInt(value: unknown, min: number, max: number, fallback: number): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n))
      return fallback;

    return Math.min(max, Math.max(min, Math.round(n)));
  }
}
