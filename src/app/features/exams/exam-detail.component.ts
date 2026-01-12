import {Component, computed, OnInit, Renderer2, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptsApiService} from '../../api/attempts.service';
import {AuthFacade} from '../../core/auth/auth.facade';
import {ExamResponse} from '../../api/domain';
import {RegisterPromptModalComponent} from '../../shared/components/register-prompt-modal.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule, RegisterPromptModalComponent, SeoHeadDirective],
  template: `
    <div seoHead
         [seoTitle]="exam() ? exam()!.title + ' | SimulaCert' : 'Simulado | SimulaCert'"
         [seoDescription]="exam() ? (exam()!.description || 'Simulado de certificação.') : 'Simulado de certificação.'"
         [seoRobots]="'index, follow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">

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

  exam = signal<ExamResponse | null>(null);
  loading = signal(false);
  loadingExam = signal(false);
  errorMessage = signal('');
  loadingAnonymous = signal(false);
  showRegisterPrompt = signal(false);
  questionCount = signal(20);
  questionCountOptions = [10, 20, 30, 40, 50, 100];

  selectedMode = signal<'practice' | 'exam'>('exam');

  duration = computed(() => Math.round(this.questionCount() * 1.5));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsApi: ExamsApiService,
    private attemptsApi: AttemptsApiService,
    private authFacade: AuthFacade,
    private _renderer: Renderer2
  ) {}

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const exam = this.exam();
    return `${base}${exam ? '/exams/' + (exam!.slug || exam!.id) : ''}`;
  }

  ngOnInit(): void {
    const resolvedExam = this.route.snapshot.data['exam'] as ExamResponse | null | undefined;
    const examId = this.route.snapshot.paramMap.get('id');
    const slug = this.route.snapshot.paramMap.get('slug');

    if (resolvedExam) {
      this.exam.set(resolvedExam);
      return;
    }

    if (examId) {
      this.loadExam(examId, true); // true = pode redirecionar para slug
    } else if (slug) {
      this.loadExamBySlug(slug);
    }
  }

  startExam(): void {
    const currentExam = this.exam();
    if (!currentExam) {
      return;
    }

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

  loadExam(examId: string, redirectToSlug = false): void {
    this.loadingExam.set(true);
    this.errorMessage.set('');

    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        if (redirectToSlug && exam.slug && this.isTextualSlug(exam.slug)) {
          this.router.navigate(['/exams', exam.slug]);
        } else {
          this.exam.set(exam);
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

  loadExamBySlug(slug: string): void {
    this.loadingExam.set(true);
    this.errorMessage.set('');

    this.examsApi.getExamBySlug(slug).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.loadingExam.set(false);
      },
      error: (error) => {
        console.error('Error loading exam by slug:', error);
        this.errorMessage.set('Erro ao carregar exame');
        this.loadingExam.set(false);
      }
    });
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
