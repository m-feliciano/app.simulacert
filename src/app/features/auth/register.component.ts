import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  styleUrls: ['./register.component.css'],
  template: `
    <div class="auth-card">
      <div class="logo-container">
        <img ngSrc="/simulaaws-logo.svg" priority alt="SimulaAWS" class="auth-logo" height="96" width="360">
      </div>

      <h2>Registrar</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" formControlName="name" class="form-control"/>
          @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
            <div class="error">
              Nome deve ter entre 3 e 100 caracteres
            </div>
          }
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" class="form-control"/>
          @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
            <div class="error">
              Email válido é obrigatório
            </div>
          }
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" formControlName="password" class="form-control"/>
          @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
            <div class="error">
              Senha deve ter no mínimo 8 caracteres
            </div>
          }
        </div>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }

        <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Já tem uma conta? <a routerLink="/login">Faça login</a></p>
      </div>
    </div>
  `
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

