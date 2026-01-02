import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsApiService } from '../../api/exams.service';
import { AttemptsApiService } from '../../api/attempts.service';
import { AuthFacade } from '../../core/auth/auth.facade';
import { ExamResponse } from '../../api/domain';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="exam-detail" *ngIf="exam">
      <div class="breadcrumb">
        <a (click)="goBack()" class="back-link">← Voltar</a>
      </div>

      <div class="exam-header">
        <h1>{{ exam.title }}</h1>
        <p class="exam-description" *ngIf="exam.description">{{ exam.description }}</p>
      </div>

      <div class="exam-info">
        <div class="info-card">
          <h3>Informações do Exame</h3>
          <ul>
            <li><strong>Tipo:</strong> Simulado AWS</li>
            <li><strong>Duração:</strong> 180 minutos</li>
            <li><strong>Questões:</strong> 65</li>
            <li><strong>Pontuação mínima:</strong> 72%</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>Regras</h3>
          <ul>
            <li>Você terá 180 minutos para completar o exame</li>
            <li>São 65 questões de múltipla escolha</li>
            <li>Não é possível pausar o exame</li>
            <li>Você pode revisar suas respostas antes de finalizar</li>
          </ul>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" (click)="startExam()" [disabled]="loading">
          {{ loading ? 'Iniciando...' : 'Iniciar Exame' }}
        </button>
      </div>

      <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .exam-detail {
      max-width: 1000px;
      margin: 0 auto;
    }

    .breadcrumb {
      margin-bottom: var(--spacing-lg);
    }

    .back-link {
      color: var(--color-primary);
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .back-link:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }

    .exam-header {
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-xl);
    }

    @media (min-width: 768px) {
      .exam-header {
        padding: var(--spacing-xxl);
      }
    }

    h1 {
      margin: 0 0 var(--spacing-md);
      color: var(--color-dark);
      font-size: 24px;
    }

    @media (min-width: 768px) {
      h1 {
        font-size: 32px;
      }
    }

    .exam-description {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 15px;
      line-height: 1.6;
    }

    @media (min-width: 768px) {
      .exam-description {
        font-size: 16px;
      }
    }

    .exam-info {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    @media (min-width: 768px) {
      .exam-info {
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      }
    }

    .info-card {
      background: var(--color-bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }

    @media (min-width: 768px) {
      .info-card {
        padding: var(--spacing-xl);
      }
    }

    h3 {
      margin: 0 0 var(--spacing-lg);
      color: var(--color-dark);
      font-size: 18px;
    }

    @media (min-width: 768px) {
      h3 {
        font-size: 20px;
      }
    }

    ul {
      margin: 0;
      padding-left: var(--spacing-lg);
    }

    li {
      margin-bottom: var(--spacing-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 14px;
    }

    @media (min-width: 768px) {
      li {
        font-size: 15px;
      }
    }

    .actions {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .btn-primary {
      padding: 15px 40px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
      font-family: inherit;
    }

    @media (min-width: 768px) {
      .btn-primary {
        font-size: 18px;
      }
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary:hover:not(:disabled) {
        transform: none;
      }
    }

    .error {
      background: var(--color-bg-danger);
      color: #721c24;
      padding: var(--spacing-md);
      border-radius: var(--border-radius-sm);
      text-align: center;
      font-size: 14px;
    }
  `]
})
export class ExamDetailComponent implements OnInit {
  exam: ExamResponse | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsApi: ExamsApiService,
    private attemptsApi: AttemptsApiService,
    private authFacade: AuthFacade
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(examId);
    }
  }

  loadExam(examId: string): void {
    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.errorMessage = 'Erro ao carregar exame';
      }
    });
  }

  startExam(): void {
    if (!this.exam || !this.authFacade.currentUser) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.attemptsApi.startAttempt({
      examId: this.exam.id,
      userId: this.authFacade.currentUser.id,
      questionCount: 65
    }).subscribe({
      next: (attempt) => {
        this.router.navigate(['/attempt', attempt.id, 'run']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao iniciar exame';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }
}

