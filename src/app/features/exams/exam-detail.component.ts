import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptsApiService} from '../../api/attempts.service';
import {AuthFacade} from '../../core/auth/auth.facade';
import {ExamResponse} from '../../api/domain';
import {RegisterPromptModalComponent} from '../../shared/components/register-prompt-modal.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule, RegisterPromptModalComponent, SeoHeadDirective],
  template: `
    <div seoHead>
      @if (showRegisterPrompt()) {
        <app-register-prompt-modal (register)="goToRegister()"
                                   (anonymous)="createAnonymousAndStart()"
                                   (close)="showRegisterPrompt.set(false)"
                                   [loading]="loadingAnonymous()">
        </app-register-prompt-modal>
      }

      <div class="exam-detail">
        <div class="breadcrumb">
          <a (click)="goBack()" class="back-link" aria-label="Voltar para lista de exames">← Voltar</a>
        </div>

        @if (loadingExam()) {
          <div class="loading-state">
            <p>Carregando detalhes do exame...</p>
          </div>
        }

        @if (!loadingExam() && exam()) {
          <div class="exam-header">
            <h1>{{ exam()!.title }}</h1>
            @if (exam()!.description) {
              <p class="exam-description">{{ exam()!.description }}</p>
            }
          </div>

          <div class="mode-selection">
            <h2>Escolha o modo de estudo</h2>
            <div class="mode-cards">
              <div class="mode-card"
                   [class.selected]="selectedMode() === 'practice'"
                   style="background: #ccc; cursor: not-allowed;">

                <div class="mode-icon">📖</div>
                <h3>Modo Prática</h3>
                <ul class="mode-features">
                  <li>✓ Veja explicações durante o simulado</li>
                  <li>✓ Sem limite de tempo</li>
                  <li>✓ Ideal para aprender</li>
                  <li>✓ Feedback imediato</li>
                </ul>
              </div>

              <div class="mode-card"
                   [class.selected]="selectedMode() === 'exam'"
                   (click)="selectMode('exam')">
                <div class="mode-icon">⏱️</div>
                <h3>Modo Exame</h3>
                <ul class="mode-features">
                  <li>✓ Simula o exame real</li>
                  <li>✓ Tempo cronometrado</li>
                  <li>✓ Sem explicações durante</li>
                  <li>✓ Resultados ao final</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="exam-info">
            <div class="info-card">
              <h3>Informações do Exame</h3>
              <ul>
                <li><strong>Tipo:</strong> Simulado AWS</li>
                <li><strong>Duração:</strong> {{ duration() }} minutos</li>
                <li><strong>Questões:</strong> {{ questionCount() }}</li>
                <li><strong>Pontuação mínima:</strong> 72%</li>
              </ul>
            </div>

            <div class="info-card">
              <h3>Regras</h3>
              <ul>
                <li>Você terá {{ duration() }} minutos para completar o exame</li>
                <li>São {{ questionCount() }} questões de múltipla escolha</li>
                <li>Não é possível pausar o exame</li>
                <li>Você pode revisar suas respostas antes de finalizar</li>
              </ul>
            </div>
          </div>

          <div class="question-selector">
            <h3>Quantidade de Questões</h3>
            <div class="question-options">
              @for (count of questionCountOptions; track count) {
                <button
                  class="question-option"
                  [class.selected]="questionCount() === count"
                  (click)="selectQuestionCount(count)"
                  type="button">
                  {{ count }} questões
                </button>
              }
            </div>
          </div>

          <div class="actions">
            <button class="btn-primary" (click)="startExam()" [disabled]="loading()" aria-label="Iniciar simulado">
              {{ loading() ? 'Iniciando...' : 'Iniciar com ' + questionCount() + ' questões' }}
            </button>
          </div>
          <div class="actions">
            <button class="btn-secondary" disabled type="button" aria-label="Imprimir simulado (em breve)">
              Imprimir (em breve)
            </button>
          </div>
        }

        @if (errorMessage()) {
          <div class="error">{{ errorMessage() }}</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./exam-detail.component.css']
})
export class ExamDetailComponent implements OnInit {

  questionCountOptions = [10, 20, 30, 40, 50, 100];

  exam = signal<ExamResponse | null>(null);
  loading = signal(false);
  loadingExam = signal(false);
  errorMessage = signal('');
  loadingAnonymous = signal(false);
  showRegisterPrompt = signal(false);
  questionCount = signal(20);
  selectedMode = signal<'practice' | 'exam'>('exam');
  duration = computed(() => Math.round(this.questionCount() * 1.5));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsApi: ExamsApiService,
    private attemptsApi: AttemptsApiService,
    private authFacade: AuthFacade,
    private seoFactory: SeoFactoryService,
    private seoFacade: SeoFacadeService,
  ) {
  }

  get seo() {
    const exam = this.exam();
    const title = exam ? `${exam.title} | SimulaCert` : 'Simulado | SimulaCert';
    const description = exam?.description || 'Simulado de certificação.';
    const canonicalUrl = exam?.slug ? this.seoFactory.canonicalFromPath(`/exams/${exam.slug}`) : '';
    const origin = this.seoFactory.origin();
    const image = exam?.slug ? `${origin}/${exam.slug}.png` : `${origin}/simulacert-logo.svg`;

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
      ]
      : null;

    return this.seoFactory.build({
      title,
      description,
      robots: 'index, follow',
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
    const resolvedExam = this.route.snapshot.data['exam'] as ExamResponse | null | undefined;
    const examId = this.route.snapshot.paramMap.get('id');
    const slug = this.route.snapshot.paramMap.get('slug');

    if (resolvedExam) {
      this.exam.set(resolvedExam);
      this.seoFacade.set(this.seo);
      return;
    }

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
          this.applySeo();
          this.loadingExam.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading exam:', error);
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

    this.attemptsApi.startAttempt({
      examId: exam.id,
      userId: this.authFacade.currentUser()!.id,
      questionCount: this.questionCount()
    }).subscribe({
      next: (attempt) => {
        this.router.navigate(['/attempt', attempt.id, 'run']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Erro ao iniciar exame');
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
      error: (err) => {
        this.loadingAnonymous.set(false);
        this.errorMessage.set('Erro ao criar usuário anônimo');
        console.error('Error creating anonymous user', err);
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
      error: (error) => {
        console.error('Error loading exam by slug:', error);
        this.errorMessage.set('Erro ao carregar exame');
        this.loadingExam.set(false);
      }
    });
  }

  private applySeo(): void {
    this.seoFacade.set(this.seo);
  }

  selectQuestionCount(count: number): void {
    this.questionCount.set(count);
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
}
