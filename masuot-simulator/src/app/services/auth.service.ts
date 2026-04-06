import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../src/environments/environment';
import { FamilyService } from './family.service';
import { AdminService } from './admin.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  budgetCode = signal<string | null>(null);

  constructor(private router: Router,
              private familyService: FamilyService,
              private adminService: AdminService) {
    const saved = localStorage.getItem('budgetCode');
    if (saved) { this.isLoggedIn.set(true); this.budgetCode.set(saved); }
  }

  login(code: string, password: string): Promise<void> {
  return fetch(`${environment.apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      budget_code: code,
      password: password
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  })
  .then((data) => {
    this.isLoggedIn.set(true);
    this.budgetCode.set(code);

    localStorage.setItem('budgetCode', code);
    localStorage.setItem('token', data.token);

    // ❌ להסיר await
    this.familyService.loadFamily();
    //this.adminService.loadMockParams();

    this.router.navigate(['/simulator']);
  });
  }

  logout() {
    this.isLoggedIn.set(false);
    this.budgetCode.set(null);
    localStorage.removeItem('budgetCode');
    this.router.navigate(['/login']);
  }
}
