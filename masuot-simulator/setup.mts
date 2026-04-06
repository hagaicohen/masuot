import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const base = 'src/app';

const files: Record<string, string> = {

  // ── Styles ──
  'styles.scss': `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }

:root {
  --color-primary:       #1e5c38;
  --color-primary-light: #2d7a4f;
  --color-bg-page:       #eef0ee;
  --color-bg-card:       #ffffff;
  --color-bg-l2:         #f7fbf7;
  --color-bg-l3:         #f2f8f2;
  --color-bg-l4:         #edf5ed;
  --color-border:        #d4ddd4;
  --color-border-inner:  #e8f0e8;
  --color-text-primary:  #1a3d28;
  --color-text-secondary:#555555;
  --color-text-muted:    #aaaaaa;
  --color-green:         #1a7a45;
  --color-red:           #a32d2d;
  --color-badge-bg:      #e8f5e0;
  --color-badge-color:   #2d6b43;
  --color-badge-border:  #a8d4a0;
  --color-red-badge-bg:     #fdf0f0;
  --color-red-badge-color:  #a32d2d;
  --color-red-badge-border: #f0c8c8;
  --color-edit-bg:       #e6f1fb;
  --color-edit-border:   #b5d4f4;
  --color-edit-color:    #185fa5;
  --border-radius-card:  12px;
  --header-height:       72px;
  --summary-bar-height:  56px;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, sans-serif;
  direction: rtl;
  background: var(--color-bg-page);
  min-height: 100vh;
  padding-top: var(--header-height);
  padding-bottom: var(--summary-bar-height);
}

.ac {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  margin-bottom: 8px;
  overflow: hidden;
}

.ac-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}
.ac-head:hover { background: #f7fbf7; }

.ac-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.ac-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 140px;
}

.ac-badge {
  font-size: 13px;
  color: var(--color-badge-color);
  background: var(--color-badge-bg);
  border: 1px dashed var(--color-badge-border);
  border-radius: 99px;
  padding: 3px 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ac-badge-red {
  color: var(--color-red-badge-color) !important;
  background: var(--color-red-badge-bg) !important;
  border-color: var(--color-red-badge-border) !important;
}

.ac-extras {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.ac-extras .chev { margin-left: 10px; }

.chev {
  width: 14px;
  height: 14px;
  border-right: 2px solid #6b9e7a;
  border-bottom: 2px solid #6b9e7a;
  transform: rotate(45deg);
  transition: transform 0.22s;
  margin-top: -4px;
  flex-shrink: 0;
}
.chev.open { transform: rotate(-135deg); margin-top: 4px; }

.ac-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.32s ease;
  border-top: 1px solid var(--color-border-inner);
}
.ac-body.open { max-height: 3000px; }
.ac-inner { padding: 10px 12px; }

.l1 > .ac-head { background: var(--color-bg-card); }
.l1 > .ac-head .ac-title { font-size: 16px; }
.l2 > .ac-head { background: var(--color-bg-l2); }
.l2 .ac-inner { padding: 4px 0; }
.l3 > .ac-head { background: var(--color-bg-l3); padding: 10px 14px; }
.l3 > .ac-head .ac-title { font-size: 13px; }
.l3 .ac-inner { padding: 4px 0; }
.l4 > .ac-head { background: var(--color-bg-l4); padding: 9px 12px; }
.l4 > .ac-head .ac-title { font-size: 12px; font-weight: 600; }
.l4 .ac-body { background: #f7fbf7; }

.inner-padded { padding: 4px 6px; }

.leaf {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 4px;
  border-bottom: 1px solid #f0f6f0;
  font-size: 13px;
}
.leaf:last-child { border-bottom: none; }
.leaf-label { color: var(--color-text-secondary); }
.leaf-val { font-weight: 600; color: var(--color-text-primary); }
.leaf-val.green { color: var(--color-green); }
.leaf-val.red   { color: var(--color-red); }
.leaf-val.muted { color: var(--color-text-muted); font-weight: 400; }

.leaf-input {
  width: 120px;
  border: 1px solid #d4e4cc;
  border-radius: 7px;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
  font-family: inherit;
  background: #fff;
}
.leaf-input:focus { outline: none; border-color: var(--color-primary-light); }

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px 4px;
  border-top: 2px solid var(--color-border-inner);
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.net-box {
  background: #e8f5e0;
  border: 1px solid #c0e0b0;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.net-box .net-label { font-size: 14px; font-weight: 600; color: #1a5c30; }
.net-box .net-val   { font-size: 24px; font-weight: 700; color: var(--color-green); }

@media (max-width: 600px) {
  .ac-title  { min-width: 0 !important; }
  .ac-badge  { max-width: 180px; }
  .ac-head   { padding: 11px 12px; }
  .l2 .ac-inner, .l3 .ac-inner { padding: 3px 0; }
}
`,

  // ── Models ──
  'app/models/simulator.models.ts': `
export interface FamilyMember {
  id: string;
  name: string;
  birthDate: Date;
  status: 'employed' | 'retired' | 'unemployed';
  currentSalary: number;
  expectedSalary: number;
}

export interface Child {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  educationLevel: 'daycare' | 'kindergarten' | 'elementary' | 'middle' | 'high';
}

export interface FamilyData {
  familyName: string;
  budgetCode: string;
  members: FamilyMember[];
  children: Child[];
}

export interface AdminParams {
  education: { daycare: number; kindergarten: number; elementary: number; middle: number; high: number; subsidyPercentage: number; };
  health: { young: number; middle: number; senior: number; subsidy: number; };
  communityTax: number;
  propertyTax: number;
  balanceTaxRate: number;
  pensionAddition: number;
  childAllowance: number;
}

export interface SimulationResult {
  currentState: number;
  budgetDistribution: number; personalBonus: number; womenWorkBenefit: number;
  travel: number; periodicGrant: number; specialHelp: number;
  totalIncome: number; netSalary: number; updatedNetSalary: number;
  pension: number; survivors: number; oldAgePension: number;
  childAllowances: number; savingsFund: number; pensionAddition: number;
  totalExpenses: number; educationExpenses: number; healthExpenses: number;
  taxes: number; balanceTax: number; communityTax: number; propertyTax: number;
  netDisposableIncome: number; diff: number;
}
`,

  // ── Services ──
  'app/services/admin.service.ts': `
import { Injectable, signal } from '@angular/core';
import { AdminParams } from '../models/simulator.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  params = signal<AdminParams | null>(null);
  constructor() { this.loadMockParams(); }

  loadMockParams() {
    this.params.set({
      education: { daycare: 3041, kindergarten: 773, elementary: 675, middle: 1040, high: 1229, subsidyPercentage: 0 },
      health: { young: 116, middle: 185, senior: 825, subsidy: 227 },
      communityTax: 1500, propertyTax: 298, balanceTaxRate: 0.068,
      pensionAddition: 676, childAllowance: 270
    });
  }
}
`,

  'app/services/family.service.ts': `
import { Injectable, signal } from '@angular/core';
import { FamilyData } from '../models/simulator.models';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  family = signal<FamilyData | null>(null);

  loadMockFamily() {
    this.family.set({
      familyName: 'אריאל',
      budgetCode: '1234',
      members: [
        { id: '1', name: 'ישראל אריאל',   birthDate: new Date('1987-03-15'), status: 'employed', currentSalary: 20000, expectedSalary: 20000 },
        { id: '2', name: 'ישראלה אריאל',  birthDate: new Date('1989-07-20'), status: 'employed', currentSalary: 10000, expectedSalary: 10000 }
      ],
      children: [
        { id: '1', name: 'אבי',  gender: 'male',   age: 3.5, educationLevel: 'kindergarten' },
        { id: '2', name: 'שירה', gender: 'female', age: 8,   educationLevel: 'elementary'   },
        { id: '3', name: 'משה',  gender: 'male',   age: 12,  educationLevel: 'high'         }
      ]
    });
  }
}
`,

  'app/services/simulator.service.ts': `
import { Injectable, computed, inject } from '@angular/core';
import { FamilyService } from './family.service';
import { AdminService } from './admin.service';

@Injectable({ providedIn: 'root' })
export class SimulatorService {
  private family = inject(FamilyService).family;
  private params = inject(AdminService).params;

  result = computed(() => {
    const f = this.family();
    const p = this.params();
    if (!f || !p) return null;

    const totalExpected = f.members.reduce((s, m) => s + m.expectedSalary, 0);
    const gross = totalExpected * 1.125;
    const childAllowances = f.children.length * p.childAllowance;
    const pensionAddition = p.pensionAddition;
    const totalIncome = totalExpected + childAllowances + pensionAddition;

    const eduExpenses = f.children.reduce((s, c) => {
      const rates: Record<string,number> = { daycare: p.education.daycare, kindergarten: p.education.kindergarten, elementary: p.education.elementary, middle: p.education.middle, high: p.education.high };
      return s + (rates[c.educationLevel] ?? 0);
    }, 0);

    const totalPeople = f.members.length + f.children.length;
    const healthExpenses = (totalPeople * 193) - p.health.subsidy;
    const balanceTax = totalExpected * p.balanceTaxRate;
    const taxes = balanceTax + p.communityTax + p.propertyTax;
    const totalExpenses = eduExpenses + healthExpenses + taxes;
    const netDisposableIncome = totalIncome - totalExpenses;
    const currentState = 19861;

    return {
      currentState,
      budgetDistribution: 11097, personalBonus: 6503, womenWorkBenefit: 407,
      travel: 1310, periodicGrant: 544, specialHelp: 0,
      totalIncome, netSalary: totalExpected, updatedNetSalary: gross,
      pension: 0, survivors: 0, oldAgePension: 0,
      childAllowances, savingsFund: 0, pensionAddition,
      totalExpenses, educationExpenses: eduExpenses, healthExpenses,
      taxes, balanceTax, communityTax: p.communityTax, propertyTax: p.propertyTax,
      netDisposableIncome, diff: currentState - netDisposableIncome
    };
  });

  updateExpectedSalary(memberId: string, value: number) {
    const f = this.family();
    if (!f) return;
    const updated = { ...f, members: f.members.map(m => m.id === memberId ? { ...m, expectedSalary: value } : m) };
    inject(FamilyService).family.set(updated);
  }
}
`,

  'app/services/auth.service.ts': `
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  budgetCode = signal<string | null>(null);

  constructor(private router: Router) {
    const saved = localStorage.getItem('budgetCode');
    if (saved) { this.isLoggedIn.set(true); this.budgetCode.set(saved); }
  }

  login(code: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (code && password) {
        this.isLoggedIn.set(true);
        this.budgetCode.set(code);
        localStorage.setItem('budgetCode', code);
        this.router.navigate(['/simulator']);
        resolve();
      } else {
        reject('קוד או סיסמה שגויים');
      }
    });
  }

  logout() {
    this.isLoggedIn.set(false);
    this.budgetCode.set(null);
    localStorage.removeItem('budgetCode');
    this.router.navigate(['/login']);
  }
}
`,

  // ── Guard ──
  'app/guards/auth.guard.ts': `
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};
`,

  // ── Routes ──
  'app/app.routes.ts': `
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',     loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'simulator', loadComponent: () => import('./components/simulator/simulator.component').then(m => m.SimulatorComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
`,

  // ── Shared: accordion-panel ──
  'app/components/shared/accordion-panel/accordion-panel.component.ts': `
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-panel.component.html'
})
export class AccordionPanelComponent {
  @Input() title    = '';
  @Input() badge    = '';
  @Input() level    = 1;
  @Input() open     = false;
  @Input() badgeRed = false;
  toggle() { this.open = !this.open; }
}
`,

  'app/components/shared/accordion-panel/accordion-panel.component.html': `
<div class="ac" [ngClass]="'l' + level">
  <div class="ac-head" (click)="toggle()">
    <div class="ac-head-right">
      <span class="ac-title">{{ title }}</span>
      <span *ngIf="badge" class="ac-badge" [class.ac-badge-red]="badgeRed">{{ badge }}</span>
      <ng-content select="[slot=badge-extra]"></ng-content>
    </div>
    <div class="ac-extras">
      <ng-content select="[slot=actions]"></ng-content>
      <div class="chev" [class.open]="open"></div>
    </div>
  </div>
  <div class="ac-body" [class.open]="open">
    <div class="ac-inner">
      <ng-content></ng-content>
    </div>
  </div>
</div>
`,

  // ── Login ──
  'app/components/login/login.component.ts': `
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  code = ''; password = ''; error = ''; loading = false;
  constructor(private auth: AuthService) {}
  async onSubmit() {
    this.error = ''; this.loading = true;
    try { await this.auth.login(this.code, this.password); }
    catch (err: any) { this.error = err; }
    finally { this.loading = false; }
  }
}
`,

  'app/components/login/login.component.html': `
<div class="login-page">
  <div class="login-card">
    <div class="login-logo"><img src="/logo.jpg" alt="משואות יצחק" /></div>
    <h1 class="login-title">משואות יצחק</h1>
    <p class="login-sub">סימולטור הכנסה פנויה</p>
    <form (ngSubmit)="onSubmit()">
      <div class="field">
        <label>קוד תקציב</label>
        <input type="text" [(ngModel)]="code" name="code" placeholder="הכנס קוד תקציב" required />
      </div>
      <div class="field">
        <label>סיסמה</label>
        <input type="password" [(ngModel)]="password" name="password" placeholder="הכנס סיסמה" required />
      </div>
      <p class="login-error" *ngIf="error">{{ error }}</p>
      <button type="submit" [disabled]="loading">{{ loading ? 'מתחבר...' : 'כניסה' }}</button>
    </form>
  </div>
</div>
`,

  'app/components/login/login.component.scss': `
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg-page); padding: 20px; }
.login-card { background: #fff; border-radius: 16px; border: 1px solid var(--color-border); padding: 40px 32px; width: 100%; max-width: 360px; text-align: center; }
.login-logo img { width: 80px; height: 80px; object-fit: cover; border-radius: 16px; margin-bottom: 16px; }
.login-title { font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px; }
.login-sub { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 28px; }
.field { text-align: right; margin-bottom: 16px; }
.field label { display: block; font-size: 13px; color: var(--color-text-secondary); margin-bottom: 5px; }
.field input { width: 100%; border: 1px solid #d4e4cc; border-radius: 8px; padding: 10px 14px; font-size: 14px; font-family: inherit; color: var(--color-text-primary); }
.field input:focus { outline: none; border-color: var(--color-primary-light); }
.login-error { font-size: 13px; color: var(--color-red); margin-bottom: 12px; }
button { width: 100%; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; }
button:hover { background: var(--color-primary-light); }
button:disabled { opacity: 0.6; cursor: not-allowed; }
`,

  // ── Header ──
  'app/components/simulator/header/header.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../services/family.service';
import { AuthService } from '../../../services/auth.service';

@Component({ selector: 'app-header', standalone: true, imports: [CommonModule], templateUrl: './header.component.html', styleUrl: './header.component.scss' })
export class HeaderComponent {
  family = inject(FamilyService).family;
  auth   = inject(AuthService);
}
`,

  'app/components/simulator/header/header.component.html': `
<header class="header">
  <div class="header-left">
    <div class="logo"><img src="/logo.jpg" alt="לוגו" /></div>
    <div class="header-text">
      <div class="header-title">
        משואות יצחק
        <span class="header-sub-inline">סימולטור הכנסה פנויה</span>
      </div>
      <div class="header-sub" *ngIf="family()">
        משפחת {{ family()!.familyName }} · קוד תקציב {{ family()!.budgetCode }}
      </div>
    </div>
  </div>
  <button class="btn-logout" (click)="auth.logout()">↺ יציאה</button>
</header>
`,

  'app/components/simulator/header/header.component.scss': `
.header { position: fixed; top: 0; right: 0; left: 0; z-index: 200; height: var(--header-height); background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.logo img { width: 44px; height: 44px; object-fit: cover; border-radius: 10px; background: #fff; }
.header-title { font-size: 20px; font-weight: 700; display: flex; align-items: baseline; gap: 8px; }
.header-sub-inline { font-size: 13px; font-weight: 400; opacity: 0.85; }
.header-sub { font-size: 12px; opacity: 0.7; margin-top: 2px; }
.btn-logout { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3); border-radius: 8px; padding: 6px 14px; font-size: 13px; color: #fff; cursor: pointer; font-family: inherit; }
.btn-logout:hover { background: rgba(255,255,255,.25); }
`,

  // ── Summary Bar ──
  'app/components/simulator/summary-bar/summary-bar.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';

@Component({ selector: 'app-summary-bar', standalone: true, imports: [CommonModule], templateUrl: './summary-bar.component.html', styleUrl: './summary-bar.component.scss' })
export class SummaryBarComponent {
  result = inject(SimulatorService).result;
}
`,

  'app/components/simulator/summary-bar/summary-bar.component.html': `
<div class="sum-bar" *ngIf="result()">
  <div class="sum-inner">
    <div class="sum-item"><div class="sum-lbl">הכנסות</div><div class="sum-val">{{ result()!.totalIncome | number:'1.0-0' }} ₪</div></div>
    <div class="sum-div"></div>
    <div class="sum-item"><div class="sum-lbl">הוצאות</div><div class="sum-val">{{ result()!.totalExpenses | number:'1.0-0' }} ₪</div></div>
    <div class="sum-div"></div>
    <div class="sum-item"><div class="sum-lbl">הכנסה פנויה</div><div class="sum-val green">{{ result()!.netDisposableIncome | number:'1.0-0' }} ₪</div></div>
    <div class="sum-div"></div>
    <div class="sum-item">
      <div class="sum-lbl">הפרש</div>
      <div class="sum-val" [class.red]="result()!.diff > 0" [class.green]="result()!.diff <= 0">
        {{ result()!.diff > 0 ? '▼' : '▲' }} {{ result()!.diff | number:'1.0-0' }} ₪
      </div>
    </div>
  </div>
</div>
`,

  'app/components/simulator/summary-bar/summary-bar.component.scss': `
.sum-bar { position: fixed; bottom: 0; right: 0; left: 0; z-index: 100; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); padding: 10px 24px; box-shadow: 0 -2px 12px rgba(0,0,0,.2); }
.sum-inner { max-width: 860px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1px 1fr 1px 1fr 1px 1fr; align-items: center; }
.sum-div { background: rgba(255,255,255,.2); height: 32px; }
.sum-item { text-align: center; padding: 0 4px; }
.sum-lbl { font-size: 10px; color: #9FE1CB; margin-bottom: 1px; white-space: nowrap; }
.sum-val { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; }
.sum-val.green { color: #C0DD97; }
.sum-val.red   { color: #f9a8a8; }
@media (max-width: 600px) { .sum-bar { padding: 10px 6px; } .sum-val { font-size: 12px; } .sum-lbl { font-size: 9px; } }
`,

  // ── Simulator root ──
  'app/components/simulator/simulator.component.ts': `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../services/family.service';
import { HeaderComponent } from './header/header.component';
import { BaseFamilyComponent } from './base-family/base-family.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { NewStateComponent } from './new-state/new-state.component';
import { DiffComponent } from './diff/diff.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BaseFamilyComponent, CurrentStateComponent, NewStateComponent, DiffComponent, SummaryBarComponent],
  templateUrl: './simulator.component.html',
  styleUrl: './simulator.component.scss'
})
export class SimulatorComponent implements OnInit {
  private familyService = inject(FamilyService);
  ngOnInit() { this.familyService.loadMockFamily(); }
}
`,

  'app/components/simulator/simulator.component.html': `
<app-header></app-header>
<div class="main">
  <app-base-family></app-base-family>
  <app-current-state></app-current-state>
  <app-new-state></app-new-state>
  <app-diff></app-diff>
</div>
<app-summary-bar></app-summary-bar>
`,

  'app/components/simulator/simulator.component.scss': `
.main { max-width: 860px; margin: 0 auto; padding: 14px 20px 20px; }
`,

  // ── Base Family ──
  'app/components/simulator/base-family/base-family.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../services/family.service';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { MembersComponent } from './members/members.component';
import { ChildrenComponent } from './children/children.component';
import { SalariesComponent } from './salaries/salaries.component';

@Component({
  selector: 'app-base-family',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent, MembersComponent, ChildrenComponent, SalariesComponent],
  templateUrl: './base-family.component.html'
})
export class BaseFamilyComponent {
  family = inject(FamilyService).family;
  result = inject(SimulatorService).result;

  get badge(): string {
    const f = this.family();
    if (!f) return '';
    const total = f.members.length + f.children.length;
    const net = this.result()?.netSalary ?? 0;
    return \`\${total} נפשות · נטו \${net.toLocaleString('he-IL')} ₪\`;
  }
}
`,

  'app/components/simulator/base-family/base-family.component.html': `
<app-accordion-panel title="נתוני בסיס" [badge]="badge" [level]="1" [open]="true">
  <app-members></app-members>
  <app-children></app-children>
  <app-salaries></app-salaries>
</app-accordion-panel>
`,

  // ── Members ──
  'app/components/simulator/base-family/members/members.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-members', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './members.component.html' })
export class MembersComponent {
  family = inject(FamilyService).family;
  get badge() { const f = this.family(); return f ? \`\${f.members.length} חברים\` : ''; }
}
`,

  'app/components/simulator/base-family/members/members.component.html': `
<app-accordion-panel title="חברים" [badge]="badge" [level]="2">
  <div class="inner-padded">
    <app-accordion-panel
      *ngFor="let m of family()?.members; let i = index"
      [title]="'חבר ' + (i+1)"
      [badge]="m.name"
      [level]="3">
      <div class="leaf"><span class="leaf-label">שם</span><span class="leaf-val">{{ m.name }}</span></div>
      <div class="leaf"><span class="leaf-label">סטטוס</span><span class="leaf-val">{{ m.status === 'employed' ? 'עובד/ת' : m.status }}</span></div>
    </app-accordion-panel>
  </div>
</app-accordion-panel>
`,

  // ── Children ──
  'app/components/simulator/base-family/children/children.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-children', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './children.component.html' })
export class ChildrenComponent {
  family = inject(FamilyService).family;
  get badge() { const f = this.family(); return f ? \`\${f.children.length} ילדים\` : ''; }
  eduLabel(level: string): string {
    const map: Record<string,string> = { daycare: 'פעוטון', kindergarten: 'גן', elementary: 'יסודי', middle: 'חטיבה', high: 'תיכון' };
    return map[level] ?? level;
  }
}
`,

  'app/components/simulator/base-family/children/children.component.html': `
<app-accordion-panel title="ילדים" [badge]="badge" [level]="2">
  <div class="inner-padded">
    <app-accordion-panel
      *ngFor="let c of family()?.children; let i = index"
      [title]="'ילד ' + (i+1)"
      [badge]="c.name + ' · ' + c.age + ' · ' + eduLabel(c.educationLevel)"
      [level]="3">
      <div class="leaf"><span class="leaf-label">שם</span><span class="leaf-val">{{ c.name }}</span></div>
      <div class="leaf"><span class="leaf-label">גיל</span><span class="leaf-val">{{ c.age }}</span></div>
      <div class="leaf"><span class="leaf-label">מסגרת</span><span class="leaf-val">{{ eduLabel(c.educationLevel) }}</span></div>
    </app-accordion-panel>
  </div>
</app-accordion-panel>
`,

  // ── Salaries ──
  'app/components/simulator/base-family/salaries/salaries.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../../../../services/family.service';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-salaries', standalone: true, imports: [CommonModule, FormsModule, AccordionPanelComponent], templateUrl: './salaries.component.html', styleUrl: './salaries.component.scss' })
export class SalariesComponent {
  family  = inject(FamilyService).family;
  private sim = inject(SimulatorService);

  get badge() {
    const r = this.sim.result();
    if (!r) return '';
    return \`נטו \${r.netSalary.toLocaleString('he-IL')} ₪ · לחישוב \${r.updatedNetSalary.toLocaleString('he-IL')} ₪\`;
  }

  memberBadge(m: any) { return \`נטו \${m.expectedSalary.toLocaleString('he-IL')} ₪\`; }

  updateSalary(memberId: string, value: string) {
    const num = parseFloat(value.replace(/,/g,'')) || 0;
    this.sim.updateExpectedSalary(memberId, num);
  }
}
`,

  'app/components/simulator/base-family/salaries/salaries.component.html': `
<app-accordion-panel title="משכורות" [badge]="badge" [level]="2">
  <div class="inner-padded">
    <app-accordion-panel
      *ngFor="let m of family()?.members; let i = index"
      [title]="'משכורת ' + (i+1) + ' — ' + m.name"
      [badge]="memberBadge(m)"
      [level]="3">
      <div class="leaf">
        <span class="leaf-label">שכר נטו נוכחי</span>
        <span class="leaf-val">{{ m.currentSalary | number:'1.0-0' }} ₪</span>
      </div>
      <div class="leaf">
        <span class="leaf-label">שכר נטו צפוי</span>
        <input class="leaf-input" type="text" [value]="m.expectedSalary | number:'1.0-0'" (change)="updateSalary(m.id, $any($event.target).value)" inputmode="numeric" />
      </div>
      <div class="leaf">
        <span class="leaf-label">לחישוב (ברוטו)</span>
        <span class="leaf-val">{{ (m.expectedSalary * 1.125) | number:'1.0-0' }} ₪</span>
      </div>
    </app-accordion-panel>
  </div>
</app-accordion-panel>
`,

  'app/components/simulator/base-family/salaries/salaries.component.scss': `
.leaf-input { width: 130px; border: 1px solid #d4e4cc; border-radius: 7px; padding: 5px 10px; font-size: 14px; font-weight: 600; color: var(--color-text-primary); text-align: right; font-family: inherit; background: #fff; }
.leaf-input:focus { outline: none; border-color: var(--color-primary-light); }
`,

  // ── Current State ──
  'app/components/simulator/current-state/current-state.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-current-state', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './current-state.component.html' })
export class CurrentStateComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.currentState.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/current-state/current-state.component.html': `
<app-accordion-panel title="מצב קיים" [badge]="badge" [level]="1">
  <div class="leaf"><span class="leaf-label">חלוקת תקציב</span><span class="leaf-val green">{{ result()!.budgetDistribution | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">תגמול אישי</span><span class="leaf-val green">{{ result()!.personalBonus | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">סל הטבות עבודת אישה</span><span class="leaf-val green">{{ result()!.womenWorkBenefit | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">נסיעות</span><span class="leaf-val green">{{ result()!.travel | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">מענק תקופתי</span><span class="leaf-val green">{{ result()!.periodicGrant | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">מיוחד - עזרה בבית</span><span class="leaf-val muted">{{ result()!.specialHelp | number:'1.0-0' }} ₪</span></div>
  <div class="total-row"><span>סה"כ</span><span>{{ result()!.currentState | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── New State ──
  'app/components/simulator/new-state/new-state.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { IncomeComponent } from './income/income.component';
import { ExpensesComponent } from './expenses/expenses.component';

@Component({ selector: 'app-new-state', standalone: true, imports: [CommonModule, AccordionPanelComponent, IncomeComponent, ExpensesComponent], templateUrl: './new-state.component.html' })
export class NewStateComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? 'הכנסה פנויה: ' + r.netDisposableIncome.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/new-state/new-state.component.html': `
<app-accordion-panel title="מצב חדש" [badge]="badge" [level]="1">
  <app-income></app-income>
  <app-expenses></app-expenses>
  <div class="net-box" *ngIf="result()">
    <span class="net-label">הכנסה פנויה נטו</span>
    <span class="net-val">{{ result()!.netDisposableIncome | number:'1.0-0' }} ₪</span>
  </div>
</app-accordion-panel>
`,

  // ── Income ──
  'app/components/simulator/new-state/income/income.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-income', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './income.component.html' })
export class IncomeComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.totalIncome.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/new-state/income/income.component.html': `
<app-accordion-panel title="הכנסות" [badge]="badge" [level]="2">
  <div class="leaf"><span class="leaf-label">שכר נטו</span><span class="leaf-val green">{{ result()!.netSalary | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">שכר נטו מעודכן</span><span class="leaf-val green">{{ result()!.updatedNetSalary | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">קצבאות ילדים</span><span class="leaf-val green">{{ result()!.childAllowances | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">תוספת פנסיה</span><span class="leaf-val green">{{ result()!.pensionAddition | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">פנסיה / שארים / זקנה</span><span class="leaf-val muted">0 ₪</span></div>
  <div class="total-row"><span>סה"כ הכנסות</span><span class="leaf-val green">{{ result()!.totalIncome | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── Expenses ──
  'app/components/simulator/new-state/expenses/expenses.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { EducationComponent } from './education/education.component';
import { HealthComponent } from './health/health.component';
import { TaxesComponent } from './taxes/taxes.component';

@Component({ selector: 'app-expenses', standalone: true, imports: [CommonModule, AccordionPanelComponent, EducationComponent, HealthComponent, TaxesComponent], templateUrl: './expenses.component.html' })
export class ExpensesComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.totalExpenses.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/new-state/expenses/expenses.component.html': `
<app-accordion-panel title="הוצאות" [badge]="badge" [level]="2" [badgeRed]="true">
  <app-education></app-education>
  <app-health></app-health>
  <app-taxes></app-taxes>
  <div class="total-row"><span>סה"כ הוצאות</span><span class="leaf-val red">{{ result()!.totalExpenses | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── Education ──
  'app/components/simulator/new-state/expenses/education/education.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../../services/family.service';
import { AdminService } from '../../../../../services/admin.service';
import { SimulatorService } from '../../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-education', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './education.component.html' })
export class EducationComponent {
  family = inject(FamilyService).family;
  admin  = inject(AdminService).params;
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.educationExpenses.toLocaleString('he-IL') + ' ₪' : ''; }
  eduLabel(level: string): string {
    const map: Record<string,string> = { daycare: 'פעוטון', kindergarten: 'גן', elementary: 'יסודי', middle: 'חטיבה', high: 'תיכון' };
    return map[level] ?? level;
  }
  eduRate(level: string): number {
    const p = this.admin();
    if (!p) return 0;
    const rates: Record<string,number> = { daycare: p.education.daycare, kindergarten: p.education.kindergarten, elementary: p.education.elementary, middle: p.education.middle, high: p.education.high };
    return rates[level] ?? 0;
  }
}
`,

  'app/components/simulator/new-state/expenses/education/education.component.html': `
<app-accordion-panel title="חינוך" [badge]="badge" [level]="3" [badgeRed]="true">
  <div class="inner-padded">
    <app-accordion-panel
      *ngFor="let c of family()?.children"
      [title]="eduLabel(c.educationLevel)"
      [badge]="'1 × ' + eduRate(c.educationLevel).toLocaleString('he-IL') + ' ₪'"
      [level]="4"
      [badgeRed]="true">
      <div class="leaf"><span class="leaf-label">{{ c.name }}</span><span class="leaf-val red">{{ eduRate(c.educationLevel) | number:'1.0-0' }} ₪</span></div>
    </app-accordion-panel>
  </div>
  <div class="total-row"><span>סה"כ חינוך</span><span class="leaf-val red">{{ result()!.educationExpenses | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── Health ──
  'app/components/simulator/new-state/expenses/health/health.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-health', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './health.component.html' })
export class HealthComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.healthExpenses.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/new-state/expenses/health/health.component.html': `
<app-accordion-panel title="בריאות" [badge]="badge" [level]="3" [badgeRed]="true">
  <div class="leaf"><span class="leaf-label">הוצאות בריאות לנפש</span><span class="leaf-val red">{{ result()!.healthExpenses | number:'1.0-0' }} ₪</span></div>
  <div class="total-row"><span>סה"כ בריאות</span><span class="leaf-val red">{{ result()!.healthExpenses | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── Taxes ──
  'app/components/simulator/new-state/expenses/taxes/taxes.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-taxes', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './taxes.component.html' })
export class TaxesComponent {
  result = inject(SimulatorService).result;
  get badge() { const r = this.result(); return r ? r.taxes.toLocaleString('he-IL') + ' ₪' : ''; }
}
`,

  'app/components/simulator/new-state/expenses/taxes/taxes.component.html': `
<app-accordion-panel title="מיסים" [badge]="badge" [level]="3" [badgeRed]="true">
  <div class="leaf"><span class="leaf-label">מס איזון</span><span class="leaf-val red">{{ result()!.balanceTax | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">מס קהילה</span><span class="leaf-val red">{{ result()!.communityTax | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">ארנונה</span><span class="leaf-val red">{{ result()!.propertyTax | number:'1.0-0' }} ₪</span></div>
  <div class="total-row"><span>סה"כ מיסים</span><span class="leaf-val red">{{ result()!.taxes | number:'1.0-0' }} ₪</span></div>
</app-accordion-panel>
`,

  // ── Diff ──
  'app/components/simulator/diff/diff.component.ts': `
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-diff', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './diff.component.html' })
export class DiffComponent {
  result = inject(SimulatorService).result;
  get badge() {
    const r = this.result();
    if (!r) return '';
    const sign = r.diff > 0 ? '▼' : '▲';
    return sign + ' ' + Math.abs(r.diff).toLocaleString('he-IL') + ' ₪';
  }
  get badgeRed() { return (this.result()?.diff ?? 0) > 0; }
}
`,

  'app/components/simulator/diff/diff.component.html': `
<app-accordion-panel title="הפרש" [badge]="badge" [level]="1" [badgeRed]="badgeRed">
  <div class="leaf"><span class="leaf-label">מצב קיים</span><span class="leaf-val">{{ result()!.currentState | number:'1.0-0' }} ₪</span></div>
  <div class="leaf"><span class="leaf-label">מצב חדש</span><span class="leaf-val green">{{ result()!.netDisposableIncome | number:'1.0-0' }} ₪</span></div>
  <div class="total-row">
    <span>הפרש חודשי</span>
    <span [class.leaf-val]="true" [class.red]="result()!.diff > 0" [class.green]="result()!.diff <= 0">
      {{ result()!.diff > 0 ? '▼' : '▲' }} {{ result()!.diff | number:'1.0-0' }} ₪
    </span>
  </div>
</app-accordion-panel>
`
};

// Write all files
let count = 0;
for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = relativePath.startsWith('app/') || relativePath === 'styles.scss'
    ? join('src', relativePath)
    : join('src', 'app', relativePath);

  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  try { mkdirSync(dir, { recursive: true }); } catch {}
  writeFileSync(fullPath, content.trimStart(), 'utf-8');
  console.log('✓', fullPath);
  count++;
}

console.log(`\nDone — ${count} files written.`);
