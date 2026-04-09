import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthFacade} from '../../core/auth/auth.facade';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {first} from 'rxjs';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, SeoHeadDirective],
  template: `
    <div seoHead>

    <div class="auth-callback">
      @if (status() === 'processing') {
        <div class="loader">
          <div class="spinner"></div>
          <p>Finalizando login...</p>
        </div>
      }

      @if (status() === 'success') {
        <div class="success">
          <div class="icon">✓</div>
          <p>Login realizado com sucesso!</p>
          <p class="subtitle">Redirecionando...</p>
        </div>
      }

      @if (status() === 'error') {
        <div class="error">
          <div class="icon">✗</div>
          <p>Erro ao fazer login</p>
          <p class="subtitle">{{ errorMessage() }}</p>
          <p class="redirect-msg">Redirecionando para página de login...</p>
        </div>
      }
    </div>
    </div>
  `,
  styles: [`
    .auth-callback {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: var(--color-bg-primary);
    }

    .loader, .success, .error {
      padding: var(--spacing-xxl);
      background: var(--color-bg-secondary);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      max-width: 400px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--spacing-lg);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .icon {
      font-size: 48px;
      margin-bottom: var(--spacing-md);
    }

    .success {
      color: #4caf50;
    }

    .error {
      color: #f44336;
    }

    p {
      margin: var(--spacing-sm) 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-dark);
    }

    .subtitle {
      font-size: 14px;
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .redirect-msg {
      margin-top: var(--spacing-md);
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  status = signal<'processing' | 'success' | 'error'>('processing');
  errorMessage = signal('');

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authFacade: AuthFacade,
    private seoFactory: SeoFactoryService,
    private seoFacade: SeoFacadeService,
  ) {
    const seo = this.seoFactory.website({
      title: 'Autenticando... | SimulaCert',
      description: 'Processando autenticação na SimulaCert.',
      canonicalPath: '/auth/callback',
      robots: 'noindex, nofollow',
      jsonLdId: 'auth-callback',
    });

    this.seoFacade.set(seo);
  }

  ngOnInit(): void {
    this.route.queryParams
      // We only need to process the query parameters once, so we use `first()` to complete after the first emission.
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const code = params['code'];
        const state = params['state'];

        if (!code || !state) {
          this.fail('Parâmetros inválidos na URL.');
          return;
        }

        // Exchange the code for a token
        this.exchange(code, state);
      });
  }

  private exchange(code: string, state: string): void {
    this.authFacade.exchangeGoogleCode(code, state)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.status.set('success');
          this.authFacade.handleOAuthCallback(response.token);
          setTimeout(() => this.router.navigate(['/exams']), 1200);
        },
        error: () => {
          this.fail('Não foi possível validar sua autenticação.');
        }
      });
  }

  private fail(message: string): void {
    this.status.set('error');
    this.errorMessage.set(message);
    setTimeout(() => this.router.navigate(['/login']), 3000);
  }
}
