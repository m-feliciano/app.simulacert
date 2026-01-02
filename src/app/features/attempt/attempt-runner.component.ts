import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AttemptsApiService} from '../../api/attempts.service';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptQuestionResponse, ExamResponse} from '../../api/domain';
import {interval, Subscription} from 'rxjs';

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
          <div class="header-left">
            <h2>{{ exam()!.title }}</h2>
          </div>
          <div class="header-right">
            <div class="timer" [class.warning]="timeRemaining() < 300">
              ⏱️ {{ formatTime(timeRemaining()) }}
            </div>
            <button class="btn-exit" (click)="confirmExit()" title="Sair do Exame">
              ✕ Sair
            </button>
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

            @if (isMultipleChoice(currentQuestion)) {
              <div class="multiple-choice-hint">
                <span class="hint-icon">ℹ️</span>
                <span>Esta questão permite múltiplas respostas. Selecione {{ getExpectedAnswerCount(currentQuestion) }}
                  opção(ões) correta(s).</span>
                @if (selectedAnswers[currentQuestionIndex()]) {
                  <span class="selection-count">({{ selectedAnswers[currentQuestionIndex()].length }}
                    /{{ getExpectedAnswerCount(currentQuestion) }} selecionadas)</span>
                }
              </div>
            }

            <div class="options">
              @for (option of currentQuestion.options; track option.key) {
                <div
                  class="option"
                  [class.selected]="isOptionSelected(option.key)"
                  (click)="toggleAnswer(option.key)">
                  @if (isMultipleChoice(currentQuestion)) {
                    <div class="option-checkbox" [class.checked]="isOptionSelected(option.key)">
                      @if (isOptionSelected(option.key)) {
                        <span>✓</span>
                      }
                    </div>
                  }
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
                <button class="btn-finish" (click)="submitCurrentAnswer(); confirmFinish()">
                  Finalizar Exame
                </button>
              }
            </div>
          </div>
        }
      }

      @if (showExitModal()) {
        <div class="finish-modal" (click)="showExitModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>⚠️ Sair do Exame?</h3>
            <p>Seu progresso foi salvo, mas o cronômetro continuará rodando.</p>
            <p><strong>Tem certeza que deseja sair?</strong></p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showExitModal.set(false)">Cancelar</button>
              <button class="btn-primary" (click)="exitAttempt()">Sair</button>
            </div>
          </div>
        </div>
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

  selectedAnswers: { [index: number]: string[] } = {};
  answeredQuestions = new Set<number>();

  duration = computed(() => Math.round(this.questions().length * 2 * 60)); // in seconds

  timeRemaining = signal(0);

  showFinishModal = signal(false);
  showExitModal = signal(false);
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
        timeRemaining: this.timeRemaining(),
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

        if (progress.timeRemaining !== undefined) {
          this.timeRemaining.set(progress.timeRemaining);
        }
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
    this.attemptsApi.getAttempt(this.attemptId).subscribe({
      next: (attempt) => {
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
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
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

      if (this.timeRemaining() === 0) {
        this.timeRemaining.set(this.duration());
      }

      if (!this.timerSubscription || this.timerSubscription.closed) {
        this.startTimer();
      }
    }
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining() > 0) {
        this.timeRemaining.update(t => t - 1);
        this.saveLocalProgress();
      } else {
        this.finishAttempt();
      }
    });
  }

  toggleAnswer(optionKey: string): void {
    const currentIdx = this.currentQuestionIndex();

    if (!this.selectedAnswers[currentIdx]) {
      this.selectedAnswers[currentIdx] = [];
    }

    const currentAnswers = [...this.selectedAnswers[currentIdx]];
    const expectedCount = this.getExpectedAnswerCount(this.currentQuestion!);

    if (expectedCount === 1) {
      if (currentAnswers.length === 1 && currentAnswers[0] === optionKey) {
        this.selectedAnswers[currentIdx] = [];
      } else {
        this.selectedAnswers[currentIdx] = [optionKey];
      }
    } else {
      const optionIndex = currentAnswers.indexOf(optionKey);
      if (optionIndex > -1) {
        currentAnswers.splice(optionIndex, 1);
        this.selectedAnswers[currentIdx] = currentAnswers;
      } else {
        if (currentAnswers.length < expectedCount) {
          this.selectedAnswers[currentIdx] = [...currentAnswers, optionKey].sort();
        }
      }
    }

    this.saveLocalProgress();
  }

  isOptionSelected(optionKey: string): boolean {
    const currentIdx = this.currentQuestionIndex();
    const answers = this.selectedAnswers[currentIdx];
    return answers ? answers.includes(optionKey) : false;
  }

  protected submitCurrentAnswer(): void {
    if (!this.currentQuestion || !this.selectedAnswers) return;

    const currentIdx = this.currentQuestionIndex();
    const currentAnswers = this.selectedAnswers[currentIdx];
    const expectedCount = this.getExpectedAnswerCount(this.currentQuestion);
    const currentCount = currentAnswers?.length || 0;
    const questionId = this.currentQuestion.questionId;

    if (currentCount !== expectedCount) return;

    const selectedOption = currentAnswers.join(',');

    this.attemptsApi.submitAnswer(this.attemptId, questionId, {selectedOption})
      .subscribe({
        next: () => {
          this.answeredQuestions.add(currentIdx);
        },
        error: (error) => console.error('Error submitting:', error)
      });
  }

  isMultipleChoice(question: AttemptQuestionResponse): boolean {
    const text = question?.text?.toLowerCase();
    return text?.includes('escolha dois') ||
      text?.includes('escolha duas') ||
      text?.includes('escolha três') ||
      text?.includes('escolha tres') ||
      text?.includes('selecione dois') ||
      text?.includes('selecione duas') ||
      text?.includes('selecione três') ||
      text?.includes('selecione tres') ||
      text?.includes('(escolha') ||
      text?.includes('(selecione');
  }

  getExpectedAnswerCount(question: AttemptQuestionResponse): number {
    const text = question.text.toLowerCase();

    if (text.includes('escolha dois') || text.includes('selecione dois') ||
      text.includes('escolha duas') || text.includes('selecione duas')) {
      return 2;
    }
    if (text.includes('escolha três') || text.includes('selecione três') ||
      text.includes('escolha tres') || text.includes('selecione tres')) {
      return 3;
    }
    if (text.includes('escolha quatro') || text.includes('selecione quatro')) {
      return 4;
    }

    if (this.isMultipleChoice(question)) {
      const correctCount = question.options.filter(opt => opt.isCorrect).length;
      return correctCount > 1 ? correctCount : 1;
    }

    return 1;
  }

  goToQuestion(index: number): void {
    this.submitCurrentAnswer();
    this.currentQuestionIndex.set(index);
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.submitCurrentAnswer();
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.submitCurrentAnswer();
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  confirmExit(): void {
    this.showExitModal.set(true);
  }

  exitAttempt(): void {
    this.saveLocalProgress();
    this.timerSubscription?.unsubscribe();
    this.router.navigate(['/dashboard']);
  }

  confirmFinish(): void {
    this.showFinishModal.set(true);
  }

  finishAttempt(): void {
    this.submitCurrentAnswer();

    this.finishingAttempt.set(true);
    this.finishError.set('');
    this.showFinishModal.set(false);
    this.timerSubscription?.unsubscribe();

    this.attemptsApi.finishAttempt(this.attemptId).subscribe({
      next: () => {
        this.clearLocalProgress();
        this.router.navigate(['/attempt', this.attemptId, 'result']);
      },
      error: (error) => {
        console.error('Error finishing attempt:', error);
        this.finishingAttempt.set(false);
        this.finishError.set('Erro ao finalizar o exame. Suas respostas estão salvas. Por favor, tente novamente.');
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

