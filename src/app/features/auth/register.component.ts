import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Registrar</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" formControlName="name" class="form-control" />
          <div class="error" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
            Nome deve ter entre 3 e 100 caracteres
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" class="form-control" />
          <div class="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
            Email válido é obrigatório
          </div>
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" formControlName="password" class="form-control" />
          <div class="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
            Senha deve ter no mínimo 8 caracteres
          </div>
        </div>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Já tem uma conta? <a routerLink="/login">Faça login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
      margin: 0 0 30px;
      text-align: center;
      color: #232f3e;
    }

    .form-group {
      margin-bottom: 20px;
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

    .error {
      color: #d13212;
      font-size: 12px;
      margin-top: 5px;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #ff9900;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ec7211;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      margin-top: 20px;
      text-align: center;
    }

    .auth-footer a {
      color: #ff9900;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authFacade.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Erro ao registrar';
        }
      });
    }
  }
}

