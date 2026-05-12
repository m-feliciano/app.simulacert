import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SeoHeadDirective],
  template: `
    <div seoHead>
      <div class="auth-card">
        <h2>Recuperar Senha</h2>
        <p class="subtitle">Digite seu email e enviaremos um link para redefinir sua senha.</p>

        @if (emailSent()) {
          <div class="success-message">
            <span class="success-icon">✓</span>
            <p>Email enviado com sucesso! Verifique sua caixa de entrada.</p>
          </div>
          <a routerLink="/login" class="btn-secondary">Voltar ao Login</a>
        } @else {
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()"
                aria-label="Formulário de recuperação de senha">
            <div class="form-group">
              <label for="forgot-email">Email</label>
              <input id="forgot-email" type="email" formControlName="email" class="form-control"
                     placeholder="seu@email.com" aria-required="true"/>
              @if (forgotPasswordForm.get('email')?.touched && forgotPasswordForm.get('email')?.invalid) {
                <div class="error" aria-live="polite">
                  Email válido é obrigatório
                </div>
              }
            </div>

            @if (errorMessage()) {
              <div class="error" aria-live="polite">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="forgotPasswordForm.invalid || loading()">
              {{ loading() ? 'Enviando...' : 'Enviar Link de Recuperação' }}
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

    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 12px;
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

    .btn-primary {
      background: var(--color-primary);
      color: white;
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

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: var(--color-dark);
      transform: translateY(-2px);
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  emailSent = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const seo = this.seoFactory.website({
      title: 'Recuperar Senha | SimulaCert',
      description: 'Recupere o acesso à sua conta SimulaCert.',
      canonicalPath: '/forgot-password',
      robots: 'noindex, nofollow',
      jsonLdId: 'forgot-password',
    });

    this.seoFacade.set(seo);
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      setTimeout(() => {
        this.loading.set(false);
        this.emailSent.set(true);
      }, 1000);

      // TODO: implementar chamada real para API
      /*
      this.authApi.requestPasswordReset(this.forgotPasswordForm.value.email)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.emailSent.set(true);
          },
          error: (error) => {
            this.loading.set(false);
            this.errorMessage.set(error.error?.message || 'Erro ao enviar email');
          }
        });
      */
    }
  }
}
