import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-score-status',
  template: `
    <div [ngClass]="statusClass">
          <ng-content></ng-content>
    </div>
  `,
  imports: [
    NgClass
  ],
  styleUrls: ['./score-status.component.css']
})
export class ScoreStatusComponent {
  @Input() score: number = 0;

  get statusClass(): string {
    if (this.score >= 70) return 'passed';
    if (this.score >= 50) return 'warning';
    return 'failed';
  }
}

