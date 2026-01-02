import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="exams-container">
      <h1>Exames Disponíveis</h1>

      @if (loading) {
        <div class="loading-state">
          <p>Carregando exames...</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ error }}</p>
        </div>
      }

      @if (!loading && !error && exams.length > 0) {
        <div class="exams-grid">
          @for (exam of exams; track exam.id) {
            <div class="exam-card">
              <h3>{{ exam.title }}</h3>
              @if (exam.description) {
                <p class="exam-description">{{ exam.description }}</p>
              }
              <a [routerLink]="['/exams', exam.id]" class="btn-primary">Ver Detalhes</a>
            </div>
          }
        </div>
      }

      @if (!loading && !error && exams.length === 0) {
        <div class="empty-state">
          <p>Nenhum exame disponível no momento.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .exams-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 var(--spacing-xl);
      color: var(--color-dark);
      font-size: 28px;
    }

    @media (min-width: 768px) {
      h1 {
        font-size: 32px;
      }
    }

    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);
    }

    @media (min-width: 768px) {
      .exams-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    .exam-card {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: var(--transition-fast);
    }

    .exam-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .exam-card:hover {
        transform: none;
      }
    }

    h3 {
      margin: 0 0 var(--spacing-md);
      color: var(--color-dark);
      font-size: 18px;
    }

    @media (min-width: 768px) {
      h3 {
        font-size: 20px;
      }
    }

    .exam-description {
      flex: 1;
      margin: 0 0 var(--spacing-lg);
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 14px;
    }

    .btn-primary {
      display: inline-block;
      padding: 10px 20px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      text-align: center;
      font-weight: 500;
      transition: var(--transition-fast);
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary:hover {
        transform: none;
      }
    }

    .empty-state {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xxl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    @media (min-width: 768px) {
      .empty-state {
        padding: 60px;
      }
    }

    .empty-state p {
      color: var(--color-text-light);
      font-size: 15px;
      margin: 0;
      font-style: italic;
    }

    @media (min-width: 768px) {
      .empty-state p {
        font-size: 16px;
      }
    }

    .loading-state, .error-state {
      background: var(--color-bg-secondary);
      padding: var(--spacing-xxl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .loading-state p {
      color: var(--color-text-secondary);
      font-size: 15px;
      margin: 0;
    }

    .error-state {
      background: var(--color-bg-danger);
    }

    .error-state p {
      color: #721c24;
      font-size: 15px;
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class ExamsListComponent implements OnInit {
  exams: ExamResponse[] = [];
  loading = false;
  error = '';

  constructor(
    private examsApi: ExamsApiService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.examsApi.getAllExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.error = 'Erro ao carregar exames. Por favor, tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

