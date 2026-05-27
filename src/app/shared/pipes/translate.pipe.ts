import {ChangeDetectorRef, inject, Pipe, PipeTransform} from '@angular/core';
import {take} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // allow dynamic updates when translations are loaded
})
export class TranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly pending = new Set<string>();

  transform(key: string, params?: any): string {
    const value = this.translateService.instant(key, params);

    if (value === key && !this.pending.has(key)) {
      this.pending.add(key);

      this.translateService.get(key, params)
        .pipe(take(1))
        .subscribe(() => {
          this.pending.delete(key);
          this.cdr.markForCheck();
        });
    }

    return value;
  }
}

