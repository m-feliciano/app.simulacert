import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { AuthFacade } from '../auth/auth.facade';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NgOptimizedImage],
  template: `
    <div class="app-layout">
      <header class="topbar">
        <div class="topbar-left">
          <button class="sidebar-toggle" (click)="toggleSidebar()">☰</button>
          <img ngSrc="/simulaaws-logo.svg" alt="SimulaAWS" class="logo" height="96" width="360">
        </div>
        <div class="topbar-right">
          <span class="user-name">{{ authFacade.currentUser?.name }}</span>
          <button class="logout-btn" (click)="logout()">Sair</button>
        </div>
      </header>

      <div class="app-content">
        <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
          <nav class="sidebar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Dashboard</span>
            </a>
            <a routerLink="/exams" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📝</span>
              <span class="nav-label">Exames</span>
            </a>
            <a routerLink="/stats" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📈</span>
              <span class="nav-label">Estatísticas</span>
            </a>
            <a *ngIf="authFacade.isAdmin" routerLink="/admin" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Admin</span>
            </a>
          </nav>
        </aside>

        <main class="main-content">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
  styles: [`
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

    .app-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 250px;
      background: var(--color-secondary);
      color: white;
      transition: var(--transition-normal);
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: var(--shadow-sm);
    }

    .sidebar.collapsed {
      width: 60px;
    }

    @media (max-width: 768px) {
      .sidebar:not(.collapsed) {
        position: fixed;
        top: 60px;
        left: 0;
        bottom: 0;
        z-index: 999;
      }
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
      padding: var(--spacing-lg);
    }

    @media (min-width: 768px) {
      .main-content {
        padding: var(--spacing-xl);
      }
    }
  `]
})
export class AppLayoutComponent {
  sidebarCollapsed = false;

  constructor(
    public authFacade: AuthFacade,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/login']);
  }
}

