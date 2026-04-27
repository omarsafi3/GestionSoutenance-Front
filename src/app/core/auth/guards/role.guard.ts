import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

function toRoleList(roles: string | readonly string[]): readonly string[] {
  return Array.isArray(roles) ? roles : [roles];
}

function unauthorizedTree(router: Router) {
  return router.createUrlTree(['/login']);
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : unauthorizedTree(router);
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return unauthorizedTree(router);
  }

  const rolesFromData = route.data?.['roles'];
  if (!Array.isArray(rolesFromData) || rolesFromData.length === 0) {
    return true;
  }

  return authService.hasAnyRole(rolesFromData) ? true : unauthorizedTree(router);
};

export function requireRoleGuard(role: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() && authService.hasRole(role) ? true : unauthorizedTree(router);
  };
}

export function requireAnyRoleGuard(roles: readonly string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() && authService.hasAnyRole(roles) ? true : unauthorizedTree(router);
  };
}

export function hasRequiredRole(authService: AuthService, roles: string | readonly string[]): boolean {
  return authService.hasAnyRole(toRoleList(roles));
}
