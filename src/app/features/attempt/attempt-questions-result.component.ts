import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttemptQuestionsApiService } from '../../api/attempt-questions.service';
import { AttemptQuestionResponse } from '../../api/domain/attempt-question.model';

@Component({
  selector: 'app-attempt-questions-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="attempt-questions-result">
      <h2>Revisão das Questões</h2>
      <a class="btn-back" routerLink="/attempt/{{ route.snapshot.paramMap.get('id') }}/result">&larr; Voltar ao Resultado</a>
      @if (loading()) {
        <p>Carregando questões...</p>
      }
      @if (!loading()) {
        @if (questions().length) {
          @for (q of questions(); track q.questionId; let i = $index) {
            <div class="question-card" [class.correct]="isCorrect(q)" [class.incorrect]="!isCorrect(q)">
              <div class="question-header">
                <span class="question-index">Questão {{ i + 1 }}</span>
                <span class="result-chip" [class.correct-chip]="isCorrect(q)" [class.incorrect-chip]="!isCorrect(q)">
                  {{ isCorrect(q) ? 'Acertou' : 'Errou' }}
                </span>
              </div>
              <div class="question-text">{{ q.text }}</div>
              <ul class="options-list">
                @for (opt of q.options; track opt.key) {
                  <li [class.correct-option]="opt.isCorrect" [class.selected-option]="q.selectedOption === opt.key">
                    <span class="option-key">{{ opt.key }})</span>
                    <span class="option-text">{{ opt.text }}</span>
                    <span *ngIf="opt.isCorrect" class="correct-label">Correta</span>
                    <span *ngIf="q.selectedOption === opt.key" class="selected-label">Sua resposta</span>
                  </li>
                }
              </ul>
            </div>
          }
        } @else {
          <p>Nenhuma questão encontrada.</p>
        }
      }
    </div>
  `,
  styles: [`
    .attempt-questions-result {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 0;
    }
    .btn-back {
      display: inline-block;
      margin-bottom: 24px;
      background: #37475a;
      color: #fff;
      padding: 8px 18px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn-back:hover {
      background: #232f3e;
    }
    .question-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 32px;
      padding: 24px;
      border-left: 8px solid #ccc;
      transition: border-color 0.2s;
    }
    .question-card.correct {
      border-color: #4caf50;
    }
    .question-card.incorrect {
      border-color: #f44336;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .result-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      color: #fff;
      font-weight: 500;
    }
    .correct-chip {
      background: #4caf50;
    }
    .incorrect-chip {
      background: #f44336;
    }
    .question-text {
      font-size: 17px;
      margin-bottom: 12px;
      color: #222;
    }
    .options-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .options-list li {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      border-bottom: 1px solid #eee;
    }
    .options-list li:last-child {
      border-bottom: none;
    }
    .option-key {
      font-weight: bold;
      width: 24px;
      display: inline-block;
    }
    .correct-option {
      color: #388e3c;
      font-weight: 500;
    }
    .selected-option {
      background: #e3f2fd;
      border-radius: 4px;
      padding: 2px 6px;
    }
    .correct-label {
      background: #4caf50;
      color: #fff;
      border-radius: 8px;
      font-size: 12px;
      padding: 2px 8px;
      margin-left: 8px;
    }
    .selected-label {
      background: #1976d2;
      color: #fff;
      border-radius: 8px;
      font-size: 12px;
      padding: 2px 8px;
      margin-left: 8px;
    }
  `]
})
export class AttemptQuestionsResultComponent implements OnInit {
  questions = signal<AttemptQuestionResponse[]>([]);
  loading = signal(true);

  constructor(
    protected route: ActivatedRoute,
    private api: AttemptQuestionsApiService
  ) {}

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('id');
    if (attemptId) {
      this.api.getAttemptQuestions(attemptId).subscribe({
        next: (questions) => {
          this.questions.set(questions);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  isCorrect(q: AttemptQuestionResponse): boolean {
    const correct = q.options.find(opt => opt.isCorrect)?.key;
    return q.selectedOption === correct;
  }
}
