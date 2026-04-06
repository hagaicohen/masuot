import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';
import { AdminParams } from '../models/simulator.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  params = signal<AdminParams | null>(null);

  constructor(private http: HttpClient) {}

  loadParams() {
    this.http.get<any>(`${environment.apiUrl}/constants`)
      .subscribe(data => {
        this.params.set(data);
      });
  }

  loadMockParams() {
    this.params.set({
      education: { daycare: 3041, kindergarten: 773, elementary: 675, middle: 1040, high: 1229, subsidyPercentage: 0 },
      health: { young: 116, middle: 185, senior: 825, subsidy: 227 },
      communityTax: 1500, propertyTax: 298, balanceTaxRate: 0.068,
      pensionAddition: 676, childAllowance: 270
    });
  }
}