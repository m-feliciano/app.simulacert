import {Component, Input} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormatTimePipe} from '../../shared/pipes/format-time.pipe';

@Component({
  selector: 'app-attempt-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormatTimePipe],
  styleUrls: ['./attempt-layout.component.css'],
  template: `
    <div class="attempt-layout">
      <header class="attempt-topbar">
        <div class="attempt-topbar-left">
          <h1 class="logo">simulacert</h1>
          <span class="exam-title">{{ examTitle }}</span>
        </div>
        <div class="attempt-topbar-right">
          <div class="timer" [class.warning]="timeRemaining < 300">
            ⏱️ {{ timeRemaining | formatTime }}
          </div>
        </div>
      </header>

      <main class="attempt-content">
        <router-outlet/>
      </main>
    </div>
  `
})
export class AttemptLayoutComponent {
  @Input() examTitle = '';
  @Input() timeRemaining = 0;
}

