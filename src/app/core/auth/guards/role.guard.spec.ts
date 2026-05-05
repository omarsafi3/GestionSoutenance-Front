import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'hasAnyRole']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => new UrlTreeMock(commands) } }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('sends unauthenticated users to login', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)
    );

    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('sends authenticated users without the role to unauthorized', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)
    );

    expect(result).toEqual(router.createUrlTree(['/unauthorized']));
  });

  it('allows users with a required role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ENSEIGNANT'] } } as any, {} as any)
    );

    expect(result).toBeTrue();
  });
});

class UrlTreeMock {
  constructor(readonly commands: string[]) {}
}
