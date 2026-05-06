import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
    const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');

    if (isAuthRoute || !isApiRequest) {
      return next.handle(req);
    }

    return this.resolveAccessToken().pipe(
      switchMap((accessToken) => next.handle(this.withToken(req, accessToken))),
      catchError((error) => this.handleAuthError(error, req, next))
    );
  }

  private resolveAccessToken(): Observable<string | null> {
    if (this.authService.hasValidAccessToken()) {
      return of(this.authService.getAccessToken());
    }

    if (!this.authService.hasRefreshableSession()) {
      return of(this.authService.getAccessToken());
    }

    return this.authService.refresh().pipe(
      map(() => this.authService.getAccessToken()),
      catchError((error) => {
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }

  private handleAuthError(
    error: unknown,
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (error instanceof HttpErrorResponse && error.status === 401 && this.authService.hasRefreshableSession()) {
      return this.authService.refresh().pipe(
        switchMap(() => next.handle(this.withToken(req, this.authService.getAccessToken()))),
        catchError((refreshError) => {
          this.authService.logout();
          return throwError(() => refreshError);
        })
      );
    }

    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.authService.logout();
    }

    return throwError(() => error);
  }

  private withToken(req: HttpRequest<unknown>, accessToken: string | null): HttpRequest<unknown> {
    if (!accessToken) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
}
