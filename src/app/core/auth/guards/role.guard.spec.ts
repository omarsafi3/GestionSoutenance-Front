import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['ensureAuthenticated', 'hasAnyRole']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => new UrlTreeMock(commands) } }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('sends unauthenticated users to login', () => {
    authService.ensureAuthenticated.and.returnValue(of(false));

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)
    ) as any;

    result.subscribe((value: unknown) => {
      expect(value).toEqual(router.createUrlTree(['/login']));
    });
  });

  it('sends authenticated users without the role to unauthorized', () => {
    authService.ensureAuthenticated.and.returnValue(of(true));
    authService.hasAnyRole.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)
    ) as any;

    result.subscribe((value: unknown) => {
      expect(value).toEqual(router.createUrlTree(['/unauthorized']));
    });
  });

  it('allows users with a required role', () => {
    authService.ensureAuthenticated.and.returnValue(of(true));
    authService.hasAnyRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ENSEIGNANT'] } } as any, {} as any)
    ) as any;

    result.subscribe((value: unknown) => {
      expect(value).toBeTrue();
    });
  });
});

class UrlTreeMock {
  constructor(readonly commands: string[]) {}
}
