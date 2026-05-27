import {ChangeDetectorRef, inject, Pipe, PipeTransform} from '@angular/core';
import {I18nService} from '../../core/i18n/i18n.service';
import {take, takeUntil} from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // allow dynamic updates when translations are loaded
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  transform(key: string, params?: any): string {
    const value = this.i18n.instant(key, params);

    if (value === key) {
      this.i18n.get(key, params)
        .pipe(takeUntil(this.i18n.onLanguageChange))
        .subscribe(() => this.cdr.markForCheck());
    }

    return value;
  }
}

