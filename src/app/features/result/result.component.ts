import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttemptsApiService } from '../../api/attempts.service';
import { ExamsApiService } from '../../api/exams.service';
import { AttemptResponse, ExamResponse } from '../../api/domain';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="result-container">
      @if (loading) {
        <div class="loading-state">
          <p>Carregando resultado...</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ error }}</p>
          <a routerLink="/exams" class="btn-secondary">Voltar aos Exames</a>
        </div>
      }

      @if (!loading && !error && attempt && exam) {
        <div class="result-header">
          <h1>Resultado do Exame</h1>
          <p class="exam-title">{{ exam.title }}</p>
        </div>

        <div class="score-card" [class.passed]="isPassed" [class.failed]="!isPassed">
          <div class="score-label">Sua Pontuação</div>
          <div class="score-value">{{ attempt.score }}%</div>
          <div class="score-status">{{ isPassed ? '✓ Aprovado' : '✗ Reprovado' }}</div>
          <div class="score-message">
            {{ isPassed ? 'Parabéns! Você foi aprovado.' : 'Pontuação mínima: 72%' }}
          </div>
        </div>

        <div class="attempt-details">
          <div class="detail-card">
            <div class="detail-label">Data de Início</div>
            <div class="detail-value">{{ formatDate(attempt.startedAt) }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">Data de Conclusão</div>
            <div class="detail-value">{{ formatDate(attempt.finishedAt!) }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">Tempo Total</div>
            <div class="detail-value">{{ calculateDuration() }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">Questões</div>
            <div class="detail-value">{{ attempt.questionIds.length }}</div>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/exams" class="btn-secondary">Ver Exames</a>
          <a routerLink="/stats" class="btn-primary">Ver Estatísticas</a>
          <a routerLink="/dashboard" class="btn-secondary">Dashboard</a>
        </div>
      }
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
  attempt: AttemptResponse | null = null;
  exam: ExamResponse | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptsApi: AttemptsApiService,
    private examsApi: ExamsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  get isPassed(): boolean {
    return (this.attempt?.score || 0) >= 72;
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
        this.attempt = attempt;
        this.loadExam(attempt.examId);
      },
      error: (error) => {
        console.error('Error loading attempt:', error);
        this.error = 'Erro ao carregar resultado. Por favor, tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadExam(examId: string): void {
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.error = 'Erro ao carregar informações do exame.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(): string {
    if (!this.attempt?.startedAt || !this.attempt?.finishedAt) {
      return '-';
    }

    const start = new Date(this.attempt.startedAt).getTime();
    const end = new Date(this.attempt.finishedAt).getTime();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return `${hours}h ${minutes}min`;
  }
}

