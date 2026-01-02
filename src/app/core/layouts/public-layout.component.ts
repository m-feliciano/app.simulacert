import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="public-layout">
      <div class="public-layout-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .public-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      padding: var(--spacing-lg);
    }

    .public-layout-content {
      width: 100%;
      max-width: 450px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .public-layout-content {
        animation: none;
      }
    }
  `]
})
export class PublicLayoutComponent {}

