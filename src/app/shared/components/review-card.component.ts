import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsApiService } from '../../api/reviews.service';
import { ReviewResponse } from '../../api/domain';
import { StarRatingComponent } from './star-rating.component';
import {FormatDatePipe} from '../pipes/format-date.pipe';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, FormatDatePipe],
  template: `
    <div class="review-card">
      @if (!finalized) {
        <div class="not-finalized">
          <p>A avaliação estará disponível após a conclusão da tentativa.</p>
        </div>
      } @else {
        @if (loading()) {
          <div class="loading">Carregando avaliação...</div>
        } @else if (existingReview()) {
          <div class="review-readonly">
            <h3>Sua Avaliação</h3>
            <app-star-rating
              [rating]="existingReview()!.rating"
              [readonly]="true">
            </app-star-rating>
            @if (existingReview()!.comment) {
              <p class="comment-readonly">{{ existingReview()!.comment }}</p>
            }
            <p class="review-date">Avaliado em {{ existingReview()!.createdAt | formatDate }}</p>
          </div>
        } @else {
          <div class="review-form">
            <h3>Avaliar este Exame</h3>
            <p class="review-description">Compartilhe sua experiência com este simulado</p>

            <div class="rating-section">
              <label>Nota *</label>
              <app-star-rating
                [rating]="rating()"
                (ratingChange)="onRatingChange($event)">
              </app-star-rating>
            </div>

            <div class="comment-section">
              <label for="comment">Comentário (opcional)</label>
              <textarea
                id="comment"
                [(ngModel)]="comment"
                placeholder="Compartilhe sua opinião sobre o exame..."
                rows="4"
                maxlength="500"
                [disabled]="submitting()"
              ></textarea>
              <div class="char-count">{{ comment.length }}/500</div>
            </div>

            @if (error()) {
              <div class="error-message">{{ error() }}</div>
            }

            @if (success()) {
              <div class="success-message">Avaliação enviada com sucesso!</div>
            }

            <button
              type="button"
              class="submit-btn"
              [disabled]="!canSubmit() || submitting()"
              (click)="submitReview()"
            >
              {{ submitting() ? 'Enviando...' : 'Enviar Avaliação' }}
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .review-card {
      background: var(--surface);
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .not-finalized {
      text-align: center;
      color: var(--muted);
      padding: 20px;
    }

    .loading {
      text-align: center;
      color: var(--muted);
      padding: 20px;
    }

    h3 {
      margin: 0 0 15px;
      color: var(--text);
      font-size: 1.375rem;
    }

    .review-description {
      margin: 0 0 20px;
      color: var(--muted);
      font-size: 0.875rem;
    }

    .rating-section {
      margin-bottom: 20px;
    }

    .rating-section label {
      display: block;
      margin-bottom: 10px;
      color: var(--text-2);
      font-weight: 500;
    }

    .comment-section {
      margin-bottom: 20px;
    }

    .comment-section label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-2);
      font-weight: 500;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      box-sizing: border-box;
      background: var(--surface-2);
      color: var(--text);
    }

    textarea:focus {
      outline: none;
      border-color: #ff9900;
    }

    textarea:disabled {
      background: var(--surface);
      cursor: not-allowed;
    }

    .char-count {
      text-align: right;
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 4px;
    }

    .submit-btn {
      background: var(--surface-2);
      color: var(--text);
      border: none;
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--surface-3);
    }

    .submit-btn:disabled {
      cursor: not-allowed;
    }

    .error-message {
      background: #fee;
      color: #d13212;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      border: 1px solid #fcc;
    }

    .success-message {
      background: #efe;
      color: #28a745;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      border: 1px solid #cfc;
    }

    .review-readonly {
      text-align: center;
    }

    .comment-readonly {
      margin: 20px 0;
      padding: 15px;
      background: var(--surface-2);
      border-radius: var(--radius-md);
      color: var(--text-2);
      font-style: italic;
      font-size: 0.9375rem;
    }

    .review-date {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 15px;
    }
  `]
})
export class ReviewCardComponent implements OnInit {
  @Input() attemptId!: string;
  @Input() finalized = false;

  existingReview = signal<ReviewResponse | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  success = signal(false);
  rating = signal(0);
  comment = '';

  constructor(private readonly reviewsApi: ReviewsApiService) {}

  ngOnInit(): void {
    if (this.finalized && this.attemptId) {
      this.loadExistingReview();
    }
  }

  loadExistingReview(): void {
    this.loading.set(true);
    this.reviewsApi.getReviewByAttempt(this.attemptId).subscribe({
      next: (review) => {
        this.existingReview.set(review);
        this.loading.set(false);
      },
      error: () => {
        // No review found - this is expected for new attempts
        this.loading.set(false);
      }
    });
  }

  onRatingChange(newRating: number): void {
    this.rating.set(newRating);
    this.error.set('');
  }

  canSubmit(): boolean {
    return this.rating() >= 1 && this.rating() <= 5;
  }

  submitReview(): void {
    if (!this.canSubmit() || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.success.set(false);

    const request = {
      attemptId: this.attemptId,
      rating: this.rating(),
      comment: this.comment.trim() || undefined
    };

    this.reviewsApi.createReview(request).subscribe({
      next: (review) => {
        this.existingReview.set(review);
        this.success.set(true);
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Erro ao enviar avaliação. Por favor, tente novamente.');
        this.submitting.set(false);
      }
    });
  }
}

