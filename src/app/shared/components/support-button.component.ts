import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LucideAngularModule, HeartHandshake} from 'lucide-angular';

@Component({
  selector: 'app-support-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button class="nav-item support-btn" (click)="openSupport()" aria-label="Apoie">
      <lucide-icon [img]="icon" class="nav-icon" aria-hidden="true"></lucide-icon>
      <span>Apoie</span>
    </button>
  `,
  styles: [
    `
      .support-btn {
        background: none;
        border: none;
        color: var(--text-2);
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: var(--spacing-md) var(--spacing-lg);
        transition: background 0.2s;
        width: 100%;
        text-align: left;
      }
      .support-btn:hover {
        background: rgba(17, 24, 39, 0.06);
        color: var(--text);
      }

      .support-btn .nav-icon {
        color: hotpink;
      }
      .nav-icon { width: 18px; height: 18px; min-width: 18px; }
    `
  ]
})
export class SupportButtonComponent {
  readonly icon = HeartHandshake;

  openSupport(): void {
    const ev = new CustomEvent('open-support', {bubbles: true});
    globalThis.document?.dispatchEvent(ev);
  }
}

