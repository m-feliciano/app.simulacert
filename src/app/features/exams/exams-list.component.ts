import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';
import {AuthFacade} from '../../core/auth/auth.facade';
import {Router} from '@angular/router';
import {RegisterPromptModalComponent} from '../../shared/components/register-prompt-modal.component';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [CommonModule, RegisterPromptModalComponent],
  template: `
    @if (showRegisterPrompt()) {
      <app-register-prompt-modal (register)="goToLogin()"
                                 (anonymous)="createAnonymousAndStay()"
                                 (close)="showRegisterPrompt.set(false)"
                                 [loading]="loadingAnonymous()">
      </app-register-prompt-modal>
    }
    <div class="exams-container">
      <h1>Exames Disponíveis</h1>

      @if (loading()) {
        <div class="loading-state">
          <p>Carregando exames...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
        </div>
      }

      @if (!loading() && !error() && exams().length > 0) {
        <div class="exams-grid">
          @for (exam of exams(); track exam.id) {
            <div class="exam-card">
              <div class="exam-header">
                <h3>{{ exam.title }}</h3>
                @if (exam.difficulty) {
                  <span class="difficulty-badge" [class]="'difficulty-' + exam.difficulty.toLowerCase()">
                    {{ getDifficultyLabel(exam.difficulty) }}
                  </span>
                }
              </div>

              @if (exam.description) {
                <p class="exam-description">{{ exam.description }}</p>
              }

              <div class="exam-meta">
                @if (exam.totalQuestions) {
                  <div class="meta-item">
                    <span class="meta-icon">📝</span>
                    <span class="meta-text">{{ exam.totalQuestions }} questões</span>
                  </div>
                }
                @if (exam.durationMinutes) {
                  <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span class="meta-text">{{ exam.durationMinutes }} min</span>
                  </div>
                }
              </div>

              <a class="btn-primary" (click)="handleClick(exam)">Iniciar</a>
            </div>
          }
        </div>
      }

      @if (!loading() && !error() && exams().length === 0) {
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
      gap: var(--spacing-md);
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

    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    h3 {
      margin: 0;
      color: var(--color-dark);
      font-size: 18px;
      flex: 1;
    }

    @media (min-width: 768px) {
      h3 {
        font-size: 20px;
      }
    }

    .difficulty-badge {
      padding: 4px 12px;
      border-radius: var(--border-radius-lg);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .difficulty-easy {
      background: #d4edda;
      color: #155724;
    }

    .difficulty-medium {
      background: #fff3cd;
      color: #856404;
    }

    .difficulty-hard {
      background: #f8d7da;
      color: #721c24;
    }

    .exam-description {
      flex: 1;
      margin: 0;
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 14px;
    }

    .exam-meta {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .meta-icon {
      font-size: 16px;
    }

    .meta-text {
      color: var(--color-text-secondary);
      font-size: 13px;
      font-weight: 500;
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
  exams = signal<ExamResponse[]>([]);
  loading = signal(false);
  error = signal('');

  loadingAnonymous = signal<boolean>(false);
  showRegisterPrompt = signal<boolean>(false);
  examSelected = signal<ExamResponse | null>(null);

  constructor(
    private examsApi: ExamsApiService,
    private authFacade: AuthFacade,
    private router: Router
  ) {
  }

  ngOnInit(): void {;
    this.loadExams();
  }

  loadExams(): void {
    this.loading.set(true);
    this.error.set('');

    this.examsApi.getAllExams().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.error.set('Erro ao carregar exames. Por favor, tente novamente.');
        this.loading.set(false);
      }
    });
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'EASY': 'Fácil',
      'MEDIUM': 'Médio',
      'HARD': 'Difícil'
    };
    return labels[difficulty] || difficulty;
  }

  handleClick(exam: ExamResponse): void {
    this.examSelected.set(exam);

    this.authFacade.ensureAuthenticated()
      .subscribe((user) => {
        if (user) {
          this.router.navigate(['/exams', exam.id]);
        } else {
          this.showRegisterPrompt.set(true);
        }
      });
  }

  createAnonymousAndStay() {
    this.loadingAnonymous.set(true);

    this.authFacade.createAnonymousUser().subscribe({
      next: () => {
        this.loadingAnonymous.set(false);
        this.showRegisterPrompt.set(false);
        this.router.navigate(['/exams', this.examSelected()?.id]);
      },
      error: () => {
        this.loadingAnonymous.set(false);
        this.showRegisterPrompt.set(false);
        console.error('Error creating anonymous user');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

