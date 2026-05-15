import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, filter, finalize, Observable, take, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthFacade} from '../auth/auth.facade';
import {Router} from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  private readonly publicUrls = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh-token',
    '/auth/oauth/google',
    '/auth/oauth/google/callback'
  ];
  private readonly refreshToken$ = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly router: Router
  ) {}

  intercept = (req: HttpRequest<any>, next: HttpHandler) => {
    if (this.isPublicUrl(req.url)) {
      return next.handle(req);
    }

    const token = this.authFacade.token();
    const authReq = token ? this.withToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError(error => this.handle401(error, authReq, next))
    );
  }

  private handle401(
    error: HttpErrorResponse,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (error.status !== 401) {
      return throwError(() => error);
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshToken$.next(null);

      return this.authFacade.generateRefreshToken().pipe(
        switchMap(({token}) => {
          this.isRefreshing = false;
          this.refreshToken$.next(token);

          return next.handle(this.withToken(req, token));
        }),
        finalize(() => {
          this.isRefreshing = false;
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authFacade.logout();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    }

    return this.refreshToken$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.withToken(req, token)))
    );
  }


  private withToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
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
