import {Component, OnInit, Renderer2, signal} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SeoHeadDirective],
  template: `
    <div seoHead
         [seoTitle]="'Redefinir Senha | SimulaCert'"
         [seoDescription]="'Defina uma nova senha para sua conta SimulaCert.'"
         [seoRobots]="'noindex, nofollow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">
      <div class="auth-card">
        <h2>Redefinir Senha</h2>
        <p class="subtitle">Digite sua nova senha.</p>

        @if (passwordReset()) {
          <div class="success-message">
            <span class="success-icon">✓</span>
            <p>Senha redefinida com sucesso!</p>
          </div>
          <a routerLink="/login" class="btn-primary">Ir para Login</a>
        } @else {
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" aria-label="Formulário de redefinição de senha">
            <div class="form-group">
              <label for="reset-password">Nova Senha</label>
              <input id="reset-password" type="password" formControlName="password" class="form-control"
                     placeholder="Mínimo 6 caracteres" aria-required="true"/>
              @if (resetPasswordForm.get('password')?.touched && resetPasswordForm.get('password')?.invalid) {
                <div class="error" aria-live="polite">
                  Senha deve ter no mínimo 6 caracteres
                </div>
              }
            </div>

            <div class="form-group">
              <label for="reset-confirm-password">Confirmar Senha</label>
              <input id="reset-confirm-password" type="password" formControlName="confirmPassword" class="form-control"
                     placeholder="Digite a senha novamente" aria-required="true"/>
              @if (resetPasswordForm.get('confirmPassword')?.touched && resetPasswordForm.hasError('mismatch')) {
                <div class="error" aria-live="polite">
                  As senhas não conferem
                </div>
              }
            </div>

            @if (errorMessage()) {
              <div class="error" aria-live="polite">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="resetPasswordForm.invalid || loading()">
              {{ loading() ? 'Redefinindo...' : 'Redefinir Senha' }}
            </button>
          </form>

          <div class="auth-footer">
            <p><a routerLink="/login">Voltar ao Login</a></p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      background: #37475a;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 450px;
      margin: 0 auto;
    }

    h2 {
      margin: 0 0 var(--spacing-md);
      text-align: center;
      color: #fff;
      font-size: 24px;
    }

    .subtitle {
      text-align: center;
      color: #ccc;
      margin: 0 0 var(--spacing-xl);
      line-height: 1.5;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #fff;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--color-border);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      transition: var(--transition-fast);
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
    }

    .error {
      color: var(--color-danger);
      font-size: 12px;
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error::before {
      content: '⚠️';
      font-size: 14px;
    }

    .success-message {
      background: #d4edda;
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .success-icon {
      display: block;
      font-size: 48px;
      color: #155724;
      margin-bottom: var(--spacing-sm);
    }

    .success-message p {
      margin: 0;
      color: #155724;
      font-weight: 500;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
      transition: var(--transition-fast);
      font-family: inherit;
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
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
      color: var(--color-primary);
      text-decoration: none;
      font-size: 14px;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  passwordReset = signal(false);
  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _renderer: Renderer2,
    private location: Location
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {validators: this.passwordMatchValidator});
  }

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}${this.location.prepareExternalUrl('/reset-password')}`;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage.set('Token inválido ou expirado');
    }
  }

  passwordMatchValidator(group: FormGroup): { mismatch: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true};
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.loading.set(true);
      this.errorMessage.set('');

      setTimeout(() => {
        this.loading.set(false);
        this.passwordReset.set(true);
      }, 1000);

      // TODO IMPLEMENTAR A CHAMADA REAL À API DE REDEFINIÇÃO DE SENHA:
      /*
      const newPassword = this.resetPasswordForm.value.password;
      this.authApi.resetPassword(this.token, newPassword)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.passwordReset.set(true);
          },
          error: (error) => {
            this.loading.set(false);
            this.errorMessage.set(error.error?.message || 'Erro ao redefinir senha');
          }
        });
      */
    }
  }
}
