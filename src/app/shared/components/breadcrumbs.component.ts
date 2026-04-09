import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

export type BreadcrumbItem = {
  label: string;
  url?: string;
};

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        @for (item of items; track $index) {
          <li>
            @if (item.url) {
              <a [routerLink]="item.url">{{ item.label }}</a>
            } @else {
              <span aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      margin: 8px 0 16px;
      font-size: 14px;
    }

    .breadcrumbs ol {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      color: var(--color-text-secondary);
    }

    .breadcrumbs li {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .breadcrumbs li::after {
      content: '/';
      opacity: 0.5;
    }

    .breadcrumbs li:last-child::after {
      content: '';
    }

    .breadcrumbs a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .breadcrumbs a:hover {
      text-decoration: underline;
    }

    .breadcrumbs span[aria-current="page"] {
      color: var(--color-dark);
      font-weight: 600;
    }
  `]
})
export class BreadcrumbsComponent {
  @Input({required: true}) items: BreadcrumbItem[] = [];
}

