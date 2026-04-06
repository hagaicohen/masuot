import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',     loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'simulator', loadComponent: () => import('./components/simulator/simulator.component').then(m => m.SimulatorComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
