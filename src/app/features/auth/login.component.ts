import {Component, Inject, Renderer2, signal} from '@angular/core';
import {CommonModule, Location, NgOptimizedImage} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {API_CONFIG, ApiConfig} from '../../api/config/api.config';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage, SeoHeadDirective],
  styleUrls: ['./login.component.css'],
  template: `
    <div seoHead
         [seoTitle]="'Login | SimulaCert'"
         [seoDescription]="'Acesse sua conta SimulaCert para treinar simulados de certificação.'"
         [seoRobots]="'noindex, nofollow'"
         [seoCanonical]="canonicalUrl"
         [renderer]="renderer">
      <div class="auth-card">
        <div class="logo-container">
          <img ngSrc="/simulacert-logo.svg" priority alt="simulacert" class="auth-logo" height="96" width="360"/>
        </div>

        <p class="tagline">Prepare-se para certificações AWS, Azure e GCP</p>

        <div class="value-props">
          <div class="prop">✓ Simulados atualizados</div>
          <div class="prop">✓ Análise de desempenho</div>
          <div class="prop">✓ Acesso ilimitado</div>
        </div>

        <h2>Faça login</h2>

        <button type="button"
                class="btn-google"
                (click)="loginWithGoogle()"
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

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" aria-label="Formulário de login">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input id="login-email" type="email" formControlName="email" class="form-control" aria-required="true"/>
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
              <div class="error" aria-live="polite">
                Email é obrigatório
              </div>
            }
          </div>
          <div class="form-group">
            <label for="login-password">Senha</label>
            <input id="login-password" type="password" formControlName="password" class="form-control"
                   aria-required="true"/>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <div class="error" aria-live="polite">
                Senha é obrigatória
              </div>
            }
            <div class="forgot-password-link">
              <a routerLink="/forgot-password">Esqueci minha senha</a>
            </div>
          </div>
          @if (errorMessage()) {
            <div class="error" aria-live="polite">{{ errorMessage() }}</div>
          }
          <button type="submit"
                  class="btn-primary"
                  [disabled]="loginForm.invalid || loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="cta-secondary">Novo aqui? <a routerLink="/register">Crie sua conta grátis</a></p>
          <p class="link-secondary"><a routerLink="/how-it-works">Como funciona?</a></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {

  loginForm: FormGroup;
  loading = signal(false);
  loadingGoogle = signal(false);
  errorMessage = signal('');

  private readonly baseUrl: string;

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router,
    @Inject(API_CONFIG) private config: ApiConfig,
    private _renderer: Renderer2,
    private location: Location
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.baseUrl = this.config.baseUrl;
  }

  get renderer() {
    return this._renderer;
  }

  get canonicalUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}${this.location.prepareExternalUrl('/login')}`;
  }

  loginWithGoogle(): void {
    this.loadingGoogle.set(true);
    this.errorMessage.set('');

    window.location.href = this.baseUrl + '/api/v1/auth/oauth/google';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authFacade.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/exams']);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Erro ao fazer login');
        }
      });
    }
  }
}
