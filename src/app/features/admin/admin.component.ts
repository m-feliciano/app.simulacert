import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ExamsApiService } from '../../api/exams.service';
import { QuestionsApiService } from '../../api/questions.service';
import { ExamResponse } from '../../api/domain';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-container">
      <h1>Administração</h1>

      <div class="admin-tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'exams'"
          (click)="activeTab.set('exams')">
          Exames
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'questions'"
          (click)="activeTab.set('questions')">
          Questões
        </button>
      </div>

      @if (activeTab() === 'exams') {
        <div class="tab-content">
          <div class="section">
            <div class="section-header">
              <h2>Criar Novo Exame</h2>
              <button type="button" class="btn-import"
                      (click)="importExamsFromDirectory()"
                      [disabled]="loadingImport()">
                {{ loadingImport() ? 'Importando...' : '📁 Importar em Lote' }}
              </button>
            </div>
            <form [formGroup]="examForm" (ngSubmit)="createExam()">
              <div class="form-group">
                <label>Título</label>
                <input type="text" formControlName="title" class="form-control" />
              </div>

              <div class="form-group">
                <label>Descrição</label>
                <textarea formControlName="description" class="form-control" rows="3"></textarea>
              </div>

              <button type="submit" class="btn-primary" [disabled]="examForm.invalid || loadingExam()">
                {{ loadingExam() ? 'Criando...' : 'Criar Exame' }}
              </button>
            </form>
          </div>

          <div class="section">
            <h2>Exames Existentes</h2>
            <div class="exams-list">
              @for (exam of exams(); track exam.id) {
                <div class="exam-item">
                  <div class="exam-info">
                    <h3>{{ exam.title }}</h3>
                    @if (exam.description) {
                      <p>{{ exam.description }}</p>
                    }
                  </div>
                  <div class="exam-actions">
                    <button class="btn-danger" (click)="deleteExam(exam.id)">Excluir</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (activeTab() === 'questions') {
        <div class="tab-content">
          <div class="section">
            <h2>Criar Nova Questão</h2>
            <form [formGroup]="questionForm" (ngSubmit)="createQuestion()">
              <div class="form-group">
                <label>Exame</label>
                <select formControlName="examId" class="form-control">
                  <option value="">Selecione um exame</option>
                  @for (exam of exams(); track exam.id) {
                    <option [value]="exam.id">{{ exam.title }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label>Texto da Questão</label>
                <textarea formControlName="text" class="form-control" rows="4"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Domínio AWS</label>
                  <input type="text" formControlName="domain" class="form-control" />
                </div>

                <div class="form-group">
                  <label>Dificuldade</label>
                  <select formControlName="difficulty" class="form-control">
                    <option value="EASY">Fácil</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HARD">Difícil</option>
                  </select>
                </div>
              </div>

              <div class="options-group">
                <h3>Opções de Resposta</h3>
                @for (option of questionOptions(); track $index) {
                  <div class="option-item">
                    <input type="text" [(ngModel)]="option.key" [ngModelOptions]="{standalone: true}" placeholder="Chave (A, B, C, D)" class="option-key" />
                    <input type="text" [(ngModel)]="option.text" [ngModelOptions]="{standalone: true}" placeholder="Texto da opção" class="option-text" />
                    <label class="option-correct">
                      <input type="checkbox" [(ngModel)]="option.isCorrect" [ngModelOptions]="{standalone: true}" />
                      Correta
                    </label>
                    <button type="button" class="btn-remove" (click)="removeOption($index)">×</button>
                  </div>
                }
                <button type="button" class="btn-secondary" (click)="addOption()">+ Adicionar Opção</button>
              </div>

              <button type="submit" class="btn-primary" [disabled]="questionForm.invalid || loadingQuestion()">
                {{ loadingQuestion() ? 'Criando...' : 'Criar Questão' }}
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 30px;
      color: #232f3e;
    }

    h2 {
      margin: 0 0 20px;
      color: #232f3e;
      font-size: 20px;
    }

    h3 {
      margin: 0 0 15px;
      color: #232f3e;
      font-size: 16px;
    }

    .admin-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .tab-btn {
      padding: 12px 24px;
      background: white;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      border-color: #ff9900;
      color: #ff9900;
    }

    .tab-btn.active {
      background: #ff9900;
      border-color: #ff9900;
      color: white;
    }

    .section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #ff9900;
    }

    textarea.form-control {
      resize: vertical;
    }

    .options-group {
      margin: 30px 0;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .option-item {
      display: grid;
      grid-template-columns: 100px 1fr auto 40px;
      gap: 10px;
      margin-bottom: 15px;
      align-items: center;
    }

    .option-key {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .option-text {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .option-correct {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .btn-remove {
      width: 30px;
      height: 30px;
      background: #d13212;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .btn-primary, .btn-secondary, .btn-danger, .btn-import {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background: #ff9900;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ec7211;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #37475a;
      color: white;
    }

    .btn-secondary:hover {
      background: #232f3e;
    }

    .btn-danger {
      background: #d13212;
      color: white;
    }

    .btn-danger:hover {
      background: #a82a0f;
    }

    .btn-import {
      background: #232f3e;
      color: white;
    }

    .btn-import:hover:not(:disabled) {
      background: #37475a;
    }

    .btn-import:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .exams-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .exam-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .exam-info h3 {
      margin: 0 0 5px;
    }

    .exam-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class AdminComponent implements OnInit {
  activeTab = signal<'exams' | 'questions'>('exams');
  exams = signal<ExamResponse[]>([]);
  examForm: FormGroup;
  questionForm: FormGroup;
  questionOptions = signal<Array<{ key: string; text: string; isCorrect: boolean }>>([]);
  loadingExam = signal(false);
  loadingQuestion = signal(false);
  loadingImport = signal(false);

  constructor(
    private fb: FormBuilder,
    private examsApi: ExamsApiService,
    private questionsApi: QuestionsApiService
  ) {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]]
    });

    this.questionForm = this.fb.group({
      examId: ['', Validators.required],
      text: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      domain: ['', [Validators.required, Validators.maxLength(100)]],
      difficulty: ['MEDIUM', Validators.required]
    });

    // Inicializar com 4 opções vazias
    this.questionOptions.set([
      { key: '', text: '', isCorrect: false },
      { key: '', text: '', isCorrect: false },
      { key: '', text: '', isCorrect: false },
      { key: '', text: '', isCorrect: false }
    ]);
  }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.examsApi.getAllExams().subscribe({
      next: (exams) => {
        this.exams.set(exams);
      },
      error: (error) => {
        console.error('Error loading exams:', error);
      }
    });
  }

  createExam(): void {
    if (this.examForm.valid) {
      this.loadingExam.set(true);
      this.examsApi.createExam(this.examForm.value).subscribe({
        next: () => {
          this.examForm.reset();
          this.loadExams();
          this.loadingExam.set(false);
        },
        error: (error) => {
          console.error('Error creating exam:', error);
          this.loadingExam.set(false);
        }
      });
    }
  }

  deleteExam(examId: string): void {
    if (confirm('Tem certeza que deseja excluir este exame?')) {
      this.examsApi.deleteExam(examId).subscribe({
        next: () => {
          this.loadExams();
        },
        error: (error) => {
          console.error('Error deleting exam:', error);
        }
      });
    }
  }

  createQuestion(): void {
    if (this.questionForm.valid && this.questionOptions().length > 0) {
      this.loadingQuestion.set(true);
      const request = {
        ...this.questionForm.value,
        options: this.questionOptions().filter(opt => opt.key && opt.text)
      };

      this.questionsApi.createQuestion(request).subscribe({
        next: () => {
          this.questionForm.reset();
          this.questionForm.patchValue({ difficulty: 'MEDIUM' });
          this.questionOptions.set([
            { key: '', text: '', isCorrect: false },
            { key: '', text: '', isCorrect: false },
            { key: '', text: '', isCorrect: false },
            { key: '', text: '', isCorrect: false }
          ]);
          this.loadingQuestion.set(false);
        },
        error: (error) => {
          console.error('Error creating question:', error);
          this.loadingQuestion.set(false);
        }
      });
    }
  }

  addOption(): void {
    this.questionOptions.update(options => [...options, { key: '', text: '', isCorrect: false }]);
  }

  removeOption(index: number): void {
    this.questionOptions.update(options => options.filter((_, i) => i !== index));
  }

  importExamsFromDirectory(): void {
    this.loadingImport.set(true);
    this.showToast('Importação iniciada! Processando arquivos do diretório...', 'info');

    this.examsApi.importFromDirectory().subscribe({
      next: () => {
        this.loadingImport.set(false);
        this.showToast('Importação concluída com sucesso!', 'success');
        this.loadExams();
      },
      error: (error) => {
        console.error('Error importing exams:', error);
        this.loadingImport.set(false);
        this.showToast('Erro ao importar exames. Verifique o console para mais detalhes.', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
  }
}

