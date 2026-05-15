import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LOCAL_STORAGE} from '../storage/local-storage.token';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {

  constructor(@Inject(LOCAL_STORAGE) private readonly storage: Storage | null) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const language = this.storage?.getItem('language') || 'pt-BR';
    const modifiedReq = req.clone({
      setHeaders: {
        'x-content-language': language
      }
    });

    return next.handle(modifiedReq);
  }
}
