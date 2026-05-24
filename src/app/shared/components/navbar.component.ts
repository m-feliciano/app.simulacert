import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {map, of, Subject, timer} from 'rxjs';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {AuthFacade} from '../../core/auth/auth.facade';
import {
  BarChart3,
  HeartHandshake,
  LucideAngularModule,
  Menu,
  Newspaper,
  NotebookPen,
  Settings,
  TrendingUp,
  Trophy
} from 'lucide-angular';
import {ExamResponse} from '../../api/domain';
import {SupportButtonComponent} from './support-button.component';
import {TranslatePipe} from '../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, RouterLinkActive, LucideAngularModule, SupportButtonComponent, TranslatePipe],
  template: `
    <nav class="topbar-nav" (mouseleave)="closeDropdown()">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">{{ 'nav.dashboard' | translate }}</a>

      <div class="exams-dropdown"
           [class.open]="dropdownOpen()"
           (mouseenter)="openDropdown()"
           (mouseleave)="closeDropdown()">
        <a class="nav-item dropdown-toggle" routerLink="/exams" routerLinkActive="active"
           (mouseenter)="openDropdown()">
          {{ 'nav.exams' | translate }}
        </a>

        @if (dropdownOpen()) {
          <div class="dropdown-menu" (mouseenter)="openDropdown()" (mouseleave)="closeDropdown()">
            @if (loading()) {
              <div class="dropdown-loading">{{ 'nav.dropdown.loading' | translate }}</div>
            }

            @if (!loading() && exams().length > 0) {
              @for (exam of exams(); track exam.id) {
                <a [routerLink]="exam.incoming ? null : ['/exams', exam.slug]"
                   class="dropdown-item"
                   [class.disabled]="exam.incoming"
                   [attr.aria-disabled]="exam.incoming ? 'true' : null"
                   (click)="exam.incoming ? $event.preventDefault() : closeDropdown()">

                  <img class="exam-thumb" [ngSrc]="exam.slug + '.png'" [alt]="exam.title" width="40" height="40"/>
                  <span class="exam-meta">
                    <span class="exam-title">{{ exam.title }}</span>
                    @if (exam.incoming) {
                      <span class="coming">{{ 'nav.dropdown.comingSoon' | translate }}</span>
                    }
                  </span>
                </a>
              }
            }

            @if (!loading() && exams().length === 0) {
              <div class="dropdown-empty">{{ 'nav.dropdown.noExams' | translate }}</div>
            }

            <div class="dropdown-footer">
              <a routerLink="/exams" (click)="closeDropdown()">{{ 'nav.dropdown.viewAll' | translate }}</a>
            </div>
          </div>
        }
      </div>

      <a routerLink="/stats" routerLinkActive="active" class="nav-item">{{ 'nav.stats' | translate }}</a>
      <a routerLink="/achievements" routerLinkActive="active" class="nav-item">{{ 'nav.achievements' | translate }}</a>

      @if (authFacade.isAdmin()) {
        <a routerLink="/admin" routerLinkActive="active" class="nav-item">{{ 'nav.admin' | translate }}</a>
      }

      <a routerLink="/news" routerLinkActive="false" class="nav-item muted disabled"
         style="cursor: not-allowed">{{ 'nav.news' | translate }}</a>

      <app-support-button></app-support-button>
    </nav>
  `,
  styles: [
    `
      .exams-dropdown {
        position: relative;
        width: fit-content;
      }

      .dropdown-toggle {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        min-width: 320px;
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-md);
        border-radius: 8px;
        padding: 8px;
        z-index: 1200;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        color: var(--text-2);
        text-decoration: none;
        border-radius: 6px;
      }

      .dropdown-item:hover {
        background: rgba(17, 24, 39, 0.06);
        color: var(--text);
      }

      .dropdown-loading, .dropdown-empty {
        padding: 8px 12px;
        color: var(--text-2);
      }

      .dropdown-footer {
        padding-top: 6px;
        border-top: 1px solid var(--border);
        margin-top: 6px;
        text-align: center;
      }

      .coming {
        font-size: 12px;
        color: var(--text-2);
        margin-left: 6px;
      }

      .exam-thumb {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 6px;
      }

      .exam-meta {
        font-size: 13px;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .exam-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: fit-content;
      }

      .topbar-nav {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        margin-left: var(--spacing-xl);
      }

      .topbar-nav .nav-item {
        background: none;
        border: none;
        color: var(--text-2);
        font-size: 1rem;
        padding: 8px 16px;
        border-radius: var(--border-radius-sm);
        text-decoration: none;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .topbar-nav .nav-item.active,
      .topbar-nav .nav-item:focus-visible {
        background: rgba(255, 153, 0, 0.14);
        color: var(--brand-primary-600);
      }

      .topbar-nav .nav-item:hover {
        background: rgba(17, 24, 39, 0.06);
        color: var(--text);
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md) var(--spacing-lg);
        color: var(--text-2);
        text-decoration: none;
        transition: var(--transition-fast);
        position: relative;
      }

      .nav-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--color-primary);
        transform: scaleX(0);
        transition: var(--transition-fast);
      }

      .nav-item:hover {
        background: rgba(17, 24, 39, 0.06);
        color: var(--text);
      }

      .nav-item.active {
        background: rgba(255, 153, 0, 0.14);
        color: var(--brand-primary-600);
      }

      .nav-item.active::before {
        transform: scaleX(1);
      }

      .nav-icon {
        width: 18px;
        height: 18px;
        min-width: 18px;
      }

      .dropdown-item.disabled {
        pointer-events: none;
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .topbar-nav {
          display: none;
        }
      }
    `
  ]
})
export class NavbarComponent implements OnInit {
  readonly icons = {
    menu: Menu,
    dashboard: BarChart3,
    exams: NotebookPen,
    stats: TrendingUp,
    achievements: Trophy,
    news: Newspaper,
    admin: Settings,
    support: HeartHandshake,
  };

  dropdownOpen = signal(false);
  exams = signal<ExamResponse[]>([]);
  loading = signal(true);
  readonly authFacade = inject(AuthFacade);
  private readonly examsApi = inject(ExamsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hover$ = new Subject<boolean>();

  ngOnInit(): void {
    this.loadExams();

    this.hover$
      .pipe(
        switchMap((isHover) => isHover ? of(true) : timer(200).pipe(map(() => false))),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((open) => this.dropdownOpen.set(open));
  }

  loadExams(): void {
    this.loading.set(true);
    this.examsApi.getAll().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openDropdown(): void {
    this.hover$.next(true);
  }

  closeDropdown(): void {
    this.hover$.next(false);
  }
}
