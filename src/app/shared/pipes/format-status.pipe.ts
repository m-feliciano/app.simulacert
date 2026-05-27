import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'formatStatus',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  private readonly statusMap: { [key: string]: string } = {
    'IN_PROGRESS': this.translateService.instant('attempts.inProgress'),
    'COMPLETED': this.translateService.instant('attempts.completed'),
    'ABANDONED': this.translateService.instant('attempts.abandoned')
  };

  transform(value: string): string {
    if (!value) return '-';

    return this.formatStatus(value);
  }

  private formatStatus(status: string): string {
    return this.statusMap[status] || status;
  }
}
