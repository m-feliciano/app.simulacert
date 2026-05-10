import {Component, Inject, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {API_CONFIG, ApiConfig} from '../../api/config/api.config';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage, SeoHeadDirective],
  styleUrls: ['./register.component.css'],
  template: `
    <div seoHead>
      <div class="auth-page sc-page">
        <div class="auth-card sc-card sc-card--premium">
          <div class="logo-container">
            <img ngSrc="/simulacert-logo.svg" priority alt="simulacert" class="auth-logo" height="96" width="360">
          </div>

          <p class="tagline">Prepare-se para certificações AWS, Azure e GCP</p>

          <div class="value-props">
            <div class="prop"><span class="check">✓</span> Simulados atualizados</div>
            <div class="prop"><span class="check">✓</span> Análise de desempenho</div>
            <div class="prop"><span class="check">✓</span> Acesso ilimitado</div>
          </div>

          <h2 class="auth-title">Criar conta grátis</h2>

          <button type="button"
                  class="btn-google sc-btn sc-btn--outline"
                  (click)="registerWithGoogle()"
                  [disabled]="loadingGoogle()">

          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05"
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>

            {{ loadingGoogle() ? 'Conectando...' : 'Continuar com Google' }}
          </button>

          <div class="divider">
            <span>ou</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" aria-label="Formulário de cadastro">
            <div class="form-group">
              <label for="register-email">Email</label>
              <input id="register-email" type="email" formControlName="email" class="sc-input" aria-required="true"/>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <div class="error" aria-live="polite">Email válido é obrigatório</div>
              }
            </div>

            <div class="form-group">
              <label for="register-password">Senha</label>
              <input id="register-password" type="password" formControlName="password" class="sc-input" aria-required="true"/>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <div class="error" aria-live="polite">Senha deve ter no mínimo 6 caracteres</div>
              }
            </div>

            @if (errorMessage()) {
              <div class="error" aria-live="polite">{{ errorMessage() }}</div>
            }

            <button type="submit" class="sc-btn sc-btn--primary" [disabled]="registerForm.invalid || loading()">
              {{ loading() ? 'Criando conta...' : 'Começar grátis' }}
            </button>
          </form>

          <p class="legal">Sem cartão. Sem compromisso. Cancele quando quiser.</p>

          <div class="auth-footer">
            <p class="cta-secondary">Já tem uma conta? <a routerLink="/login">Entrar</a></p>
            <p class="link-secondary"><a routerLink="/how-it-works">Como funciona?</a></p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {


  registerForm: FormGroup;
  loading = signal(false);
  loadingGoogle = signal(false);
  errorMessage = signal('');
  private readonly baseUrl: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authFacade: AuthFacade,
    private readonly router: Router,
    @Inject(API_CONFIG) private config: ApiConfig,
    private readonly seoFactory: SeoFactoryService,
    private readonly seoFacade: SeoFacadeService,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.baseUrl = this.config.baseUrl;

    const seo = this.seoFactory.website({
      title: 'Cadastro | SimulaCert',
      description: 'Crie sua conta gratuita na SimulaCert e comece a treinar para certificações.',
      canonicalPath: '/register',
      robots: 'noindex, nofollow',
      jsonLdId: 'register',
    });

    this.seoFacade.set(seo);
  }

  registerWithGoogle(): void {
    this.loadingGoogle.set(true);
    this.errorMessage.set('');

    window.location.href = `${this.baseUrl}/api/v1/auth/oauth/google`;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authFacade.register(this.registerForm.value)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/login']);
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('Erro ao registrar');
          }
        });
    }
  }
}
