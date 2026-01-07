import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {AttemptsApiService} from '../../api/attempts.service';
import {AuthFacade} from '../../core/auth/auth.facade';
import {ExamResponse} from '../../api/domain';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="exam-detail">
      <div class="breadcrumb">
        <a (click)="goBack()" class="back-link">← Voltar</a>
      </div>

      @if (loadingExam()) {
        <div class="loading-state">
          <p>Carregando detalhes do exame...</p>
        </div>
      }

      @if (!loadingExam() && exam()) {
        <div class="exam-header">
          <h1>{{ exam()!.title }}</h1>
          @if (exam()!.description) {
            <p class="exam-description">{{ exam()!.description }}</p>
          }
        </div>

        <div class="mode-selection">
          <h2>Escolha o modo de estudo</h2>
          <div class="mode-cards">
            <div class="mode-card"
                 [class.selected]="selectedMode() === 'practice'"
                 (click)="selectMode('practice')">
              <div class="mode-icon">📖</div>
              <h3>Modo Prática</h3>
              <ul class="mode-features">
                <li>✓ Veja explicações durante o simulado</li>
                <li>✓ Sem limite de tempo</li>
                <li>✓ Ideal para aprender</li>
                <li>✓ Feedback imediato</li>
              </ul>
            </div>

            <div class="mode-card"
                 [class.selected]="selectedMode() === 'exam'"
                 (click)="selectMode('exam')">
              <div class="mode-icon">⏱️</div>
              <h3>Modo Exame</h3>
              <ul class="mode-features">
                <li>✓ Simula o exame real</li>
                <li>✓ Tempo cronometrado</li>
                <li>✓ Sem explicações durante</li>
                <li>✓ Resultados ao final</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="exam-info">
          <div class="info-card">
            <h3>Informações do Exame</h3>
            <ul>
              <li><strong>Tipo:</strong> Simulado AWS</li>
              <li><strong>Duração:</strong> {{ duration() }} minutos</li>
              <li><strong>Questões:</strong> {{ questionCount() }}</li>
              <li><strong>Pontuação mínima:</strong> 72%</li>
            </ul>
          </div>

          <div class="info-card">
            <h3>Regras</h3>
            <ul>
              <li>Você terá {{ duration() }} minutos para completar o exame</li>
              <li>São {{ questionCount() }} questões de múltipla escolha</li>
              <li>Não é possível pausar o exame</li>
              <li>Você pode revisar suas respostas antes de finalizar</li>
            </ul>
          </div>
        </div>

        <div class="question-selector">
          <h3>Quantidade de Questões</h3>
          <div class="question-options">
            @for (count of questionCountOptions; track count) {
              <button
                class="question-option"
                [class.selected]="questionCount() === count"
                (click)="selectQuestionCount(count)"
                type="button">
                {{ count }} questões
              </button>
            }
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" (click)="startExam()" [disabled]="loading()">
            {{ loading() ? 'Iniciando...' : 'Iniciar Exame com ' + questionCount() + ' questões' }}
          </button>
        </div>
      }

      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }
    </div>
  `,
  styleUrls: ['./exam-detail.component.css']
})
export class ExamDetailComponent implements OnInit {
  exam = signal<ExamResponse | null>(null);
  loading = signal(false);
  loadingExam = signal(false);
  errorMessage = signal('');
  questionCount = signal(20);
  questionCountOptions = [10, 20, 30, 40, 50, 100];

  selectedMode = signal<'practice' | 'exam'>('exam');

  duration = computed(() => Math.round(this.questionCount() * 2));

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
    this.loadingExam.set(true);
    this.errorMessage.set('');

    this.examsApi.getExam(examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.loadingExam.set(false);
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.errorMessage.set('Erro ao carregar exame');
        this.loadingExam.set(false);
      }
    });
  }

  selectQuestionCount(count: number): void {
    this.questionCount.set(count);
  }

  selectMode(mode: 'practice' | 'exam'): void {
    this.selectedMode.set(mode);
  }

  startExam(): void {
    const currentExam = this.exam();
    if (!currentExam || !this.authFacade.currentUser()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.attemptsApi.startAttempt({
      examId: currentExam.id,
      userId: this.authFacade.currentUser()!.id,
      questionCount: this.questionCount()
    }).subscribe({
      next: (attempt) => {
        this.router.navigate(['/attempt', attempt.id, 'run']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Erro ao iniciar exame');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }
}

