import {Component, effect, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ExamsApiService} from '../../api/exams.service';
import {QuestionsApiService} from '../../api/questions.service';
import {AuthApiService} from '../../api/auth.service';
import {ExamResponse, UserResponse} from '../../api/domain';
import {AuthFacade} from '../../core/auth/auth.facade';

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
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'users'"
          (click)="activeTab.set('users')">
          Usuários
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
                <input type="text" formControlName="title" class="form-control"/>
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
                  <label>Domínio</label>
                  <input type="text" formControlName="domain" class="form-control"/>
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
                    <input type="text"
                           [(ngModel)]="option.key"
                           [ngModelOptions]="{standalone: true}"
                           placeholder="Chave (A, B, C, D)"
                           class="form-control option-key"/>

                    <input type="text"
                           [(ngModel)]="option.text"
                           [ngModelOptions]="{standalone: true}"
                           placeholder="Texto da opção"
                           class="form-control option-text"/>

                    <label class="option-correct">
                      <input type="checkbox"
                             class="form-control"
                             [(ngModel)]="option.isCorrect"
                             [ngModelOptions]="{standalone: true}"/>
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

      @if (activeTab() === 'users') {
        <div class="tab-content">
          <div class="section">
            <h2>Gerenciar Usuários</h2>

            <form [formGroup]="userForm" (ngSubmit)="searchUserByEmail()">
              <div class="search-user">
                <input type="email"
                       formControlName="email"
                       placeholder="Digite o email do usuário"
                       class="form-control"/>
              </div>
            </form>

            <div class="users-list">
              @for (user of users(); track user.id) {
                <div class="user-card">
                  <div class="user-info">
                    <h3>{{ user.name }}</h3>
                    <p><strong>Email:</strong> {{ user.email }}</p>
                    <p><strong>Função:</strong> {{ user.role }}</p>
                    <p><strong>Cadastro:</strong> {{ user.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>

                    <div class="user-status">
                        <span [class.status-active]="user.active" [class.status-inactive]="!user.active">
                          {{ user.active ? '✓ Ativo' : '✗ Inativo' }}
                        </span>
                    </div>
                  </div>

                  <div class="user-actions">
                    <button
                      [class.btn-danger]="user.active"
                      [class.btn-success]="!user.active"
                      (click)="toggleUserStatus(user)"
                      [disabled]="loadingUser() || authFacade.currentUser()?.id === user.id">
                      {{ user.active ? 'Desativar' : 'Ativar' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: [`admin.component.css`]
})
export class AdminComponent {
  activeTab = signal<'exams' | 'questions' | 'users'>('exams');
  exams = signal<ExamResponse[]>([]);
  users = signal<UserResponse[]>([]);
  questionOptions = signal<Array<{ key: string; text: string; isCorrect: boolean }>>([]);

  loadingUser = signal(false);
  loadingExam = signal(false);
  loadingQuestion = signal(false);
  loadingImport = signal(false);

  protected readonly examForm: FormGroup;
  protected readonly questionForm: FormGroup;
  protected readonly userForm: FormGroup;

  private readonly emptyQuestions = [
    {key: '', text: '', isCorrect: false},
    {key: '', text: '', isCorrect: false},
    {key: '', text: '', isCorrect: false},
    {key: '', text: '', isCorrect: false}
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly examsApi: ExamsApiService,
    private readonly questionsApi: QuestionsApiService,
    private readonly authApi: AuthApiService,
    protected readonly authFacade: AuthFacade
  ) {
    this.questionOptions.set(this.emptyQuestions);

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

    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    effect(() => {
      switch (this.activeTab()) {
        case 'users':
          this.loadUsers();
          break;

        case 'exams':
          this.loadExams();
          break;
      }
    });
  }

  createQuestion(): void {
    if (!this.questionForm.valid || !this.questionOptions().length) return;

    this.loadingQuestion.set(true);

    const request = {
      ...this.questionForm.value,
      options: this.questionOptions().filter(opt => opt.key && opt.text)
    };

    this.questionsApi.createQuestion(request).subscribe({
      next: () => {
        this.questionForm.reset();
        this.questionForm.patchValue({difficulty: 'MEDIUM'});
        this.questionOptions.set(this.emptyQuestions);
        this.loadingQuestion.set(false);
      },
      error: () => this.loadingQuestion.set(false)
    });
  }

  loadExams(): void {
    this.examsApi.getAllAvailable().subscribe({
      next: (exams) => this.exams.set(exams)
    });
  }

  createExam(): void {
    if (!this.examForm.valid) return;

    this.loadingExam.set(true);

    this.examsApi.createExam(this.examForm.value).subscribe({
      next: () => {
        this.examForm.reset();
        this.loadExams();
        this.loadingExam.set(false);
      },
      error: () => this.loadingExam.set(false)
    });
  }

  deleteExam(examId: string): void {
    if (confirm('Tem certeza que deseja excluir este exame?')) {
      this.examsApi.deleteExam(examId).subscribe({
        next: () => {
          this.loadExams();
        },
      });
    }
  }

  searchUserByEmail(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loadingUser.set(true);

    this.authApi.getUserByEmail(this.userForm.value).subscribe({
      next: (user) => {
        user ? this.users.set([user]) : this.users.set([]);
        this.loadingUser.set(false);
      },
      error: () => {
        this.loadingUser.set(false);
        alert('Usuário não encontrado');
      }
    });
  }

  addOption(): void {
    this.questionOptions.update(options => [...options, { key: '', text: '', isCorrect: false }]);
  }

  removeOption(index: number): void {
    this.questionOptions.update(options => options.filter((_, i) => i !== index));
  }

  importExamsFromDirectory(): void {
    this.loadingImport.set(true);
    alert('Importação iniciada! Processando arquivos do diretório...');

    this.examsApi.importFromDirectory().subscribe({
      next: () => {
        this.loadingImport.set(false);
        alert('Importação concluída com sucesso!');
        this.loadExams();
      },
      error: () => {
        this.loadingImport.set(false);
        alert('Erro ao importar exames. Verifique o console para mais detalhes.');
      }
    });
  }

  loadUsers(email?: string): void {
    this.loadingUser.set(true);

    this.authApi.getUsers(email).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUser.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loadingUser.set(false);
      }
    });
  }

  toggleUserStatus(user: UserResponse): void {
    const action = user.active ? 'desativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
      return;
    }

    if (this.authFacade.currentUser()?.id === user?.id) {
      alert('Não é permitido exclusao do usuario admin');
      return;
    }

    this.loadingUser.set(true);

    const request = user.active
      ? this.authApi.deactivateUser(user.id)
      : this.authApi.activateUser(user.id);

    request.subscribe({
      next: () => {
        this.loadingUser.set(false);
        alert(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: () => {
        this.loadingUser.set(false);
        alert(`Erro ao ${action} usuário`);
      }
    });
  }
}

