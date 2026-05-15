import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateService} from '@ngx-translate/core';
import {firstValueFrom, Observable, of} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Injectable()
class CustomTranslateLoader implements TranslateLoader {

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
  }

  getTranslation(lang: string): Observable<any> {

    if (!isPlatformBrowser(this.platformId)) {
      return of({});
    }

    return this.http.get(`/i18n/${lang}.json`);
  }
}

export function customLoaderFactory(http: HttpClient, platformId: object): TranslateLoader {
  return new CustomTranslateLoader(http, platformId);
}

export function initTranslateFactory(
  translate: TranslateService,
  storage: Storage | null,
  platformId: object
) {
  return () => {
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }

    const lang = storage?.getItem('language') || 'pt-BR';
    return firstValueFrom(translate.use(lang));
  };
}
