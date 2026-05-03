import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-support-modal',
  standalone: true,
  template: `
    <div class="support-modal-backdrop" (click)="close.emit()" role="dialog" aria-modal="true"
         aria-labelledby="support-modal-title">
      <div class="support-modal-content" (click)="$event.stopPropagation()" tabindex="-1">
        <button class="close-btn" (click)="close.emit()" aria-label="Fechar">×</button>
        <h3 id="support-modal-title">☕ Apoie o SimulaCert</h3>
        <p>Se este projeto te ajuda, considere apoiar com um café!</p>
        <a href="https://ko-fi.com/simulacert" target="_blank" rel="noopener" class="support-btn">
          Apoiar no Ko-fi
        </a>
      </div>
    </div>
  `,
  styles: [`
    .support-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .support-modal-content {
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 2rem 2.5rem 2rem 2.5rem;
      max-width: 340px;
      width: 100%;
      text-align: center;
      position: relative;
      animation: fadeIn 0.2s;
    }
    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #888;
      cursor: pointer;
    }
    .close-btn:hover {
      color: #d13212;
    }
    h3 {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    p {
      color: var(--muted);
      margin-bottom: 1.5rem;
    }
    .support-btn {
      display: inline-block;
      background: #FF5E5B;
      color: #fff;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 1rem;
      transition: background 0.2s;
      box-shadow: 0 2px 8px rgba(255,94,91,0.12);
    }
    .support-btn:hover {
      background: #d13212;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SupportModalComponent {
  @Output() close = new EventEmitter<void>();
}
