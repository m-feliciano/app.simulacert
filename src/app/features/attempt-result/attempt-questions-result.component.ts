import {Component, effect, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {forkJoin} from 'rxjs';
import {AttemptQuestionsApiService} from '../../api/attempt-questions.service';
import {AttemptsApiService} from '../../api/attempts.service';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptQuestionResponse} from '../../api/domain/attempt-question.model';
import {AttemptResponse, ExamResponse, ExplanationResponse} from '../../api/domain';
import {QuestionExplanationComponent} from '../../shared/components/question-explanation.component';

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
           routerLink="/attempt/{{ route.snapshot.paramMap.get('id') }}/result">&larr; Voltar
        </a>
      </div>

      <div class="filter-bar">
        <button [class.active]="filter() === 'all'" (click)="setFilter('all')">{{ questions().length }} todas</button>
        <button [class.active]="filter() === 'correct'" (click)="setFilter('correct')">{{ filterBy('correct').length }}
          corretas
        </button>
        <button [class.active]="filter() === 'incorrect'"
                (click)="setFilter('incorrect')">{{ filterBy('incorrect').length }} incorretas
        </button>
      </div>

      @if (loading()) {
        <p>Carregando questões...</p>
      } @else {

        @if (filteredQuestions().length) {
          @for (q of filteredQuestions(); track q.questionId; let i = $index) {
            <div class="question-card" [class.correct]="isCorrect(q)" [class.incorrect]="!isCorrect(q)">
              <div class="question-header">
                <span class="question-index">Questão {{ q.questionCode }}</span>
              </div>
              <div class="question-text">{{ q.text }}</div>

              <ul class="options-list">
                @for (opt of q.options; track opt.key) {
                  <li [class.correct-option]="opt.isCorrect"
                      [class.selected-option]="isSelectedOption(q, opt.key)"
                      [class.incorrect-option]="isSelectedOption(q, opt.key) && !opt.isCorrect">

                    <span class="option-key">{{ opt.key }})</span>
                    <span class="option-text">{{ opt.text }}</span>
                  </li>
                }
              </ul>

              @if (attempt() && exam()) {
                <app-question-explanation
                  [questionId]="q.questionId"
                  [explanation]="explanations()[q.questionId]"
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

  filter = signal<'all' | 'correct' | 'incorrect'>('all');
  filteredQuestions = signal<AttemptQuestionResponse[]>([]);
  explanations = signal<Record<string, ExplanationResponse>>({});

  private readonly effectRef = effect(() => {
    this.updateFilteredQuestions();
  });

  constructor(
    protected route: ActivatedRoute,
    private readonly api: AttemptQuestionsApiService,
    private readonly attemptsApi: AttemptsApiService,
    private readonly examsApi: ExamsApiService
  ) {
  }

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

  setFilter(f: 'all' | 'correct' | 'incorrect') {
    this.filter.set(f);
  }

  private updateFilteredQuestions() {
    const all = this.questions();
    const f = this.filter();

    if (f === 'incorrect') {
      this.filteredQuestions.set(all.filter(q => !this.isCorrect(q)));

    } else if (f === 'correct') {
      this.filteredQuestions.set(all.filter(q => this.isCorrect(q)));

    } else {
      this.filteredQuestions.set(all);
    }
  }

  filterBy(f: 'all' | 'correct' | 'incorrect'): AttemptQuestionResponse[] {
    if (f === 'incorrect') {
      return this.questions().filter(q => !this.isCorrect(q));

    } else if (f === 'correct') {
      return this.questions().filter(q => this.isCorrect(q));

    } else {
      return this.questions();
    }
  }

  isCorrect(q: AttemptQuestionResponse): boolean {
    const correctOptions = q.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.key)
      .sort((a, b) => a.localeCompare(b))
      .join(',');

    const selectedOptions = q.selectedOption
      ? q.selectedOption.split(',')
        .map(s => s.trim())
        .sort((a, b) => a.localeCompare(b)).join(',')
      : '';

    return selectedOptions === correctOptions;
  }

  isSelectedOption(q: AttemptQuestionResponse, optionKey: string): boolean {
    if (!q.selectedOption) return false;
    const selected = q.selectedOption.split(',').map(s => s.trim());
    return selected.includes(optionKey);
  }
}
