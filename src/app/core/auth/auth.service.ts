import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthSession, LoginRequest, RefreshTokenRequest, UserRole } from './auth.models';

const STORAGE_KEY = 'soutenance.auth.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.readSession());

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
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, request).pipe(
      tap((response) => this.storeResponse(response))
    );
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

  isAuthenticated(): boolean {
    const session = this.sessionSubject.value;
    return !!session && session.accessTokenExpiresAt > Date.now();
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
