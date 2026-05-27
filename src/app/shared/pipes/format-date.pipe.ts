import {inject, Pipe, PipeTransform} from '@angular/core';
import {PersonalizationService} from '../../core/theme/personalization.service';

@Pipe({
  name: 'formatDate',
  standalone: true,
  pure: false
})
export class FormatDatePipe implements PipeTransform {
  private readonly personalization = inject(PersonalizationService);

  transform(value: string | number | null): string {
    if (!value) return '';
    return this.formatDate(new Date(value).toISOString());
  }

  private formatDate(dateString: string): string {
    const locale = this.personalization.getLanguage();

    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
