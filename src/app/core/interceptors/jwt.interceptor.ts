import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthFacade} from '../auth/auth.facade';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private readonly publicUrls = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/auth/oauth/google',
    '/auth/oauth/google/callback'
  ];

  constructor(private authFacade: AuthFacade) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isPublicUrl(req.url)) {
      return next.handle(req);
    }

    const token = this.authFacade.token();
    const authReq = token
      ? this.addToken(req, token)
      : req;

    return next.handle(authReq).pipe(
      catchError(err => this.handleAuthError(err, authReq, next))
    );
  }

  private handleAuthError(
    error: any,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
      return throwError(() => error);
    }

    return this.authFacade.generateRefreshToken().pipe(
      switchMap(({token}) => {
        const authReq = this.addToken(req, token);
        return next.handle(authReq);
      }),
      catchError(refreshError => throwError(() => refreshError))
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isPublicUrl(url: string): boolean {
    return this.publicUrls.some(publicUrl => url.includes(publicUrl));
  }
}
