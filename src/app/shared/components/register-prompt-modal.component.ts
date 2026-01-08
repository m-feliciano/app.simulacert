import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-register-prompt-modal',
  standalone: true,
  template: `
    <div class="finish-modal" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Quer se registrar?</h3>
        <p>
          Crie uma conta para salvar seu progresso e acessar recursos exclusivos.
        </p>

        <div class="modal-actions">
          <button class="btn-primary" (click)="onRegister()">
            Criar conta e salvar meu progresso
          </button>

          <button class="btn-secondary" (click)="onAnonymous()">
            Continuar sem conta
          </button>
        </div>

        <div class="modal-benefits">
          <h4>Benefícios de se registrar</h4>
          <ul>
            <li>Salvar seu progresso automaticamente</li>
            <li>Acesso a exames exclusivos</li>
            <li>Receber novidades e atualizações</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .finish-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-lg);
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: var(--color-surface);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 520px;
      width: 100%;
      text-align: center;
      animation: slideIn 0.25s ease-out;
    }

    h3 {
      margin-bottom: var(--spacing-sm);
    }

    p {
      color: var(--color-text-muted);
      margin-bottom: var(--spacing-lg);
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .btn-primary {
      background: var(--color-primary-green);
      color: #fff;
      padding: 14px;
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: background 0.2s ease, transform 0.1s ease;
    }

    .btn-primary:hover {
      background: var(--color-primary-green-dark);
      transform: translateY(-1px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-muted);
      padding: 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-size: 0.95rem;
      transition: border-color 0.2s ease, color 0.2s ease;
    }

    .btn-secondary:hover {
      border-color: var(--color-primary-green);
      color: var(--color-primary-green);
    }

    button:focus-visible {
      outline: 2px solid var(--color-primary-green);
      outline-offset: 2px;
    }

    .modal-benefits {
      text-align: left;
      border-top: 1px solid var(--color-border);
      padding-top: var(--spacing-md);
    }

    .modal-benefits h4 {
      font-size: 0.95rem;
      margin-bottom: var(--spacing-sm);
    }

    .modal-benefits ul {
      padding-left: 18px;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .modal-benefits li {
      margin-bottom: 6px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .finish-modal,
      .modal-content {
        animation: none;
      }
    }
  `]
})
export class RegisterPromptModalComponent {
  @Output() register = new EventEmitter<void>();
  @Output() anonymous = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onRegister(): void {
    this.register.emit();
  }

  onAnonymous(): void {
    this.anonymous.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
