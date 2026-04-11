import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AttemptsApiService} from '../../api/attempts.service';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptResponse, AttemptStatus, ExamResponse} from '../../api/domain';
import {ReviewCardComponent} from '../../shared/components/review-card.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';
import {FormatDatePipe} from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent, SeoHeadDirective, FormatDatePipe],
  template: `
    <div seoHead>
      <div class="result-container">
        @if (loading()) {
          <div class="loading-state">
            <p>Carregando resultado...</p>
          </div>
        }

        @if (error()) {
          <div class="error-state">
            <p>{{ error() }}</p>
            <a routerLink="/exams" class="btn-secondary">Voltar aos Exames</a>
          </div>
        }

        @if (!loading() && !error() && attempt() && exam()) {
          <div class="result-header">
            <h1>Resultado do Exame</h1>
            <p class="exam-title">{{ exam()!.title }}</p>
          </div>

          <app-review-card
            [attemptId]="attempt()!.id"
            [finalized]="isAttemptFinalized()">
          </app-review-card>

          <div class="score-card" [class]="getColorClass()">
            <div class="score-label">Sua Pontuação</div>
            <div class="score-value">{{ attempt()!.score ?? 0 }}%</div>
            <div class="score-status">{{ isPassed ? '✓ Aprovado' : '✗ Reprovado' }}</div>
            <div class="score-message">
              {{ isPassed ? 'Parabéns! Você foi aprovado.' : 'Pontuação mínima: 72%' }}
            </div>
          </div>

          <div class="attempt-details">
            <div class="detail-card">
              <div class="detail-label">Data de Início</div>
              <div class="detail-value">{{ attempt()!.startedAt | formatDate }}</div>
            </div>

            <div class="detail-card">
              <div class="detail-label">Data de Conclusão</div>
              <div class="detail-value">{{ attempt()!.finishedAt! | formatDate }}</div>
            </div>

            <div class="detail-card">
              <div class="detail-label">Tempo Total</div>
              <div class="detail-value">{{ calculateDuration() }}</div>
            </div>

            <div class="detail-card">
              <div class="detail-label">Questões</div>
              <div class="detail-value">{{ formatQuestionsText() }}</div>
            </div>
          </div>

          <div class="actions">
            <a routerLink="/exams" class="btn-secondary">Ver Exames</a>
            <a routerLink="/stats" class="btn-primary">Ver Estatísticas</a>
            <a routerLink="/dashboard" class="btn-secondary">Dashboard</a>

            @if (attempt()?.status == AttemptStatus.COMPLETED) {
              <a [routerLink]="['/attempt', attempt()?.id, 'questions']" class="btn-primary">Ver Questões</a>
            }

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .result-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .result-header {
      text-align: center;
      margin-bottom: 40px;
    }

    h1 {
      margin: 0 0 10px;
      color: #232f3e;
      font-size: 32px;
    }

    .exam-title {
      margin: 0;
      color: #666;
      font-size: 18px;
    }

    .score-card {
      background: white;
      padding: 60px 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      margin-bottom: 40px;
      border: 4px solid transparent;
    }

    .score-card.passed {
      border-color: #28a745;
    }

    .score-card.failed {
      border-color: #d13212;
    }

    .score-label {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }

    .score-value {
      font-size: 72px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .score-card.passed .score-value {
      color: #28a745;
    }

    .score-card.warning .score-value {
      color: #ff9900;
    }

    .score-card.failed .score-value {
      color: #d13212;
    }

    .score-status {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .score-card.passed .score-status {
      color: #28a745;
    }

    .score-card.failed .score-status {
      color: #d13212;
    }

    .score-card.warning .score-status {
      color: #ff9900;
    }

    .score-message {
      font-size: 16px;
      color: #666;
    }

    .attempt-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .detail-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .detail-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .detail-value {
      font-size: 18px;
      font-weight: bold;
      color: #232f3e;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
    }

    .btn-primary {
      background: #ff9900;
      color: white;
    }

    .btn-primary:hover {
      background: #ec7211;
    }

    .btn-secondary {
      background: #37475a;
      color: white;
    }

    .btn-secondary:hover {
      background: #232f3e;
    }
  `]
})
export class ResultComponent implements OnInit {
  protected readonly AttemptStatus = AttemptStatus;

  attempt = signal<AttemptResponse | null>(null);
  exam = signal<ExamResponse | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService,
    private seoFactory: SeoFactoryService,
    private seoFacade: SeoFacadeService,
  ) {
    this.seoFacade.set(this.seoFactory.website({
      title: 'Resultado do Exame | SimulaCert',
      description: 'Veja o resultado detalhado do seu simulado na SimulaCert.',
      canonicalPath: '/attempt/result',
      robots: 'noindex, nofollow',
      jsonLdId: 'result',
    }));
  }

  get isPassed(): boolean {
    const score = this.attempt()?.score || 0;
    return score >= 72;
  }

  isAttemptFinalized(): boolean {
    return this.attempt()?.status === AttemptStatus.COMPLETED;
  }

  getColorClass(): string {
    const score = this.attempt()?.score || 0;
    if (this.isPassed) {
      return 'passed';
    } else if (score >= 40) {
      return 'warning';
    } else {
      return 'failed';
    }
  }

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('id');
    if (attemptId) {
      this.loadAttempt(attemptId);
    }
  }

  loadAttempt(attemptId: string): void {
    this.attemptsApi.getAttempt(attemptId).subscribe({
      next: (attempt) => {
        this.attempt.set(attempt);
        this.loadExam(attempt.examId);
      },
      error: () => {
        this.error.set('Erro ao carregar resultado. Por favor, tente novamente.');
        this.loading.set(false);
      }
    });
  }

  loadExam(examId: string): void {
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar informações do exame.');
        this.loading.set(false);
      }
    });
  }

  calculateDuration(): string {
    const currentAttempt = this.attempt();
    if (!currentAttempt?.startedAt || !currentAttempt?.finishedAt) {
      return '-';
    }

    const start = new Date(currentAttempt.startedAt).getTime();
    const end = new Date(currentAttempt.finishedAt).getTime();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return `${hours}h ${minutes}min`;
  }


  formatQuestionsText() : string {
    const score = this.attempt()!.score;
    const questions = this.attempt()!.questionIds.length;

    if (score === undefined) {
      return `Nenhuma questão correta`;
    }

    if (score === 100) {
      return `Todas as ${questions} corretas`;
    }

    const correctAnswers = Math.round((score! / 100) * questions);
    return `${correctAnswers} de ${questions} corretas`;
  }
}
