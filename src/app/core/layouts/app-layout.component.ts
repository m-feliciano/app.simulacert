import {Component, signal, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AuthFacade} from '../auth/auth.facade';
import {FooterComponent} from '../../shared/components/footer.component';
import {SupportModalComponent} from '../../shared/components/support-modal.component';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {LucideAngularModule, BarChart3, NotebookPen, TrendingUp, Newspaper, Settings, HeartHandshake, Menu, Palette, Type, Trophy} from 'lucide-angular';
import {ThemeService} from '../theme/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NgOptimizedImage, FooterComponent, SupportModalComponent, SeoHeadDirective, LucideAngularModule],
  template: `
    <div class="app-layout" seoHead>
      <header class="topbar sc-glass sc-glass--acrylic">
        <div class="topbar-left">
          @if (isMobile()) {
            <button class="sidebar-toggle" (click)="toggleSidebar()" aria-label="Abrir menu">
              <lucide-icon [img]="icons.menu" class="icon" aria-hidden="true"></lucide-icon>
            </button>
          }
          <img priority ngSrc="/simulacert-logo.svg" alt="simulacert" class="logo" height="96" width="360">
        </div>

        @if (!isMobile()) {
          <nav class="topbar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
            <a routerLink="/exams" routerLinkActive="active" class="nav-item">Exames</a>
            <a routerLink="/stats" routerLinkActive="active" class="nav-item">Estatísticas</a>
            <a routerLink="/achievements" routerLinkActive="active" class="nav-item">Conquistas</a>

            @if (authFacade.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-item">Console</a>
            }

            <a routerLink="/news" routerLinkActive="false" class="nav-item muted">Novidades</a>

            <button class="nav-item support-btn" (click)="showSupportModal = true">
              <lucide-icon [img]="icons.support" class="nav-icon" aria-hidden="true"></lucide-icon>
              Apoie
            </button>
          </nav>
        }
        <div class="topbar-right">
          <span class="user-name">{{ authFacade.currentUser()?.name }}</span>
          @if (authFacade.isAuthenticated() && !authFacade.isAnonymous()) {
            <button class="logout-btn" (click)="logout()">Sair</button>
          } @else {
            <button class="login-btn sc-btn sc-btn--primary" routerLink="/login">Entrar</button>
          }
        </div>
      </header>
      <div class="app-content">
        @if (isMobile() && !sidebarCollapsed()) {
          <div class="sidebar-overlay" (click)="closeSidebar()"></div>

          <aside class="sidebar" [ngClass]="{'collapsed': sidebarCollapsed()}">
            <nav class="sidebar-nav">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <lucide-icon [img]="icons.dashboard" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Dashboard</span>
              </a>
              <a routerLink="/exams" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <lucide-icon [img]="icons.exams" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Exames</span>
              </a>
              <a routerLink="/stats" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <lucide-icon [img]="icons.stats" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Estatísticas</span>
              </a>
              <a routerLink="/achievements" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <lucide-icon [img]="icons.achievements" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Conquistas</span>
              </a>
              <a routerLink="/news" routerLinkActive="false" class="nav-item muted" (click)="onNavItemClick()">
                <lucide-icon [img]="icons.news" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Novidades</span>
              </a>

              @if (authFacade.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                  <lucide-icon [img]="icons.admin" class="nav-icon" aria-hidden="true"></lucide-icon>
                  <span class="nav-label">Console</span>
                </a>
              }
              <button class="nav-item support-btn" (click)="showSupportModal = true">
                <lucide-icon [img]="icons.support" class="nav-icon" aria-hidden="true"></lucide-icon>
                <span class="nav-label">Apoie</span>
              </button>
            </nav>
          </aside>
        }

        <main class="main-content">
          <div class="content-wrapper">
            <router-outlet/>
            <app-footer/>
          </div>
        </main>
      </div>

      @if (showSupportModal) {
        <app-support-modal (close)="showSupportModal = false"/>
      }

    </div>
  `,
  styles: [`
    .muted {
      opacity: 0.6;
      cursor: not-allowed !important;
      color: var(--muted) !important;
    }

    .muted:hover {
      background: none !important;
      color: inherit;
    }

    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      padding: 0 var(--spacing-lg);
      border-bottom: 1px solid var(--border);
      z-index: 1100;
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .sidebar-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      transition: var(--transition-fast);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }

    .sidebar-toggle:hover {
      background: rgba(17, 24, 39, 0.06);
    }

    .logo {
      height: 36px;
      width: auto;
      object-fit: contain;
    }


    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .user-name {
      font-size: 14px;
      display: none;
    }

    @media (min-width: 768px) {
      .user-name {
        display: inline;
      }
    }

    .logout-btn {
      background: var(--brand-primary);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition-fast);
    }

    .logout-btn:hover {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
    }

    .logout-btn:active {
      transform: translateY(0);
    }


    .topbar-nav .nav-item {
      color: var(--text-2);
    }

    .topbar-nav .nav-item:hover {
      background: rgba(17, 24, 39, 0.06);
      color: var(--text);
    }

    .topbar-nav .nav-item.active,
    .topbar-nav .nav-item:focus-visible {
      background: rgba(255, 153, 0, 0.14);
      color: var(--brand-primary-600);
    }

    .login-btn:active {
      transform: translateY(0);
    }

    .app-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 250px;
      background: var(--surface);
      color: var(--text);
      border-right: 1px solid var(--border);
      transition: transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.33s, width 0.45s cubic-bezier(0.4,0,0.2,1);
      opacity: 1;
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: 12px 0 32px rgba(17, 24, 39, 0.10);
      z-index: 1000;
    }

    .sidebar.collapsed {
      transform: translateX(-100%);
      width: 250px;
      opacity: 0;
      pointer-events: none;
    }

    .sidebar-overlay {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 64px;
        left: 0;
        bottom: 0;
        transform: translateX(0);
        box-shadow: 12px 0 34px rgba(17, 24, 39, 0.14);
      }

      .sidebar.collapsed {
        transform: translateX(-100%);
        width: 250px;
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(17, 24, 39, 0.42);
        backdrop-filter: blur(4px);
        z-index: 999;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    }

    @media (min-width: 769px) {
      .sidebar, .sidebar-overlay { display: none !important; }
    }

    .sidebar-nav {
      padding: var(--spacing-lg) 0;
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

    .sidebar.collapsed .nav-label {
      display: none;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg);
      padding-top: 64px;
    }

    .content-wrapper {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-lg) var(--spacing-lg) 0;
      position: relative;
    }

    .content-wrapper > app-footer {
      margin-top: auto;
      padding-top: var(--spacing-xxl);
    }

    @media (min-width: 768px) {
      .content-wrapper {
        padding: var(--spacing-xl) var(--spacing-xl) 0;
      }
    }

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
    @media (max-width: 768px) {
      .topbar-nav { display: none; }
    }
  `]
})
export class AppLayoutComponent {
  readonly icons = {
    menu: Menu,
    dashboard: BarChart3,
    exams: NotebookPen,
    stats: TrendingUp,
    achievements: Trophy,
    news: Newspaper,
    admin: Settings,
    support: HeartHandshake,
    palette: Palette,
    type: Type
  };

  sidebarCollapsed = signal(true);
  isMobile = signal(false);
  showSupportModal = false;

  public themeService = inject(ThemeService);

  constructor(
    public authFacade: AuthFacade,
    private router: Router
  ) {
    this.checkIfMobile();
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  onNavItemClick(): void {
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  private checkIfMobile(): void {
    if (typeof window === 'undefined') {
      this.isMobile.set(false);
      return;
    }

    this.isMobile.set(window.innerWidth <= 768);

    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile();
      this.isMobile.set(window.innerWidth <= 768);

      if (wasMobile !== this.isMobile()) {
        this.sidebarCollapsed.set(this.isMobile());
      }
    });
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/login']);
  }
}
