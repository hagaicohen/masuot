import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { FamilyService } from './family.service';
import { AdminService } from './admin.service';
import { LoadingService } from './loading.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  budgetCode = signal<string | null>(null);

  constructor(
    private router: Router,
    private familyService: FamilyService,
    private adminService: AdminService,
    private loading: LoadingService,
  ) {
    const saved = localStorage.getItem('budgetCode');
    if (saved) {
      this.isLoggedIn.set(true);
      this.budgetCode.set(saved);
    }
  }

  login(code: string, password: string): Promise<void> {
    this.loading.show();

    return fetch(
      `${environment.apiUrl}/api/auth/login`,

      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          budget_code: code,

          password: password,
        }),
      },
    )
      .then((res) => {
        if (!res.ok) {
          this.loading.hide();

          throw new Error('Login failed');
        }

        return res.json();
      })

      .then((data) => {
        this.isLoggedIn.set(true);

        this.budgetCode.set(code);

        localStorage.setItem('budgetCode', code);

        localStorage.setItem('token', data.token);

        this.familyService.loadFamily();

        this.loading.hide(2000);

        this.router.navigate(['/simulator']);
      })

      .catch((err) => {
        this.loading.hide();

        throw err;
      });
  }

  logout() {
    this.isLoggedIn.set(false);
    this.budgetCode.set(null);
    localStorage.removeItem('budgetCode');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
