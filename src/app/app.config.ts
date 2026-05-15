import {
  APP_INITIALIZER,
  ApplicationConfig,
  NgZone,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';
import {JwtInterceptor} from './core/interceptors/jwt.interceptor';
import {ErrorInterceptor} from './core/interceptors/error.interceptor';
import {API_CONFIG, ApiConfig} from './api/config/api.config';
import {environment} from '../environments/environment';
import {Meta, provideClientHydration, Title, withEventReplay} from '@angular/platform-browser';
import {LOCAL_STORAGE, provideLocalStorage} from './core/storage/local-storage.token';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';

import {routes} from './app.routes';
import {LanguageInterceptor} from './core/interceptors/language.interceptor';
import {TransferStateInterceptor} from './core/interceptors/transfer.interceptor';
import {provideSessionStorage} from './core/storage/session-storage.token';
import {customLoaderFactory, initTranslateFactory} from './translation-module.config';

function getApiConfig(): ApiConfig {
  const baseUrl = environment.apiConfig.baseUrl;
  return { baseUrl };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideLocalStorage(),
    provideSessionStorage(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TransferStateInterceptor, multi: true },
    {provide: API_CONFIG, useFactory: getApiConfig},
    Title,
    Meta, provideClientHydration(withEventReplay()),
    TranslateModule.forRoot({
      fallbackLang: 'pt-BR',
      loader: {
        provide: TranslateLoader,
        useFactory: customLoaderFactory,
        deps: [HttpClient, PLATFORM_ID]
      }
    }).providers || []
    ,
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslateFactory,
      deps: [TranslateService, LOCAL_STORAGE, NgZone],
      multi: true
    }
  ]
};
