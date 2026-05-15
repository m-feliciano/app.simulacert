import {HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';

import {inject, Injectable, PLATFORM_ID} from '@angular/core';

import {isPlatformBrowser} from '@angular/common';

import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {CACHE_HTTP_RESPONSE} from '../transfer/exam-state.transfer';
import {CacheService} from '../service/cache.service';

@Injectable()
export class TransferStateInterceptor implements HttpInterceptor {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageService = inject(CacheService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (req.method !== 'GET' || !req.context.has(CACHE_HTTP_RESPONSE)) {
      return next.handle(req);
    }

    const key = req.context.get(CACHE_HTTP_RESPONSE);
    if (key && isPlatformBrowser(this.platformId)) {
      const cached = this.storageService.get(key);
      if (cached) {
        return of(
          new HttpResponse({
            body: cached,
            status: 200
          })
        );
      }
    }

    return next.handle(req).pipe(
      tap(event => {
        if (key && event.type === HttpEventType.Response) {
          this.storageService.set(key, event.body);
        }
      })
    );
  }
}
