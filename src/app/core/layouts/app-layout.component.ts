import {Component, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AuthFacade} from '../auth/auth.facade';
import {FooterComponent} from '../../shared/components/footer.component';
import {SupportModalComponent} from '../../shared/components/support-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NgOptimizedImage, FooterComponent, SupportModalComponent],
  template: `
    <div class="app-layout">
      <header class="topbar">
        <div class="topbar-left">
          @if (isMobile()) {
            <button class="sidebar-toggle" (click)="toggleSidebar()">☰</button>
          }
          <img priority ngSrc="/simulacert-logo.svg" alt="simulacert" class="logo" height="96" width="360">
        </div>

        @if (!isMobile()) {
          <nav class="topbar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
            <a routerLink="/exams" routerLinkActive="active" class="nav-item">Exames</a>
            <a routerLink="/stats" routerLinkActive="active" class="nav-item">Estatísticas</a>

            @if (authFacade.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-item">Console</a>
            }

            <a routerLink="/news" routerLinkActive="false" class="nav-item muted">Novidades</a>
            <button class="nav-item support-btn" (click)="showSupportModal = true">
              <span class="nav-icon">☕</span> Apoie
            </button>
          </nav>
        }
        <div class="topbar-right">
          <span class="user-name">{{ authFacade.currentUser()?.name }}</span>
          @if (authFacade.isAuthenticated() && !authFacade.isAnonymous()) {
            <button class="logout-btn" (click)="logout()">Sair</button>
          } @else {
            <button class="login-btn" routerLink="/login">Entrar</button>
          }
        </div>
      </header>
      <div class="app-content">
        @if (isMobile() && !sidebarCollapsed()) {
          <div class="sidebar-overlay" (click)="closeSidebar()"></div>

          <aside class="sidebar" [ngClass]="{'collapsed': sidebarCollapsed()}">
            <nav class="sidebar-nav">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Dashboard</span>
              </a>
              <a routerLink="/exams" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <span class="nav-icon">📝</span>
                <span class="nav-label">Exames</span>
              </a>
              <a routerLink="/stats" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                <span class="nav-icon">📈</span>
                <span class="nav-label">Estatísticas</span>
              </a>
              <a routerLink="/news" routerLinkActive="false" class="nav-item muted" (click)="onNavItemClick()">
                <span class="nav-icon">📰</span>
                <span class="nav-label">Novidades</span>
              </a>

              @if (authFacade.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="active" class="nav-item" (click)="onNavItemClick()">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-label">Console</span>
                </a>
              }
              <button class="nav-item support-btn" (click)="showSupportModal = true">
                <span class="nav-icon">☕</span>
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
      color: #dddddd !important;
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
      height: 60px;
      background: var(--color-dark);
      color: white;
      padding: 0 var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      z-index: 1000;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .sidebar-toggle {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      transition: var(--transition-fast);
    }

    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
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
      background: var(--color-primary);
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

    .login-btn {
      background: var(--color-primary-green);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition-fast);
    }

    .login-btn:hover {
      background: var(--color-primary-green-dark);
      transform: translateY(-1px);
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
      background: var(--color-secondary);
      color: white;
      transition: transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.33s, width 0.45s cubic-bezier(0.4,0,0.2,1);
      opacity: 1;
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: var(--shadow-sm);
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
        top: 60px;
        left: 0;
        bottom: 0;
        transform: translateX(0);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
      }

      .sidebar.collapsed {
        transform: translateX(-100%);
        width: 250px;
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
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
      color: white;
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
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
      background: var(--color-primary);
    }

    .nav-item.active::before {
      transform: scaleX(1);
    }

    .nav-icon {
      font-size: 20px;
      min-width: 20px;
      text-align: center;
    }

    .sidebar.collapsed .nav-label {
      display: none;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--color-bg-primary);
    }

    .content-wrapper {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-lg) var(--spacing-lg) 0;
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
      color: white;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      cursor: pointer;
      padding: var(--spacing-md) var(--spacing-lg);
      transition: background 0.2s;
      width: 100%;
      text-align: left;
    }
    .support-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--color-primary);
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
      color: white;
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
      background: var(--color-primary);
      color: #fff;
    }
    .topbar-nav .nav-item:hover {
      background: rgba(255,255,255,0.08);
      color: var(--color-primary);
    }
    @media (max-width: 768px) {
      .topbar-nav { display: none; }
    }
  `]
})
export class AppLayoutComponent {
  sidebarCollapsed = signal(true);
  isMobile = signal(false);
  showSupportModal = false;

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
