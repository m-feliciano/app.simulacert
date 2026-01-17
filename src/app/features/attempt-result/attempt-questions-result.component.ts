import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AttemptQuestionsApiService } from '../../api/attempt-questions.service';
import { AttemptsApiService } from '../../api/attempts.service';
import { ExamsApiService } from '../../api/exams.service';
import { AttemptQuestionResponse } from '../../api/domain/attempt-question.model';
import { AttemptResponse, ExamResponse } from '../../api/domain';
import { QuestionExplanationComponent } from '../../shared/components/question-explanation.component';

@Component({
  selector: 'app-attempt-questions-result',
  standalone: true,
  imports: [CommonModule, RouterLink, QuestionExplanationComponent],
  styleUrls: ['./attempt-questions-result.component.css'],
  template: `
    <div class="attempt-questions-result">
      <h2>Revisão das Questões</h2>

      <div style="justify-self: end;">
        <a class="btn-back"
           routerLink="/attempt/{{ route.snapshot.paramMap.get('id') }}/result">&larr; Voltar ao Resultado
        </a>
      </div>

      @if (loading()) {
        <p>Carregando questões...</p>
      } @else {

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
                  <li [class.correct-option]="opt.isCorrect" [class.selected-option]="isSelectedOption(q, opt.key)">
                    <span class="option-key">{{ opt.key }})</span>
                    <span class="option-text">{{ opt.text }}</span>
                    @if (opt.isCorrect) {
                      <span class="correct-label">Correta</span>
                    }
                    @if (isSelectedOption(q, opt.key)) {
                      <span class="selected-label">Sua resposta</span>
                    }
                  </li>
                }
              </ul>

              @if (attempt() && exam()) {
                <app-question-explanation
                  [questionId]="q.questionId"
                  [attemptId]="attempt()!.id"
                  [certification]="exam()!.title">
                </app-question-explanation>
              }
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
  attempt = signal<AttemptResponse | null>(null);
  exam = signal<ExamResponse | null>(null);
  loading = signal(true);

  constructor(
    protected route: ActivatedRoute,
    private api: AttemptQuestionsApiService,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService
  ) {}

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('id');
    if (attemptId) {
      forkJoin({
        questions: this.api.getAttemptQuestions(attemptId),
        attempt: this.attemptsApi.getAttempt(attemptId)
      }).subscribe({
        next: ({ questions, attempt }) => {
          this.questions.set(questions);
          this.attempt.set(attempt);

          this.examsApi.getExam(attempt.examId).subscribe({
            next: (exam) => {
              this.exam.set(exam);
              this.loading.set(false);
            },
            error: () => {
              this.loading.set(false);
            }
          });
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
    const correctOptions = q.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.key)
      .sort()
      .join(',');

    const selectedOptions = q.selectedOption
      ? q.selectedOption.split(',').map(s => s.trim()).sort().join(',')
      : '';

    return selectedOptions === correctOptions;
  }

  isSelectedOption(q: AttemptQuestionResponse, optionKey: string): boolean {
    if (!q.selectedOption) return false;
    const selected = q.selectedOption.split(',').map(s => s.trim());
    return selected.includes(optionKey);
  }
}
