import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthFacade } from '../auth/auth.facade';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly publicUrls = ['/api/v1/auth/login', '/api/v1/auth/register'];

  constructor(private authFacade: AuthFacade) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublicUrl = this.publicUrls.some(url => req.url.includes(url));

    if (isPublicUrl) {
      return next.handle(req);
    }

    const token = this.authFacade.token;
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}

