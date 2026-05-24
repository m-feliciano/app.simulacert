import {ChangeDetectorRef, inject, Pipe, PipeTransform} from '@angular/core';
import {I18nService} from '../../core/i18n/i18n.service';
import {takeUntil} from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // allow dynamic updates when translations are loaded
})
export class TranslatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cacheRecord: Record<string, { lastKey: string, lastParams: string, lastValue: string }> = {};

  transform(key: string, params?: any): string {
    const language = this.i18nService.getLanguage();
    const paramsKey = JSON.stringify(params || {});

    if (this.cacheRecord[language]?.lastKey === key && this.cacheRecord[language]?.lastParams === paramsKey) {
      return this.cacheRecord[language].lastValue;
    }

    let value = this.i18nService.instant(key, params);

    if (value === key) {
      this.i18nService.get(key, params)
        .pipe(takeUntil(this.i18nService.onLanguageChange))
        .subscribe((translated) => {
          if (translated !== key) {
            this.cacheRecord[language] = {lastKey: key, lastParams: paramsKey, lastValue: translated};
            value = translated;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.cacheRecord[language] = {lastKey: key, lastParams: paramsKey, lastValue: value};
    }

    return value;
  }
}

