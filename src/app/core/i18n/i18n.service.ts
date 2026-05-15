import {effect, Inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {isPlatformBrowser} from '@angular/common';
import {LOCAL_STORAGE} from '../storage/local-storage.token';
import {Observable, Subject} from 'rxjs';

export type Language = 'pt-BR' | 'en-US';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly currentLanguage = signal<Language>('pt-BR');
  private readonly LANGUAGE_KEY = 'language';
  private readonly isBrowser: boolean;
  private readonly languageSet$ = new Subject<Language>();

  constructor(
    private readonly translate: TranslateService,
    @Inject(LOCAL_STORAGE) private readonly storage: Storage | null,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.translate.addLangs(['pt-BR', 'en-US']);

    if (this.isBrowser && this.storage) {
      const savedLanguage = this.storage.getItem(this.LANGUAGE_KEY) as Language;
      if (savedLanguage && (savedLanguage === 'pt-BR' || savedLanguage === 'en-US')) {
        this.currentLanguage.set(savedLanguage);
      }
    }

    effect(() => {
      const language = this.currentLanguage();

      if (this.isBrowser && this.storage) {
        this.storage.setItem(this.LANGUAGE_KEY, language);
      }

      if (this.isBrowser) {
        globalThis.document.documentElement.lang = language === 'pt-BR' ? 'pt-BR' : 'en-US';
      }

      this.translate.use(language).subscribe(() => {
        this.languageSet$.next(language);
      });
    });
  }

  changeLanguage(language: Language): Observable<Language> {
    if (this.currentLanguage() === language) {
      return new Observable<Language>(subscriber => {
        subscriber.next(language);
        subscriber.complete();
      });
    }

    this.currentLanguage.set(language);
    return this.languageSet$.asObservable();
  }

  getLanguage(): Language {
    return this.currentLanguage();
  }

  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  get(key: string, params?: any) {
    return this.translate.get(key, params);
  }
}

