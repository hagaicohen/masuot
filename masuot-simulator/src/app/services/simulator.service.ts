import { effect, signal } from '@angular/core';
import { Injectable, computed, inject } from '@angular/core';
import { FamilyService } from './family.service';
import { AdminService } from './admin.service';

@Injectable({ providedIn: 'root' })
export class SimulatorService {

  tab = signal<'current' | 'special'>('current');
  
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

  specialGrantsTotal = computed(() => {
    const f = this.familyState();
    if (!f) return 0;

    const list = f.specialBudgets ?? [];

    let sum = 0;

    for (const x of list) {
      sum +=
        (x.bar_mitzvah_amount || 0) +
        (x.bat_mitzvah_amount || 0) +
        (x.wedding_grant || 0) +
        (x.study_grant || 0) +
        (x.paint_grant || 0);
    }

    return this.familyService.round(sum);
  });

  leavingGrantsTotal = computed(() => {
    const f = this.familyState();
    if (!f) return 0;

    const list = f.specialBudgets ?? [];

    let sum = 0;

    for (const x of list) {
      sum +=
        (x.leaving_grant_25y || 0) +
        (x.leaving_grant_age_65 || 0);
    }

    return this.familyService.round(sum);
  });

  sharesTotal = computed(() => {
    const f = this.familyState();
    if (!f) return 0;

    const list = f.specialBudgets ?? [];

    return this.familyService.round(
      list.reduce((sum: number, x: any) => 
        sum + (x.shares_amount || 0), 
      0)
    );
  });

  allSpecialTotal = computed(() =>
    this.specialGrantsTotal() + this.leavingGrantsTotal() + this.sharesTotal()
  );
  
  // ✅ FIX — רק זה משתנה
private calcMutualResponsibility(updatedNetSalary: number, pension: number, rules: any): number {
  const income = Number(updatedNetSalary || 0) + Number(pension || 0);

  const k5 = Number(rules?.k5 ?? rules?.K5 ?? 0);
  const l5 = Number(rules?.l5 ?? rules?.L5 ?? 0);

  const k6 = Number(rules?.k6 ?? rules?.K6 ?? 0);
  const j6 = Number(rules?.j6 ?? rules?.J6 ?? 0);
  const l6 = Number(rules?.l6 ?? rules?.L6 ?? 0);
  const m5 = Number(rules?.m5 ?? rules?.M5 ?? 0);

  const k7 = Number(rules?.k7 ?? rules?.K7 ?? 0);
  const j7 = Number(rules?.j7 ?? rules?.J7 ?? 0);
  const l7 = Number(rules?.l7 ?? rules?.L7 ?? 0);
  const m6 = Number(rules?.m6 ?? rules?.M6 ?? 0);

  if (income <= k5) return income * l5;
  if (income <= k6) return m5 + (income - j6) * l6;
  if (income <= k7) return m6 + (income - j7) * l7;

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
    
    const total =
      Number(f.inputs?.health_total ?? 0)   * Number(f.rules?.health_total ?? 0) +
      Number(f.inputs?.health_0_50 ?? 0)    * Number(f.rules?.health_0_50 ?? 0) +
      Number(f.inputs?.health_50_70 ?? 0)   * Number(f.rules?.health_50_70 ?? 0) +
      Number(f.inputs?.health_70_plus ?? 0) * Number(f.rules?.health_70_plus ?? 0);

    // 🔥 בדיוק כמו ב-HTML שלך
    //const participation = Math.abs(Number(f.inputs?.health_participation ?? 0));
    //const participation = 0;//this.calcHealthParticipation(f,netSalaryParents)

    return total;
  }

  private calcHealthParticipation(f: any, healthCost: number, netSalary: number): number {

    const cashIncome = Math.round(this.calcCashIncome(netSalary, f));

    const rate = Number(f.rules?.F19 ?? 0);
    const cap = Math.round(cashIncome * rate);

    const result = healthCost > cap ? cap - healthCost : 0;

  return result;
}

  private calcTaka(f: any, netSalary: number): number {
    const inputs = f.inputs || {};

    const takaBase = Number(f.rules?.F21 ?? 0);
    const familyStandard = Number(f.family_standard ?? f.familyStandard ?? 1);

    const incomeSum =
      netSalary +
      Number(inputs.pension ?? 0) +
      Number(inputs.survivors ?? 0) +
      Number(inputs.old_age_allowance ?? 0) +
      Number(inputs.child_allowance ?? 0);

    const incomeForStandard = incomeSum / familyStandard;

    if (incomeForStandard < takaBase) {
      const taka = (takaBase * familyStandard) - incomeSum;
      return taka;
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

    // 🔴 FIX — תמיכה גם ב-uppercase וגם lowercase
    const rate = Number(f.rules?.F16 ?? f.rules?.f16 ?? 0);

    const maxAllowed = Math.round(cashIncome * rate);

    // 🔴 FIX — נוסחת אקסל (הפוך מהקיים!)
    const participation =
      educationExpenses > maxAllowed
        ? maxAllowed - educationExpenses   // 🔴 FIX — מחזיר שלילי
        : 0;

    // 🔍 DEBUG — לראות בדיוק מה קורה
    console.log('=== EDUCATION DEBUG ===', {
      educationExpensesRaw,
      educationExpenses,
      cashIncome,
      rate,
      maxAllowed,
      participation
    });

    return participation;
  }

  result = computed(() => {
    const f = this.familyState();
    const p = this.paramsState();

    if (!f || !p) return null;

    const netSalaryParents = this.netSalaryParents();
    const updatedNetSalary = f.updatedNetSalary ?? netSalaryParents;
    
    const taka = this.calcTaka(f, updatedNetSalary);

    const mutualResponsibility = this.calcMutualResponsibility(
      updatedNetSalary,
      Number(f.pension ?? 0),
      f.rules
    );

    // 🔴 FIX — תקרת מס ערבות מגיעה מ-rules (F4) ולא מה-family
    const mutualCap = Number(f.rules?.F4 ?? Infinity);

    // ✅ NEW — מס ערבות אחרי הגבלה (כמו באקסל: MIN)
    const mutualResponsibilityCapped = Math.min(
      mutualResponsibility,
      mutualCap
    );

    const childAllowances = Number(f.inputs?.child_allowance ?? 0);

    const totalIncome =
      updatedNetSalary +
      Number(f.inputs?.pension ?? 0) +
      Number(f.inputs?.survivors ?? 0) +
      Number(f.inputs?.old_age_allowance ?? 0) +
      Number(f.inputs?.child_allowance ?? 0) +
      taka;

    const educationExpensesRaw = this.calcEducation(f);

    const healthCost = this.calcHealth(f);
    const healthParticipation = this.calcHealthParticipation(f,healthCost, updatedNetSalary);
    const healthExpenses = this.familyService.round(
      healthCost + healthParticipation
    );

    const cashIncome = this.calcCashIncome(updatedNetSalary, f);

    const educationParticipation = this.calcEducationParticipation(
      educationExpensesRaw,
      cashIncome,
      f
    );

    const educationExpenses = Math.round(educationExpensesRaw);
    const educationNet = educationExpenses + educationParticipation;

    const balanceTax = netSalaryParents * (p.balanceTaxRate ?? 0);

    // 🔴 FIX — שימוש במס ערבות מחושב ומוגבל במקום ערך קשיח מה-DB
    const taxes =
      mutualResponsibilityCapped +
      Number(f.community_tax ?? 0) +
      Number(f.municipal_tax ?? 0) +
      Number(f.arnona ?? 0);

    const totalExpenses =
      educationNet +
      healthExpenses +
      taxes;

    const expensesWithoutTaxes =
      educationNet +
      healthExpenses;

    const hishtalmutFund = Number(f.hishtalmut_fund ?? 0);
    const pensionContribution = Number(f.pension_contribution ?? 0);
    const totalSavings = hishtalmutFund + pensionContribution;

    const netDisposableIncome = totalIncome - totalExpenses - totalSavings;

    // 🔴 FIX — חישוב במקום שימוש בשדה שלא קיים
    const sim = f.simulation ?? {};

    const currentState =
      Number(sim.budget_distribution ?? 0) +
      Number(sim.personal_bonus ?? 0) +
      Number(sim.women_work_benefit ?? 0) +
      Number(sim.travel ?? 0) +
      Number(sim.periodic_grant ?? 0) +
      Number(sim.special_help ?? 0);

      // ===== NEW MODEL =====

    const newIncome =
      updatedNetSalary +
      Number(f.inputs?.pension ?? 0) +
      Number(f.inputs?.survivors ?? 0) +
      Number(f.inputs?.old_age_allowance ?? 0) +
      Number(f.inputs?.child_allowance ?? 0) +
      this.calcTaka(f, updatedNetSalary);

    const newExpenses =
      educationNet +
      healthExpenses +
      taxes;

    const currentStateBreakdown = currentState; // 🔴 FIX (איחוד)

    const disposableIncome = newIncome - newExpenses;
    const cashFlowDiff = disposableIncome - currentState;

    const economicDiff = cashFlowDiff + totalSavings;

    console.log('currentState:', currentState);

    return {
      currentState, // 👈 חשוף לכל המערכת

      totalIncome,
      netSalary: netSalaryParents,
      updatedNetSalary,

      educationExpenses,
      educationParticipation,
      educationNet,

      healthExpenses,
      healthParticipation,
      taxes,
      balanceTax,

      communityTax: f.community_tax ?? 0,
      municipalTax: f.municipal_tax ?? 0,
      // 🔴 FIX — להחזיר ערכים מחושבים ולא מה-DB
      mutualResponsibility,
      mutualResponsibilityCapped,
      arnona: f.arnona ?? 0,

      totalExpenses,
      expensesWithoutTaxes,

      hishtalmutFund,
      pensionContribution,
      totalSavings,

      netDisposableIncome,

      diff: currentState - netDisposableIncome,

      childAllowances,
      pensionAddition: Number(f.inputs?.pension ?? 0),
      survivorPension: Number(f.inputs?.survivors ?? 0),
      oldAgePension: Number(f.inputs?.old_age_allowance ?? 0),
      taka,

      newIncome,
      newExpenses,
      currentStateBreakdown,
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