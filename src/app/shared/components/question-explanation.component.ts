import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExplanationsApiService } from '../../api/explanations.service';
import { ExplanationResponse } from '../../api/domain';

@Component({
  selector: 'app-question-explanation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="explanation-container">
      @if (!showExplanation()) {
        <button
          class="btn-explain"
          (click)="requestExplanation()"
          [disabled]="loading()">
          {{ loading() ? 'Gerando explicação...' : '💡 Explique essa questão' }}
        </button>
      }

      @if (error()) {
        <div class="error-message">
          {{ error() }}
        </div>
      }

      @if (showExplanation() && explanation()) {
        <div class="explanation-card">
          <div class="explanation-header">
            <h4>Explicação da IA</h4>
            <button class="btn-close" (click)="closeExplanation()">✕</button>
          </div>

          <div class="explanation-content">
            {{ explanation()!.content }}
          </div>

          <div class="explanation-footer">
            <span class="ai-disclaimer">Explicação gerada com assistência de IA</span>
            <span class="model-info">{{ explanation()!.model }}</span>
          </div>

          @if (!feedbackSubmitted()) {
            <div class="feedback-section">
              <h5>Esta explicação foi útil?</h5>
              <div class="rating-stars">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    class="star-btn"
                    [class.selected]="rating() >= star"
                    (click)="setRating(star)">
                    {{ rating() >= star ? '★' : '☆' }}
                  </button>
                }
              </div>

              @if (rating() > 0) {
                <div class="feedback-comment">
                  <textarea
                    [(ngModel)]="comment"
                    placeholder="Deixe um comentário (opcional)"
                    rows="3"></textarea>
                  <button
                    class="btn-submit-feedback"
                    (click)="submitFeedback()"
                    [disabled]="submittingFeedback()">
                    {{ submittingFeedback() ? 'Enviando...' : 'Enviar Avaliação' }}
                  </button>
                </div>
              }
            </div>
          }

          @if (feedbackSubmitted()) {
            <div class="feedback-success">
              ✓ Obrigado pelo seu feedback!
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .explanation-container {
      margin-top: var(--spacing-md);
    }

    .btn-explain {
      background: var(--color-primary);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: var(--border-radius-sm);
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
      font-size: 14px;
      font-family: inherit;
    }

    .btn-explain:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .btn-explain:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-explain:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background: var(--color-bg-danger);
      color: var(--color-danger);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      margin-top: var(--spacing-sm);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-message::before {
      content: '⚠️';
      font-size: 14px;
    }

    .explanation-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-light);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-lg);
      margin-top: var(--spacing-md);
      box-shadow: var(--shadow-sm);
    }

    .explanation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .explanation-header h4 {
      margin: 0;
      color: var(--color-dark);
      font-size: 16px;
      font-weight: 600;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast);
    }

    .btn-close:hover {
      color: var(--color-dark);
    }

    .explanation-content {
      line-height: 1.6;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
      white-space: pre-wrap;
    }

    .explanation-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-border-light);
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .ai-disclaimer {
      font-style: italic;
    }

    .model-info {
      font-weight: 500;
      color: var(--color-text-light);
    }

    .feedback-section {
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border-light);
    }

    .feedback-section h5 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-dark);
      font-size: 14px;
      font-weight: 600;
    }

    .rating-stars {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .star-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: var(--color-border);
      padding: 0;
      transition: var(--transition-fast);
    }

    .star-btn.selected {
      color: var(--color-primary);
    }

    .star-btn:hover {
      transform: scale(1.1);
    }

    .feedback-comment {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .feedback-comment textarea {
      width: 100%;
      padding: var(--spacing-sm);
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      transition: var(--transition-fast);
    }

    .feedback-comment textarea:hover {
      border-color: var(--color-border-light);
    }

    .feedback-comment textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
    }

    .btn-submit-feedback {
      align-self: flex-start;
      background: var(--color-secondary);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: var(--border-radius-sm);
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
      font-size: 14px;
      font-family: inherit;
    }

    .btn-submit-feedback:hover:not(:disabled) {
      background: var(--color-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .btn-submit-feedback:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-submit-feedback:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .feedback-success {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-sm);
      background: var(--color-bg-success);
      color: var(--color-success);
      border-radius: var(--border-radius-sm);
      text-align: center;
      font-weight: 500;
    }
  `]
})
export class QuestionExplanationComponent {
  @Input() questionId!: string;
  @Input() attemptId!: string;
  @Input() certification!: string;

  showExplanation = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  explanation = signal<ExplanationResponse | null>(null);

  rating = signal(0);
  comment = '';
  submittingFeedback = signal(false);
  feedbackSubmitted = signal(false);

  constructor(private explanationsApi: ExplanationsApiService) {}

  requestExplanation(): void {
    this.loading.set(true);
    this.error.set(null);

    const request = {
      questionId: this.questionId,
      examAttemptId: this.attemptId,
      language: 'pt-br',
      certification: this.certification
    };

    this.explanationsApi.generateExplanation(this.questionId, request).subscribe({
      next: (response) => {
        this.explanation.set(response);
        this.showExplanation.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao gerar explicação. Tente novamente.');
        this.loading.set(false);
        console.error('Error generating explanation:', err);
      }
    });
  }

  closeExplanation(): void {
    this.showExplanation.set(false);
    this.rating.set(0);
    this.comment = '';
    this.feedbackSubmitted.set(false);
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  submitFeedback(): void {
    const explanationId = this.explanation()?.explanationId;
    if (!explanationId || this.rating() === 0) return;

    this.submittingFeedback.set(true);

    const feedback = {
      rating: this.rating(),
      comment: this.comment.trim() || undefined
    };

    this.explanationsApi.submitFeedback(explanationId, feedback).subscribe({
      next: () => {
        this.feedbackSubmitted.set(true);
        this.submittingFeedback.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao enviar feedback. Tente novamente.');
        this.submittingFeedback.set(false);
        console.error('Error submitting feedback:', err);
      }
    });
  }
}

