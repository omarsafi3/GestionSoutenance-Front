import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthSession, LoginRequest, RefreshTokenRequest, UserRole } from './auth.models';

const STORAGE_KEY = 'soutenance.auth.session';
const EXPIRATION_SKEW_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.readSession());
  private refreshRequest$: Observable<AuthResponse> | null = null;

  readonly session$ = this.sessionSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, request).pipe(
      tap((response) => this.storeResponse(response))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const request: RefreshTokenRequest = { refreshToken };
    this.refreshRequest$ = this.http.post<AuthResponse>(`${this.authUrl}/refresh`, request).pipe(
      tap((response) => this.storeResponse(response)),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.refreshRequest$;
  }

  logout(): void {
    this.writeSession(null);
    this.sessionSubject.next(null);
  }

  getAccessToken(): string | null {
    return this.sessionSubject.value?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.sessionSubject.value?.refreshToken ?? null;
  }

  getRole(): UserRole | null {
    return this.sessionSubject.value?.role ?? null;
  }

  getCurrentRole(): UserRole | null {
    return this.getRole();
  }

  getCurrentUser(): Pick<AuthSession, 'username' | 'role'> | null {
    const session = this.sessionSubject.value;
    if (!session) {
      return null;
    }

    return {
      username: session.username,
      role: session.role
    };
  }

  getCurrentEnseignantId(): number | null {
    return this.sessionSubject.value?.enseignantId ?? null;
  }

  getCurrentEtudiantId(): number | null {
    return this.sessionSubject.value?.etudiantId ?? null;
  }

  isAuthenticated(): boolean {
    return this.hasRefreshableSession();
  }

  hasValidAccessToken(): boolean {
    const session = this.sessionSubject.value;
    return !!session && session.accessTokenExpiresAt > Date.now() + EXPIRATION_SKEW_MS;
  }

  hasRefreshableSession(): boolean {
    const session = this.sessionSubject.value;
    return !!session && session.refreshTokenExpiresAt > Date.now() + EXPIRATION_SKEW_MS;
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.hasValidAccessToken()) {
      return of(true);
    }

    if (!this.hasRefreshableSession()) {
      this.logout();
      return of(false);
    }

    return this.refresh().pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  hasRole(role: UserRole | string): boolean {
    return this.getRole() === role;
  }

  hasAnyRole(roles: readonly (UserRole | string)[]): boolean {
    const role = this.getRole();
    return !!role && roles.includes(role);
  }

  private storeResponse(response: AuthResponse): void {
    const now = Date.now();
    const session: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      username: response.username,
      role: response.role,
      enseignantId: response.enseignantId ?? null,
      etudiantId: response.etudiantId ?? null,
      accessTokenExpiresAt: now + response.expiresInMs,
      refreshTokenExpiresAt: now + response.refreshExpiresInMs
    };
    this.writeSession(session);
    this.sessionSubject.next(session);
  }

  private readSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session.refreshTokenExpiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private writeSession(session: AuthSession | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (!session) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}
