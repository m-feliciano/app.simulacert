import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeartHandshake, LucideAngularModule} from 'lucide-angular';
import {TranslatePipe} from '../pipes/translate.pipe';

@Component({
  selector: 'app-support-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  template: `
    <a class="support-btn nav-item"
            (click)="openSupport()"
            [attr.aria-label]="'nav.support' | translate">

      <lucide-icon [img]="icon" class="nav-icon" aria-hidden="true"></lucide-icon>
      <span>{{ 'nav.support' | translate }}</span>
    </a>
  `,
  styles: [`
      .support-btn {
        gap: 10px;
        font-size: 14px;
      }

      .support-btn:hover {
        background: rgba(17, 24, 39, 0.06);
        color: var(--text);
      }

      .nav-icon {
        color: hotpink;
        width: 18px;
        height: 18px;
        min-width: 18px;
        margin-top: -5px;
        margin-right: 5px;
      }
    `
  ]
})
export class SupportButtonComponent {
  readonly icon = HeartHandshake;

  openSupport(): void {
    const event = new CustomEvent('open-support', {bubbles: true});
    globalThis.document?.dispatchEvent(event);
  }
}

