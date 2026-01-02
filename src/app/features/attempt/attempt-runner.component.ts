import { Component, OnInit, OnDestroy } from '@angular/core';
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
  template: `
    <div class="attempt-runner" *ngIf="exam && questions.length > 0">
      <div class="attempt-header">
        <h2>{{ exam.title }}</h2>
        <div class="timer" [class.warning]="timeRemaining < 300">
          ⏱️ {{ formatTime(timeRemaining) }}
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progress"></div>
      </div>

      <div class="question-navigation">
        <button
          *ngFor="let q of questions; let i = index"
          class="question-nav-btn"
          [class.active]="i === currentQuestionIndex"
          [class.answered]="answeredQuestions.has(i)"
          (click)="goToQuestion(i)">
          {{ i + 1 }}
        </button>
      </div>

      <div class="question-content" *ngIf="currentQuestion">
        <div class="question-header">
          <span class="question-number">Questão {{ currentQuestionIndex + 1 }} de {{ questions.length }}</span>
          <span class="question-meta">{{ currentQuestion.domain }} | {{ currentQuestion.difficulty }}</span>
        </div>

        <div class="question-text">{{ currentQuestion.text }}</div>

        <div class="options">
          <div
            *ngFor="let option of currentQuestion.options"
            class="option"
            [class.selected]="selectedAnswers[currentQuestionIndex] === option.key"
            (click)="selectAnswer(option.key)">
            <div class="option-key">{{ option.key }}</div>
            <div class="option-text">{{ option.text }}</div>
          </div>
        </div>

        <div class="question-actions">
          <button
            class="btn-secondary"
            (click)="previousQuestion()"
            [disabled]="currentQuestionIndex === 0">
            ← Anterior
          </button>

          <button
            class="btn-secondary"
            (click)="nextQuestion()"
            [disabled]="currentQuestionIndex === questions.length - 1">
            Próxima →
          </button>

          <button
            class="btn-finish"
            (click)="confirmFinish()"
            *ngIf="currentQuestionIndex === questions.length - 1">
            Finalizar Exame
          </button>
        </div>
      </div>

      <div class="finish-modal" *ngIf="showFinishModal" (click)="showFinishModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Finalizar Exame?</h3>
          <p>Você respondeu {{ answeredQuestions.size }} de {{ questions.length }} questões.</p>
          <p><strong>Tem certeza que deseja finalizar?</strong></p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showFinishModal = false">Cancelar</button>
            <button class="btn-primary" (click)="finishAttempt()">Finalizar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attempt-runner {
      max-width: 1000px;
      margin: 0 auto;
    }

    .attempt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-lg);
    }

    @media (min-width: 768px) {
      .attempt-header {
        padding: var(--spacing-lg) var(--spacing-xl);
      }
    }

    h2 {
      margin: 0;
      color: var(--color-dark);
      font-size: 20px;
    }

    @media (min-width: 768px) {
      h2 {
        font-size: 24px;
      }
    }

    .timer {
      font-size: 18px;
      font-weight: bold;
      padding: 10px 20px;
      background: var(--color-secondary);
      color: white;
      border-radius: var(--border-radius-sm);
      transition: var(--transition-fast);
      white-space: nowrap;
    }

    @media (min-width: 768px) {
      .timer {
        font-size: 20px;
      }
    }

    .timer.warning {
      background: var(--color-danger);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .timer.warning {
        animation: none;
      }
    }

    .progress-bar {
      height: 8px;
      background: var(--color-border-light);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      margin-bottom: var(--spacing-lg);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
      transition: var(--transition-normal);
    }

    .question-navigation {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: var(--color-bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-lg);
    }

    @media (min-width: 768px) {
      .question-navigation {
        padding: var(--spacing-lg);
      }
    }

    .question-nav-btn {
      width: 36px;
      height: 36px;
      border: 2px solid var(--color-border);
      background: var(--color-bg-secondary);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-weight: 500;
      transition: var(--transition-fast);
      font-size: 13px;
    }

    @media (min-width: 768px) {
      .question-nav-btn {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }
    }

    .question-nav-btn:hover {
      border-color: var(--color-primary);
      transform: scale(1.05);
    }

    @media (prefers-reduced-motion: reduce) {
      .question-nav-btn:hover {
        transform: none;
      }
    }

    .question-nav-btn.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .question-nav-btn.answered {
      background: var(--color-bg-success);
      border-color: var(--color-success);
    }

    .question-nav-btn.answered.active {
      background: var(--color-success);
      color: white;
    }

    .question-content {
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }

    @media (min-width: 768px) {
      .question-content {
        padding: var(--spacing-xl);
      }
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-bg-primary);
    }

    .question-number {
      font-weight: bold;
      color: var(--color-dark);
      font-size: 14px;
    }

    @media (min-width: 768px) {
      .question-number {
        font-size: 16px;
      }
    }

    .question-meta {
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    @media (min-width: 768px) {
      .question-meta {
        font-size: 14px;
      }
    }

    .question-text {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: var(--spacing-xl);
      color: var(--color-text-primary);
    }

    @media (min-width: 768px) {
      .question-text {
        font-size: 16px;
      }
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .option {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .option:hover {
      border-color: var(--color-primary);
      background: #fff8f0;
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .option:hover {
        transform: none;
      }
    }

    .option.selected {
      border-color: var(--color-primary);
      background: #fff8f0;
      box-shadow: var(--shadow-sm);
    }

    .option-key {
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-primary);
      border-radius: var(--border-radius-sm);
      font-weight: bold;
      color: var(--color-dark);
      transition: var(--transition-fast);
    }

    @media (min-width: 768px) {
      .option-key {
        min-width: 40px;
        height: 40px;
      }
    }

    .option.selected .option-key {
      background: var(--color-primary);
      color: white;
    }

    .option-text {
      flex: 1;
      line-height: 1.6;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    @media (min-width: 768px) {
      .option-text {
        font-size: 15px;
      }
    }

    .question-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .btn-secondary, .btn-finish {
      padding: 12px 24px;
      border: none;
      border-radius: var(--border-radius-sm);
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
      transition: var(--transition-fast);
      font-family: inherit;
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--color-dark);
      transform: translateY(-2px);
    }

    .btn-secondary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-secondary:hover:not(:disabled) {
        transform: none;
      }
    }

    .btn-finish {
      background: var(--color-success);
      color: white;
    }

    .btn-finish:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .btn-finish:active {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-finish:hover {
        transform: none;
      }
    }

    .finish-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-lg);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      max-width: 500px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .finish-modal, .modal-content {
        animation: none;
      }
    }

    .modal-content h3 {
      margin: 0 0 var(--spacing-md);
      color: var(--color-dark);
      font-size: 20px;
    }

    .modal-content p {
      margin: 0 0 var(--spacing-sm);
      color: var(--color-text-secondary);
      font-size: 15px;
    }

    .modal-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 12px 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
      font-family: inherit;
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
  `]
})
export class AttemptRunnerComponent implements OnInit, OnDestroy {
  attemptId!: string;
  exam: ExamResponse | null = null;
  questions: AttemptQuestionResponse[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: { [index: number]: string } = {};
  answeredQuestions = new Set<number>();
  timeRemaining = 10800;
  showFinishModal = false;
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService
  ) {}

  get currentQuestion(): AttemptQuestionResponse | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    return (this.answeredQuestions.size / this.questions.length) * 100;
  }

  ngOnInit(): void {
    this.attemptId = this.route.snapshot.paramMap.get('id')!;
    this.loadAttempt();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  loadAttempt(): void {
    this.attemptsApi.getAttempt(this.attemptId).subscribe({
      next: (attempt) => {
        this.loadExam(attempt.examId);
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Error loading attempt:', error);
      }
    });
  }

  loadExam(examId: string): void {
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
      }
    });
  }

  loadQuestions(): void {
    this.attemptsApi.getAttemptQuestions(this.attemptId).subscribe({
      next: (questions) => {
        this.questions = questions;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.finishAttempt();
      }
    });
  }

  selectAnswer(optionKey: string): void {
    this.selectedAnswers[this.currentQuestionIndex] = optionKey;
    this.answeredQuestions.add(this.currentQuestionIndex);

    if (this.currentQuestion) {
      this.attemptsApi.submitAnswer(
        this.attemptId,
        this.currentQuestion.questionId,
        { selectedOption: optionKey }
      ).subscribe({
        error: (error) => {
          console.error('Error submitting answer:', error);
        }
      });
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  confirmFinish(): void {
    this.showFinishModal = true;
  }

  finishAttempt(): void {
    this.timerSubscription?.unsubscribe();
    this.attemptsApi.finishAttempt(this.attemptId).subscribe({
      next: () => {
        this.router.navigate(['/attempt', this.attemptId, 'result']);
      },
      error: (error) => {
        console.error('Error finishing attempt:', error);
      }
    });
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

