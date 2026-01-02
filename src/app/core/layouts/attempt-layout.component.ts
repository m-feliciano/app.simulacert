import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attempt-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  styleUrls: ['./attempt-layout.component.css'],
  template: `
    <div class="attempt-layout">
      <header class="attempt-topbar">
        <div class="attempt-topbar-left">
          <h1 class="logo">SimulaAWS</h1>
          <span class="exam-title">{{ examTitle }}</span>
        </div>
        <div class="attempt-topbar-right">
          <div class="timer" [class.warning]="timeRemaining < 300">
            ⏱️ {{ formatTime(timeRemaining) }}
          </div>
        </div>
      </header>

      <main class="attempt-content">
        <router-outlet />
      </main>
    </div>
  `
})
export class AttemptLayoutComponent {
  @Input() examTitle = '';
  @Input() timeRemaining = 0;

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

