import {Component, DestroyRef, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AttemptsApiService} from '../../api/attempts.service';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptQuestionResponse, AttemptResponse, ExamResponse} from '../../api/domain';
import {interval, Subscription} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormatTimePipe} from '../../shared/pipes/format-time.pipe';

@Component({
  selector: 'app-attempt-runner',
  standalone: true,
  imports: [CommonModule, FormatTimePipe],
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

      @if (isPaused()) {
        <div class="loading-state">
          <p>Exame pausado. Retome quando estiver pronto.</p>
        </div>

      } @else if (!loading() && !error() && exam() && questionsLoaded()) {
        <div class="attempt-header">
          <div class="header-left">
            <h2>{{ exam()!.title }}</h2>
          </div>
          <div class="header-right">
            <div class="timer" title="Tempo restante">
              {{ timeRemaining() | formatTime }}
            </div>
            <button class="btn-pause" (click)="pauseAttempt()" title="Pausar Exame">
              ⏸ Pausar
            </button>
            <button class="btn-exit" (click)="confirmExit()" title="Sair do Exame">
              ✕ Sair
            </button>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progress"></div>
        </div>

        <div class="question-navigation">
          @for (_ of questions(); track $index) {
            <button
              class="question-nav-btn"
              [class.active]="$index === currentQuestionIndex()"
              [class.answered]="answeredQuestions().has($index)"
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
                @if (selectedAnswers()[currentQuestionIndex()]) {
                  <span class="selection-count">({{ selectedAnswers()[currentQuestionIndex()].length }}
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

              @if (currentQuestionIndex() < questions().length - 1) {
                <button class="btn-secondary"
                        (click)="nextQuestion()"
                        [disabled]="!selectedAnswers()[currentQuestionIndex()] || selectedAnswers()[currentQuestionIndex()].length !== getExpectedAnswerCount(currentQuestion)">
                  Próxima →
                </button>
              }

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
            <p>Seu progresso será salvo e você poderá retomar mais tarde.</p>
            <p><strong>Tem certeza que deseja sair?</strong></p>
            <div class="modal-actions">
              <button class="btn-primary" (click)="showExitModal.set(false)">Cancelar</button>
              <button class="btn-secondary" (click)="exitAttempt()">Sair</button>
            </div>
          </div>
        </div>
      }

      @if (showPauseModal()) {
        <div class="finish-modal" (click)="resumeAttempt()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>⏸ Exame Pausado</h3>
            <p>O cronômetro foi pausado e seu progresso foi salvo.</p>
            <div class="modal-actions">
              <button class="btn-primary" (click)="resumeAttempt()">Retomar Exame</button>
            </div>
          </div>
        </div>
      }

      @if (showFinishModal()) {
        <div class="finish-modal" (click)="showFinishModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Finalizar Exame?</h3>
            <p>Você respondeu {{ answeredQuestions().size }} de {{ questions().length }} questões.</p>
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
  selectedAnswers = signal<{ [index: number]: string[] }>({});
  answeredQuestions = signal(new Set<number>());
  currentQuestionIndex = signal(0);
  timeRemaining = signal(0);
  finishingAttempt = signal(false);
  showFinishModal = signal(false);
  showExitModal = signal(false);
  showPauseModal = signal(false);
  isPaused = signal(false);
  error = signal('');
  finishError = signal('');

  private endsAtMs = signal<number | null>(null);
  private readonly TIMER_TICK_MS = 1000;
  private readonly HEARTBEAT_EVERY_MS = 10_000;

  private heartbeatSubscription?: Subscription;
  private timerSubscription?: Subscription;

  loading = signal(true);
  attemptLoaded = signal(false);
  examLoaded = signal(false);
  questionsLoaded = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService,
    private destroyRef: DestroyRef
  ) {}

  get currentQuestion(): AttemptQuestionResponse | null {
    return this.questions()[this.currentQuestionIndex()] || null;
  }

  get progress(): number {
    const questionsLength = this.questions().length;
    return questionsLength > 0 ? (this.answeredQuestions().size / questionsLength) * 100 : 0;
  }

  ngOnInit(): void {
    this.attemptId = this.route.snapshot.paramMap.get('id')!;
    this.loadAttempt();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private updateRemainingFromEndsAt(): void {
    const endsAt = this.endsAtMs();
    if (endsAt) {
      const remainingSec = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      this.timeRemaining.set(remainingSec);
    }
  }

  private setTimingFromServer(payload: { endsAt?: string; remainingSeconds?: number; paused: boolean }): void {
    if (payload.paused) {
      if (payload.remainingSeconds !== undefined && payload.remainingSeconds !== null) {
        this.endsAtMs.set(Date.now() + payload.remainingSeconds * 1000);

      } else if (payload.endsAt) {
        const ms = Date.parse(payload.endsAt);
        if (!Number.isNaN(ms)) this.endsAtMs.set(ms);
      }

    } else {
      if (payload.endsAt) {
        const ms = Date.parse(payload.endsAt);
        if (!Number.isNaN(ms)) this.endsAtMs.set(ms);

      } else if (payload.remainingSeconds !== undefined && payload.remainingSeconds !== null) {
        this.endsAtMs.set(Date.now() + payload.remainingSeconds * 1000);
      }
    }

    this.isPaused.set(payload.paused);
    this.updateRemainingFromEndsAt();
  }

  startTimer(): void {
    this.timerSubscription?.unsubscribe();

    this.timerSubscription = interval(this.TIMER_TICK_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isPaused()) return;

        this.updateRemainingFromEndsAt();

        if (this.timeRemaining() <= 0 && this.attemptLoaded()) {
          this.unsubscribe();
          this.finishAttempt();
        }
    });
  }

  private startHeartbeat(): void {
    this.heartbeatSubscription?.unsubscribe();

    this.heartbeatSubscription = interval(this.HEARTBEAT_EVERY_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isPaused() || this.loading() || this.error() || this.finishingAttempt()) return;

        this.attemptsApi.heartbeatAttempt(this.attemptId).subscribe({
          next: (timing) => {
            this.setTimingFromServer(timing);
          },
          error: () => {
            this.finishError.set('Conexão instável. Não foi possível sincronizar o tempo do exame.');
          }
        });
      });
  }

  pauseAttempt(): void {
    if (this.loading() || this.error() || this.finishingAttempt()) return;

    this.attemptsApi.pauseAttempt(this.attemptId).subscribe({
      next: (timing) => {
        this.setTimingFromServer(timing);
        this.showPauseModal.set(true);
        this.unsubscribe();
      },
      error: () => {
        this.finishError.set('Não foi possível pausar o exame. Verifique sua conexão e tente novamente.');
      }
    });
  }

  private unsubscribe() {
    this.timerSubscription?.unsubscribe();
    this.heartbeatSubscription?.unsubscribe();
  }

  resumeAttempt(): void {
    if (this.loading() || this.error() || this.finishingAttempt()) return;

    this.attemptsApi.resumeAttempt(this.attemptId).subscribe({
      next: (timing) => {
        this.setTimingFromServer(timing);
        this.showPauseModal.set(false);

        if (!this.timerSubscription || this.timerSubscription.closed) {
          this.startTimer();
        }

        if (!this.heartbeatSubscription || this.heartbeatSubscription.closed) {
          this.startHeartbeat();
        }
      },
      error: () => {
        this.finishError.set('Não foi possível retomar o exame. Verifique sua conexão e tente novamente.');
      }
    });
  }

  toggleAnswer(optionKey: string): void {
    const currentIdx = this.currentQuestionIndex();

    const currentMap = this.selectedAnswers();
    const currentAnswers = [...(currentMap[currentIdx] ?? [])];
    const expectedCount = this.getExpectedAnswerCount(this.currentQuestion!);

    let nextAnswers: string[] = currentAnswers;

    if (expectedCount === 1) {
      if (currentAnswers.length === 1 && currentAnswers[0] === optionKey) {
        nextAnswers = [];
      } else {
        nextAnswers = [optionKey];
      }
    } else {
      const optionIndex = currentAnswers.indexOf(optionKey);
      if (optionIndex > -1) {
        nextAnswers = currentAnswers.filter(a => a !== optionKey);
      } else if (currentAnswers.length < expectedCount) {
        nextAnswers = [...currentAnswers, optionKey].sort();
      } else {
        alert(`Você só pode selecionar ${expectedCount} opções para esta questão.`);
        return;
      }
    }

    this.selectedAnswers.set({
      ...currentMap,
      [currentIdx]: nextAnswers,
    });

    this.submitCurrentAnswer();
  }

  loadAttempt(): void {
    this.attemptsApi.getAttempt(this.attemptId).subscribe({
      next: (attempt) => {
        this.loadExam(attempt.examId);
        this.loadQuestions();
        this.startFirstHeartbeat(attempt);
        this.attemptLoaded.set(true);
      },
      error: () => {
        this.error.set('Erro ao carregar tentativa. Por favor, tente novamente.');
        this.loading.set(false);
      },
      complete: () => this.checkIfLoaded()
    });
  }

  private startFirstHeartbeat(attempt: AttemptResponse) {
    this.attemptsApi.heartbeatAttempt(this.attemptId).subscribe({
      next: (timing) => {
        this.setTimingFromServer(timing);
        this.showPauseModal.set(timing.paused);
      },
      error: () => {
        this.setTimingFromServer({
          endsAt: attempt.endsAt,
          paused: attempt.paused ?? false
        });

        if (attempt.paused) this.showPauseModal.set(true);
      }
    });
  }

  loadExam(examId: string): void {
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.examLoaded.set(true);
        this.checkIfLoaded();
      },
      error: () => {
        this.error.set('Erro ao carregar exame.');
        this.loading.set(false);
      }
    });
  }

  loadQuestions(): void {
    this.attemptsApi.getAttemptQuestions(this.attemptId).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.questionsLoaded.set(true);
        this.checkIfLoaded();
        this.loadAnswers();
      },
      error: () => {
        this.error.set('Erro ao carregar questões.');
        this.loading.set(false);
      }
    });
  }

  checkIfLoaded(): void {
    if (this.examLoaded() && this.questionsLoaded()) {
      this.loading.set(false);

      if (this.endsAtMs()) {
        this.updateRemainingFromEndsAt();
      }

      if (!this.timerSubscription || this.timerSubscription.closed) {
        this.startTimer();
      }

      if (!this.heartbeatSubscription || this.heartbeatSubscription.closed) {
        this.startHeartbeat();
      }
    }
  }

  isOptionSelected(optionKey: string): boolean {
    const currentIdx = this.currentQuestionIndex();
    const answers = this.selectedAnswers()[currentIdx];
    return answers ? answers.includes(optionKey) : false;
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
      return Math.max(correctCount, 1);
    }

    return 1;
  }

  protected submitCurrentAnswer(): void {
    if (!this.currentQuestion) return;

    const currentIdx = this.currentQuestionIndex();
    const currentAnswers = this.selectedAnswers()[currentIdx];
    const expectedCount = this.getExpectedAnswerCount(this.currentQuestion);
    const currentCount = currentAnswers?.length || 0;
    const questionId = this.currentQuestion.questionId;

    if (currentCount !== expectedCount) return;

    const selectedOption = currentAnswers.join(',');

    this.attemptsApi.submitAnswer(this.attemptId, questionId, {selectedOption})
      .subscribe({
        next: () => {
          this.answeredQuestions.update(set => {
            const next = new Set(set);
            next.add(currentIdx);
            return next;
          });
        },
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

  private loadAnswers(): void {
    this.attemptsApi.getAnswers(this.attemptId).subscribe({
      next: (answer) => {
        if (answer && answer.length > 0) {
          const selectedMap: { [index: number]: string[] } = {};
          const answeredSet = new Set<number>();

          answer.forEach(ans => {
            const questionIndex = this.questions()
              .findIndex(q => q.questionId === ans.questionId);

            if (questionIndex !== -1) {
              selectedMap[questionIndex] = ans.selectedOption ? ans.selectedOption.split(',') : [];
              answeredSet.add(questionIndex);
            }
          });

          this.selectedAnswers.set(selectedMap);
          this.answeredQuestions.set(answeredSet);

          this.goToNextAnswerPending();
        }
      }
    });
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
    if (this.loading() || this.finishingAttempt()) {
      this.navigateToDashboard();
      return;
    }

    this.attemptsApi.pauseAttempt(this.attemptId).subscribe({
      next: (timing) => {
        this.setTimingFromServer(timing);
        this.isPaused.set(true);
        this.showExitModal.set(false);
        this.unsubscribe();
        this.navigateToDashboard();
      },
      error: () => {
        this.finishError.set('Não foi possível salvar e sair do exame. Verifique sua conexão e tente novamente.');
      }
    });
  }

  private navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  confirmFinish(): void {
    this.showFinishModal.set(true);
  }

  finishAttempt(): void {
    if (this.finishingAttempt()) return;
    this.submitCurrentAnswer();

    this.finishingAttempt.set(true);
    this.finishError.set('');
    this.showFinishModal.set(false);

    this.attemptsApi.finishAttempt(this.attemptId).subscribe({
      next: () => {
        this.router.navigate(['/attempt', this.attemptId, 'result']);
      },
      error: () => {
        this.finishError.set('Erro ao finalizar o exame. Suas respostas estão salvas. Por favor, tente novamente.');
        this.finishingAttempt.set(false);
      }
    });
  }

  retryFinish(): void {
    this.finishAttempt();
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }

  private goToNextAnswerPending() {
    const lastAnsweredIndex = Math.max(...Array.from(this.answeredQuestions()).map(i => i), -1);
    const nextPendingIndex = this.questions().findIndex((_, idx) => idx > lastAnsweredIndex && !this.answeredQuestions().has(idx));

    if (nextPendingIndex !== -1) {
      this.currentQuestionIndex.set(nextPendingIndex);
    } else {
      this.currentQuestionIndex.set(this.questions().length - 1);
    }
  }
}

