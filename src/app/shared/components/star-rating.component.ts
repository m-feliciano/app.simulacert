import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating">
      @for (star of stars; track star; let i = $index) {
        <button
          type="button"
          class="star"
          [class.filled]="i < value()"
          [class.hovered]="!readonly && i < hoveredValue()"
          [disabled]="readonly"
          (click)="onStarClick(i + 1)"
          (mouseenter)="onStarHover(i + 1)"
          (mouseleave)="onStarLeave()"
        >
          {{ i < value() ? '★' : '☆' }}
        </button>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      gap: 4px;
    }

    .star {
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #ddd;
      padding: 0;
      transition: color 0.2s, transform 0.1s;
    }

    .star:disabled {
      cursor: default;
    }

    .star.filled {
      color: #ff9900;
    }

    .star:not(:disabled):hover {
      transform: scale(1.1);
    }

    .star.hovered {
      color: #ff9900;
    }
  `]
})
export class StarRatingComponent {
  @Input() set rating(val: number) {
    this.value.set(val);
  }
  @Input() readonly = false;
  @Output() ratingChange = new EventEmitter<number>();

  value = signal(0);
  hoveredValue = signal(0);
  stars = [1, 2, 3, 4, 5];

  onStarClick(rating: number): void {
    if (!this.readonly) {
      this.value.set(rating);
      this.ratingChange.emit(rating);
    }
  }

  onStarHover(rating: number): void {
    if (!this.readonly) {
      this.hoveredValue.set(rating);
    }
  }

  onStarLeave(): void {
    if (!this.readonly) {
      this.hoveredValue.set(0);
    }
  }
}

