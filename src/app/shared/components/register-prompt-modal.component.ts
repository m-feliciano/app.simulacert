import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-register-prompt-modal',
  standalone: true,
  template: `
    <div class="sc-modal-overlay" (click)="onClose()">
      <div class="sc-modal-container sc-card sc-card--premium" style="transform: none" (click)="$event.stopPropagation()">
        <h3 class="modal-title">Quer se registrar?</h3>
        <p class="modal-text">
          Crie uma conta para salvar seu progresso e acessar recursos exclusivos.
        </p>

        <div class="modal-actions">
          <button class="sc-btn sc-btn--primary" (click)="onRegister()" [disabled]="loading">
            Sim, quero me registrar
          </button>

          <button class="sc-btn sc-btn--outline" (click)="onAnonymous()" [disabled]="loading">
            @if (loading) {
                <span class="sc-spinner"></span>
            } @else {
                <span>Não, continuar sem conta</span>
            }
          </button>
        </div>

        <div class="modal-benefits">
          <h4 class="benefits-title">Benefícios de se registrar</h4>
          <ul class="benefits-list">
            <li>Salvar seu progresso automaticamente</li>
            <li>Acesso a exames exclusivos</li>
            <li>Receber novidades e atualizações</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sc-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: var(--spacing-lg);
      animation: fadeIn 0.2s ease-out;
    }

    .sc-modal-container {
      max-width: 480px;
      width: 100%;
      padding: var(--spacing-xl);
      text-align: center;
      animation: slideIn 0.3s var(--ease-out);
      background: var(--surface);
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: var(--spacing-xs);
      letter-spacing: var(--letter-tight);
    }

    .modal-text {
      color: var(--muted);
      margin-bottom: var(--spacing-xl);
      font-size: 1rem;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xl);
    }

    .sc-btn {
      width: 100%;
      height: 48px;
    }

    .modal-benefits {
      text-align: left;
      border-top: 1px solid var(--border);
      padding-top: var(--spacing-lg);
    }

    .benefits-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--spacing-sm);
    }

    .benefits-list {
      padding-left: 20px;
      color: var(--text-2);
      font-size: 0.95rem;
      list-style-type: none;
    }

    .benefits-list li {
      margin-bottom: var(--spacing-xs);
      position: relative;
    }

    .benefits-list li::before {
      content: "✓";
      position: absolute;
      left: -20px;
      color: var(--brand-primary);
      font-weight: 800;
    }

    .sc-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .sc-modal-overlay, .sc-modal-container {
        animation: none;
      }
    }
  `]
})
export class RegisterPromptModalComponent {
  @Input() loading = false;
  @Output() register = new EventEmitter<void>();
  @Output() anonymous = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onRegister() {
    if (!this.loading) this.register.emit();
  }
  onAnonymous() {
    if (!this.loading) this.anonymous.emit();
  }
  onClose() {
    if (!this.loading) this.close.emit();
  }
}
