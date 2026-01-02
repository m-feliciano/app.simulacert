import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AttemptsApiService } from '../../api/attempts.service';
import { ExamsApiService } from '../../api/exams.service';
import { AttemptQuestionResponse, ExamResponse } from '../../api/domain';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-attempt-runner',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./attempt-runner.component.css'],
  template: `
    <div class="attempt-runner">
      @if (loading()) {
        <div class="loading-state">
          <p>Carregando exame...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <button class="btn-secondary" (click)="goBack()">Voltar</button>
        </div>
      }

      @if (!loading() && !error() && exam() && questions().length > 0) {
        <div class="attempt-header">
          <h2>{{ exam()!.title }}</h2>
          <div class="timer" [class.warning]="timeRemaining() < 300">
            ⏱️ {{ formatTime(timeRemaining()) }}
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progress"></div>
        </div>

        <div class="question-navigation">
          @for (q of questions(); track $index) {
            <button
              class="question-nav-btn"
              [class.active]="$index === currentQuestionIndex()"
              [class.answered]="answeredQuestions.has($index)"
              (click)="goToQuestion($index)">
              {{ $index + 1 }}
            </button>
          }
        </div>

        @if (currentQuestion) {
          <div class="question-content">
            <div class="question-header">
              <span class="question-number">Questão {{ currentQuestionIndex() + 1 }} de {{ questions().length }}</span>
              <span class="question-meta">{{ currentQuestion.domain }} | {{ currentQuestion.difficulty }}</span>
            </div>

            <div class="question-text">{{ currentQuestion.text }}</div>

            <div class="options">
              @for (option of currentQuestion.options; track option.key) {
                <div
                  class="option"
                  [class.selected]="selectedAnswers[currentQuestionIndex()] === option.key"
                  (click)="selectAnswer(option.key)">
                  <div class="option-key">{{ option.key }}</div>
                  <div class="option-text">{{ option.text }}</div>
                </div>
              }
            </div>

            <div class="question-actions">
              <button
                class="btn-secondary"
                (click)="previousQuestion()"
                [disabled]="currentQuestionIndex() === 0">
                ← Anterior
              </button>

              <button
                class="btn-secondary"
                (click)="nextQuestion()"
                [disabled]="currentQuestionIndex() === questions().length - 1">
                Próxima →
              </button>

              @if (currentQuestionIndex() === questions().length - 1) {
                <button
                  class="btn-finish"
                  (click)="confirmFinish()">
                  Finalizar Exame
                </button>
              }
            </div>
          </div>
        }
      }

      @if (showFinishModal()) {
        <div class="finish-modal" (click)="showFinishModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Finalizar Exame?</h3>
            <p>Você respondeu {{ answeredQuestions.size }} de {{ questions().length }} questões.</p>
            <p><strong>Tem certeza que deseja finalizar?</strong></p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showFinishModal.set(false)">Cancelar</button>
              <button class="btn-primary" (click)="finishAttempt()">Finalizar</button>
            </div>
          </div>
        </div>
      }

      @if (finishingAttempt()) {
        <div class="finish-modal">
          <div class="modal-content">
            <div class="loading-spinner"></div>
            <h3>Finalizando exame...</h3>
            <p>Por favor, aguarde enquanto processamos suas respostas.</p>
          </div>
        </div>
      }

      @if (finishError()) {
        <div class="finish-modal" (click)="finishError.set('')">
          <div class="modal-content error-modal" (click)="$event.stopPropagation()">
            <h3>⚠️ Erro ao Finalizar</h3>
            <p>{{ finishError() }}</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="finishError.set('')">Fechar</button>
              <button class="btn-primary" (click)="retryFinish()">Tentar Novamente</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AttemptRunnerComponent implements OnInit, OnDestroy {
  attemptId!: string;
  exam = signal<ExamResponse | null>(null);
  questions = signal<AttemptQuestionResponse[]>([]);
  currentQuestionIndex = signal(0);

  selectedAnswers: { [index: number]: string} = {};
  answeredQuestions = new Set<number>();

  timeRemaining = signal(10800);
  showFinishModal = signal(false);
  loading = signal(true);
  error = signal('');
  finishingAttempt = signal(false);
  finishError = signal('');

  private timerSubscription?: Subscription;
  private readonly STORAGE_KEY_PREFIX = 'attempt_progress_';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService
  ) {}

  get currentQuestion(): AttemptQuestionResponse | null {
    return this.questions()[this.currentQuestionIndex()] || null;
  }

  get progress(): number {
    const questionsLength = this.questions().length;
    return questionsLength > 0 ? (this.answeredQuestions.size / questionsLength) * 100 : 0;
  }

  ngOnInit(): void {
    this.attemptId = this.route.snapshot.paramMap.get('id')!;
    this.loadAttempt();
    this.startTimer();
    this.loadLocalProgress();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  private getStorageKey(): string {
    return `${this.STORAGE_KEY_PREFIX}${this.attemptId}`;
  }

  private saveLocalProgress(): void {
    try {
      const progress = {
        selectedAnswers: this.selectedAnswers,
        answeredQuestions: Array.from(this.answeredQuestions),
        currentQuestionIndex: this.currentQuestionIndex(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.getStorageKey(), JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }

  private loadLocalProgress(): void {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        const progress = JSON.parse(saved);
        this.selectedAnswers = progress.selectedAnswers || {};
        this.answeredQuestions = new Set(progress.answeredQuestions || []);
        if (progress.currentQuestionIndex !== undefined) {
          this.currentQuestionIndex.set(progress.currentQuestionIndex);
        }
        console.log('Progress loaded from localStorage:', progress);
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error);
    }
  }

  private clearLocalProgress(): void {
    try {
      localStorage.removeItem(this.getStorageKey());
    } catch (error) {
      console.error('Error clearing progress from localStorage:', error);
    }
  }

  loadAttempt(): void {
    console.log('Loading attempt:', this.attemptId);
    this.attemptsApi.getAttempt(this.attemptId).subscribe({
      next: (attempt) => {
        console.log('Attempt loaded:', attempt);
        this.loadExam(attempt.examId);
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Error loading attempt:', error);
        this.error.set('Erro ao carregar tentativa. Por favor, tente novamente.');
        this.loading.set(false);
      }
    });
  }

  loadExam(examId: string): void {
    console.log('Loading exam:', examId);
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        console.log('Exam loaded:', exam);
        this.exam.set(exam);
        this.checkIfLoaded();
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.error.set('Erro ao carregar exame.');
        this.loading.set(false);
      }
    });
  }

  loadQuestions(): void {
    this.attemptsApi.getAttemptQuestions(this.attemptId).subscribe({
      next: (questions) => {
        console.log('Questions loaded:', questions.length);
        this.questions.set(questions);
        this.checkIfLoaded();
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.error.set('Erro ao carregar questões.');
        this.loading.set(false);
      }
    });
  }

  checkIfLoaded(): void {
    if (this.exam() && this.questions().length > 0) {
      this.loading.set(false);
    }
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining() > 0) {
        this.timeRemaining.update(t => t - 1);
      } else {
        this.finishAttempt();
      }
    });
  }

  selectAnswer(optionKey: string): void {
    const currentIdx = this.currentQuestionIndex();
    this.selectedAnswers[currentIdx] = optionKey;
    this.answeredQuestions.add(currentIdx);

    // Salva progresso localmente imediatamente
    this.saveLocalProgress();

    if (this.currentQuestion) {
      this.attemptsApi.submitAnswer(
        this.attemptId,
        this.currentQuestion.questionId,
        { selectedOption: optionKey }
      ).subscribe({
        next: () => {
          console.log('Answer submitted successfully');
        },
        error: (error) => {
          console.error('Error submitting answer:', error);
          // Mesmo com erro no servidor, mantemos localmente
        }
      });
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex.set(index);
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  confirmFinish(): void {
    this.showFinishModal.set(true);
  }

  finishAttempt(): void {
    this.finishingAttempt.set(true);
    this.finishError.set('');
    this.showFinishModal.set(false);
    this.timerSubscription?.unsubscribe();

    this.attemptsApi.finishAttempt(this.attemptId).subscribe({
      next: () => {
        console.log('Attempt finished successfully');
        // Limpa o progresso local apenas após sucesso
        this.clearLocalProgress();
        this.router.navigate(['/attempt', this.attemptId, 'result']);
      },
      error: (error) => {
        console.error('Error finishing attempt:', error);
        this.finishingAttempt.set(false);
        this.finishError.set('Erro ao finalizar o exame. Suas respostas estão salvas. Por favor, tente novamente.');
        // Mantém o progresso local para retry
      }
    });
  }

  retryFinish(): void {
    this.finishAttempt();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }
}

