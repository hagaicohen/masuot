import { effect, signal } from '@angular/core';
import { Injectable, computed, inject } from '@angular/core';
import { FamilyService } from './family.service';
import { AdminService } from './admin.service';

@Injectable({ providedIn: 'root' })
export class SimulatorService {

  private family = inject(FamilyService).family;
  private params = inject(AdminService).params;
  private familyService = inject(FamilyService);

  private familyState = signal<any>({});
  private paramsState = signal<any>({});

  loading = signal(true);

  private netSalaryParents = computed(() => {
    const f = this.familyState();
    if (!f) return 0;

    return (f.members ?? []).reduce(
      (s: number, m: any) => s + (m.expectedSalary ?? 0),
      0
    );
  });

  constructor() {
    const familyService = inject(FamilyService);
    const adminService = inject(AdminService);

    setTimeout(() => {
      this.loading.set(false);
    }, 1000);

    effect(() => {
      const f = familyService.family();
      if (!f) return;

      const prev = this.familyState();
      if (prev === f) return;

      this.familyState.set(f);
    }, { allowSignalWrites: true });

    effect(() => {
      const p = adminService.params();
      if (!p) return;

      const prev = this.paramsState();
      if (prev === p) return;

      this.paramsState.set(p);
    }, { allowSignalWrites: true });
  }

  inputs = computed(() => this.familyState()?.inputs ?? null);
  rules  = computed(() => this.familyState()?.rules ?? null);

  private calcMutualResponsibility(updatedNetSalary: number, pension: number, rules: any): number {
    const income = updatedNetSalary + pension;

    const K5 = Number(rules?.K5 ?? 0);
    const L5 = Number(rules?.L5 ?? 0);

    const K6 = Number(rules?.K6 ?? 0);
    const J6 = Number(rules?.J6 ?? 0);
    const L6 = Number(rules?.L6 ?? 0);
    const M5 = Number(rules?.M5 ?? 0);

    const K7 = Number(rules?.K7 ?? 0);
    const J7 = Number(rules?.J7 ?? 0);
    const L7 = Number(rules?.L7 ?? 0);
    const M6 = Number(rules?.M6 ?? 0);

    if (income <= K5) return income * L5;
    if (income <= K6) return M5 + (income - J6) * L6;
    if (income <= K7) return M6 + (income - J7) * L7;

    return 0;
  }

  private calcEducation(f: any): number {
    return (
      Number(f.inputs?.toddlers ?? 0)     * Number(f.rules?.nursery ?? 0) +
      Number(f.inputs?.kindergarten ?? 0) * Number(f.rules?.kindergarten ?? 0) +
      Number(f.inputs?.elementary ?? 0)   * Number(f.rules?.primary ?? 0) +
      Number(f.inputs?.middle ?? 0)       * Number(f.rules?.middle ?? 0) +
      Number(f.inputs?.high ?? 0)         * Number(f.rules?.highschool ?? 0)
    );
  }

  private calcHealth(f: any): number {
    return (
      Number(f.inputs?.health_total ?? 0)   * Number(f.rules?.health_total ?? 0) +
      Number(f.inputs?.health_0_50 ?? 0)    * Number(f.rules?.health_0_50 ?? 0) +
      Number(f.inputs?.health_50_70 ?? 0)   * Number(f.rules?.health_50_70 ?? 0) +
      Number(f.inputs?.health_70_plus ?? 0) * Number(f.rules?.health_70_plus ?? 0)
    );
  }

  private calcTaka(f: any, netSalary: number): number {
    const rules = f.rules || {};
    const inputs = f.inputs || {};

    const allowances = Number(inputs.child_allowance || 0);

    const extraIncome =
      Number(inputs.pension || 0) +
      Number(inputs.survivors || 0) +
      Number(inputs.old_age_allowance || 0);

    const incomeSum = netSalary + allowances + extraIncome;

    const takaBase = Number(rules.F21 || 0);
    const familyStandard = parseFloat(f.family_standard ?? f.familyStandard ?? '0');

    const incomeForStandard = Number(inputs.flow_income || 0);

    if (incomeForStandard < takaBase) {
      return (takaBase * familyStandard) - incomeSum;
    }

    return 0;
  }

  private calcCashIncome(netSalaryParents: number, f: any): number {

    const allowances = Number(f.inputs?.child_allowance ?? 0);

    const extraIncome =
      Number(f.inputs?.pension ?? 0) +
      Number(f.inputs?.survivors ?? 0) +
      Number(f.inputs?.old_age_allowance ?? 0);

    const taka = this.calcTaka(f, netSalaryParents);

    return (
      netSalaryParents +
      allowances +
      extraIncome +
      taka
    );
  }

  private calcEducationParticipation(educationExpensesRaw: number, cashIncome: number, f: any): number {
    const educationExpenses = Math.round(educationExpensesRaw);

    const rate = Number(f.rules?.F16 ?? 0);
    const maxAllowed = Math.round(cashIncome * rate);

    return educationExpenses > maxAllowed
      ? educationExpenses - maxAllowed
      : 0;
  }

  result = computed(() => {
    const f = this.familyState();
    const p = this.paramsState();

    if (!f || !p) return null;

    const netSalaryParents = this.netSalaryParents();
    const updatedNetSalary = f.updatedNetSalary ?? netSalaryParents;

    const mutualResponsibility = this.calcMutualResponsibility(
      updatedNetSalary,
      Number(f.pension ?? 0),
      f.rules
    );

    const childAllowances = Number(f.inputs?.child_allowance ?? 0);
    const totalIncome = netSalaryParents + childAllowances;

    const educationExpensesRaw = this.calcEducation(f);
    const healthExpenses = this.familyService.round(this.calcHealth(f));

    const cashIncome = this.calcCashIncome(netSalaryParents, f);

    const educationParticipation = this.calcEducationParticipation(
      educationExpensesRaw,
      cashIncome,
      f
    );

    const educationExpenses = Math.round(educationExpensesRaw);
    const educationNet = educationExpenses - educationParticipation;

    const balanceTax = netSalaryParents * (p.balanceTaxRate ?? 0);

    const taxes =
      balanceTax +
      mutualResponsibility +
      Number(f.communityTax ?? 0) +
      Number(f.municipalTax ?? 0) +
      Number(f.arnona ?? 0);

    const totalExpenses =
      educationNet +
      healthExpenses +
      taxes;

    const hishtalmutFund = Number(f.hishtalmut_fund ?? 0);
    const pensionContribution = Number(f.pension_contribution ?? 0);
    const totalSavings = hishtalmutFund + pensionContribution;

    const netDisposableIncome = totalIncome - totalExpenses - totalSavings;

    const currentState = Number(f.current_state ?? 0);

    // 🔥 ADDED — הפרש תזרימי
    const cashFlowDiff = currentState - (totalIncome - totalExpenses);

    // 🔥 ADDED — הפרש כלכלי
    const economicDiff = currentState - (totalIncome - totalExpenses + totalSavings);


    // 🔥 ADDED — debug logs
console.log('cashFlowDiff:', cashFlowDiff);
console.log('economicDiff:', economicDiff);

    return {
      currentState,

      totalIncome,
      netSalary: netSalaryParents,
      updatedNetSalary,

      educationExpenses,
      educationParticipation,
      educationNet,

      healthExpenses,

      taxes,
      balanceTax,
      mutualResponsibility,

      communityTax: f.communityTax ?? 0,
      municipalTax: f.municipalTax ?? 0,
      arnona: f.arnona ?? 0,

      totalExpenses,

      hishtalmutFund,
      pensionContribution,
      totalSavings,

      netDisposableIncome,

      diff: currentState - netDisposableIncome,

      // 🔥 ADDED — החזרה ל־UI
      cashFlowDiff,
      economicDiff
    };
  });

  updateExpectedSalary(memberId: string, value: number) {
    const f = this.family();
    if (!f) return;

    const members = f.members ?? [];

    const updatedMembers = members.map(m =>
      m.id === memberId
        ? (m.expectedSalary === value ? m : { ...m, expectedSalary: value })
        : m
    );

    this.family.set({
      ...f,
      members: updatedMembers
    });
  }
}