import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';

import {inject, Injectable, PLATFORM_ID} from '@angular/core';

import {isPlatformBrowser, isPlatformServer} from '@angular/common';

import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {CACHE_TRANSFER_STATE} from '../transfer/exam-state.transfer';
import {TransferStateManagerService} from '../service/transfer-state-manager.service';

@Injectable()
export class TransferStateInterceptor implements HttpInterceptor {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferStateManager = inject(TransferStateManagerService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (req.method !== 'GET' || !req.context.has(CACHE_TRANSFER_STATE)) {
      return next.handle(req);
    }

    const key = req.context.get(CACHE_TRANSFER_STATE);
    if (key && isPlatformBrowser(this.platformId)) {
      const cached = this.transferStateManager.get(key);
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
        if (key && isPlatformServer(this.platformId) && event instanceof HttpResponse) {
          this.transferStateManager.set(key, event.body);
        }
      })
    );
  }
}
