import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../../shared/components/footer.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, SeoHeadDirective],
  template: `
    <div class="public-layout" seoHead>
      <div class="public-layout-content">
        <router-outlet />
      </div>
      <app-footer/>
    </div>
  `,
  styles: [`
    .public-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #232F3E 0%, #37475A 70%, #FF9900 100%);
      position: relative;
      overflow: hidden;
    }

    .public-layout::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 15% 50%, rgba(255, 153, 0, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 20%, rgba(255, 153, 0, 0.06) 0%, transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 40%);
      animation: backgroundPulse 20s ease-in-out infinite;
    }

    @keyframes backgroundPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .public-layout-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
      position: relative;
      z-index: 1;
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
      .public-layout::before {
        animation: none;
      }
      .public-layout-content {
        animation: none;
      }
    }
  `]
})
export class PublicLayoutComponent {}

