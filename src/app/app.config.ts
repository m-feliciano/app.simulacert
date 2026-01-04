import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {JwtInterceptor} from './core/interceptors/jwt.interceptor';
import {ErrorInterceptor} from './core/interceptors/error.interceptor';
import {API_CONFIG, ApiConfig} from './api/config/api.config';
import {environment} from '../environments/environment';

import {routes} from './app.routes';

function getApiConfig(): ApiConfig {
  const baseUrl = environment.apiConfig.baseUrl;
  return { baseUrl };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: API_CONFIG, useFactory: getApiConfig }
  ]
};
