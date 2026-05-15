import {ChangeDetectorRef, inject, Pipe, PipeTransform} from '@angular/core';
import {I18nService} from '../../core/i18n/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // allow dynamic updates when translations are loaded
})
export class TranslatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cacheRecord: Record<string, { lastKey: string, lastValue: string }> = {};
  private subscription: any = null;

  transform(key: string, params?: any): string {
    const language = this.i18nService.getLanguage();

    if (this.cacheRecord[language]?.lastKey === key && !params) {
      return this.cacheRecord[language].lastValue;
    }

    let value = this.i18nService.instant(key, params);

    if (value === key) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.subscription = this.i18nService.get(key, params)
        .subscribe((translated) => {
          if (translated !== key) {
            this.cacheRecord[language] = {lastKey: key, lastValue: translated};
            value = translated;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.cacheRecord[language] = {lastKey: key, lastValue: value};
    }

    return value;
  }
}

