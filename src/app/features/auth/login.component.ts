import {Component, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  styleUrls: ['./login.component.css'],
  template: `
    <div class="auth-card">
      <div class="logo-container">
        <img ngSrc="/simulacert-logo.svg" alt="simulacert" class="auth-logo" height="96" width="360">
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

        @if (errorMessage()) {
          <div class="error">{{ errorMessage() }}</div>
        }

        <button type="submit"
                class="btn-primary"
                [disabled]="loginForm.invalid || loading()">
          {{ loading() ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Não tem uma conta? <a routerLink="/register">Registre-se</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

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
      this.loading.set(true);
      this.errorMessage.set('');

      this.authFacade.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Erro ao fazer login');
        }
      });
    }
  }
}

