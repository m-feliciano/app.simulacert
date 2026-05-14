import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {JwtInterceptor} from './core/interceptors/jwt.interceptor';
import {ErrorInterceptor} from './core/interceptors/error.interceptor';
import {API_CONFIG, ApiConfig} from './api/config/api.config';
import {environment} from '../environments/environment';
import {Meta, provideClientHydration, Title, withEventReplay} from '@angular/platform-browser';
import {provideLocalStorage} from './core/storage/local-storage.token';

import {routes} from './app.routes';
import {LanguageInterceptor} from './core/interceptors/language.interceptor';
import {TransferStateInterceptor} from './core/interceptors/transfer.interceptor';

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
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TransferStateInterceptor, multi: true },
    {provide: API_CONFIG, useFactory: getApiConfig},
    Title,
    Meta, provideClientHydration(withEventReplay())
  ]
};
