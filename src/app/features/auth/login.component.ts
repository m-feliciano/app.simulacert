import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="auth-card">
      <div class="logo-container">
        <img ngSrc="/simulaaws-logo.svg" alt="SimulaAWS" class="auth-logo" height="96" width="360">
      </div>
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" class="form-control"/>

          @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
            <div class="error">
              Email é obrigatório
            </div>
          }
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" formControlName="password" class="form-control"/>

          @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
            <div class="error">
              Senha é obrigatória
            </div>
          }
        </div>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }

        <button type="submit"
                class="btn-primary"
                [disabled]="loginForm.invalid || loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p style="color: #ccc">Não tem uma conta? <a routerLink="/register">Registre-se</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      background: #37475a;
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacing-xl);
    }

    .auth-logo {
      height: 60px;
      width: auto;
    }

    h2 {
      margin: 0 0 var(--spacing-xl);
      text-align: center;
      color: #fff;
      font-size: 24px;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: #fff;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 14px;
      box-sizing: border-box;
      transition: var(--transition-fast);
      font-family: inherit;
    }

    .form-control:hover {
      border-color: var(--color-border-light);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
    }

    .form-control:disabled {
      background: var(--color-bg-primary);
      cursor: not-allowed;
    }

    .error {
      color: var(--color-danger);
      font-size: 12px;
      margin-top: var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error::before {
      content: '⚠️';
      font-size: 14px;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-top: var(--spacing-sm);
      transition: var(--transition-fast);
      font-family: inherit;
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
      transform: none;
    }

    .auth-footer {
      margin-top: var(--spacing-lg);
      text-align: center;
      font-size: 14px;
      color: #ccc;
    }

    .auth-footer p {
      margin: 0;
      color: var(--color-text-secondary);
    }

    .auth-footer a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition-fast);
    }

    .auth-footer a:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authFacade.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Erro ao fazer login';
        }
      });
    }
  }
}

