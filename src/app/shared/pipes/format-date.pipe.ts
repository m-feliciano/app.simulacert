import {inject, Pipe, PipeTransform} from '@angular/core';
import {I18nService} from '../../core/i18n/i18n.service';

@Pipe({
  name: 'formatDate',
  standalone: true,
  pure: false
})
export class FormatDatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);

  transform(value: string | number | null): string {
    if (!value) return '';
    return this.formatDate(new Date(value).toISOString());
  }

  private formatDate(dateString: string): string {
    const language = this.i18nService.getLanguage();
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
