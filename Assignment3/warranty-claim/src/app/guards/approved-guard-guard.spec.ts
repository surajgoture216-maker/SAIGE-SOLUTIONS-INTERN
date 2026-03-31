import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { approvedGuardGuard } from './approved-guard-guard';

describe('approvedGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => approvedGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
