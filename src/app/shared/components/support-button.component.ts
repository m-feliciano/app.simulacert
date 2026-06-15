import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeartHandshake, LucideAngularModule} from 'lucide-angular';
import {TranslatePipe} from '../pipes/translate.pipe';

@Component({
  selector: 'app-support-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  template: `
    <button class="nav-item support-btn"
            (click)="openSupport()"
            [attr.aria-label]="'nav.support' | translate">

      <lucide-icon [img]="icon" class="nav-icon" aria-hidden="true"></lucide-icon>
      <span>{{ 'nav.support' | translate }}</span>
    </button>
  `,
  styles: [
    `
      .support-btn {
        background: none;
        border: none;
        color: var(--text-2);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: background 0.2s;
        width: 100%;
        text-align: left;
        padding: 0 var(--spacing-2xs);
        font-size: 14px;
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
    globalThis.document?.dispatchEvent(new CustomEvent('open-support', {bubbles: true}));
  }
}

