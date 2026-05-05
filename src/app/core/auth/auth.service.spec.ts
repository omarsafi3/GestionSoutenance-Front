import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores linked ids from login response', () => {
    service.login({ username: 'teacher.ayari', password: 'demo1234' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresInMs: 60_000,
      refreshExpiresInMs: 120_000,
      username: 'teacher.ayari',
      role: 'ENSEIGNANT',
      enseignantId: 1,
      etudiantId: null
    });

    expect(service.getCurrentRole()).toBe('ENSEIGNANT');
    expect(service.getCurrentEnseignantId()).toBe(1);
    expect(service.getCurrentEtudiantId()).toBeNull();
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout clears the current session', () => {
    service.login({ username: 'student.omar', password: 'demo1234' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresInMs: 60_000,
      refreshExpiresInMs: 120_000,
      username: 'student.omar',
      role: 'ETUDIANT',
      enseignantId: null,
      etudiantId: 1
    });

    service.logout();

    expect(service.getAccessToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
