import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'claims',
    pathMatch: 'full'
  },
  {
    path: 'claims',
    loadComponent: () =>
      import('./components/claim-list/claim-list')
        .then(m => m.ClaimListComponent)
  },
  {
    path: '**',
    redirectTo: 'claims'
  }
];