import { CanActivateFn } from '@angular/router';

export const approvedGuardGuard: CanActivateFn = (route, state) => {
  return true;
};