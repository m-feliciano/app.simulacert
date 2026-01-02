import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttemptQuestionsApiService } from '../../api/attempt-questions.service';
import { AttemptQuestionResponse } from '../../api/domain/attempt-question.model';

@Component({
  selector: 'app-attempt-questions-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./attempt-questions-result.component.css'],
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
                    @if (opt.isCorrect) {
                      <span class="correct-label">Correta</span>
                    }
                    @if (q.selectedOption === opt.key) {
                      <span class="selected-label">Sua resposta</span>
                    }
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
  `
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
