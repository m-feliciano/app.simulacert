import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

export const adminGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated && authFacade.isAdmin) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

