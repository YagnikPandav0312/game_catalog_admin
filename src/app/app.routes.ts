import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'providers',
        loadComponent: () => import('./features/providers/providers').then((m) => m.Providers),
      },
      {
        path: 'game-type',
        loadComponent: () => import('./features/game-type/game-type').then((m) => m.GameType)
      },
      {
        path: 'game-category',
        loadComponent: () => import('./features/game-category/game-category').then((m) => m.GameCategory)
      },
      {
        path: 'device-type',
        loadComponent: () => import('./features/device-type/device-type').then((m) => m.DeviceType)
      },
      {
        path: 'games',
        loadComponent: () => import('./features/games/games').then((m) => m.Games)
      },
      {
        path: 'player',
        loadComponent: () => import('./features/player/player').then((m) => m.Player)
      },
      {
        path: 'sport',
        loadComponent: () => import('./features/sport/sport').then((m) => m.Sport)
      },
      {
        path: 'country',
        loadComponent: () => import('./features/country/country').then((m) => m.Country)
      }
    ],
  },
];
