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

      0,
    );
  });

  constructor() {
    const familyService = inject(FamilyService);

    const adminService = inject(AdminService);

    setTimeout(() => {
      this.loading.set(false);
    }, 1000);

    effect(
      () => {
        const f = familyService.family();

        if (!f) return;

        const prev = this.familyState();

        if (prev === f) return;

        this.familyState.set(f);
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        const p = adminService.params();

        if (!p) return;

        const prev = this.paramsState();

        if (prev === p) return;

        this.paramsState.set(p);
      },
      { allowSignalWrites: true },
    );
  }

  inputs = computed(() => this.familyState()?.inputs ?? null);

  rules = computed(() => this.familyState()?.rules ?? null);

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
      sum += (x.leaving_grant_25y || 0) + (x.leaving_grant_age_65 || 0);
    }

    return this.familyService.round(sum);
  });

  sharesTotal = computed(() => {
    const f = this.familyState();

    if (!f) return 0;

    const list = f.specialBudgets ?? [];

    return this.familyService.round(
      list.reduce(
        (sum: number, x: any) => sum + (x.shares_amount || 0),

        0,
      ),
    );
  });

  allSpecialTotal = computed(
    () =>
      this.specialGrantsTotal() +
      this.leavingGrantsTotal() +
      this.sharesTotal(),
  );

  // =========================
  // MUTUAL RESPONSIBILITY
  // =========================

  private calcMutualResponsibility(
    updatedNetSalary: number,
    pension: number,
    rules: any,
  ): number {
    const income = Number(updatedNetSalary || 0) + Number(pension || 0);

    const k5 = Number(rules?.K5 ?? 0);

    const l5 = Number(rules?.L5 ?? 0);

    const k6 = Number(rules?.K6 ?? 0);

    const j6 = Number(rules?.J6 ?? 0);

    const l6 = Number(rules?.L6 ?? 0);

    const m5 = Number(rules?.M5 ?? 0);

    const k7 = Number(rules?.K7 ?? 0);

    const j7 = Number(rules?.J7 ?? 0);

    const l7 = Number(rules?.L7 ?? 0);

    const m6 = Number(rules?.M6 ?? 0);

    if (income <= k5) return income * l5;

    if (income <= k6) return m5 + (income - j6) * l6;

    if (income <= k7) return m6 + (income - j7) * l7;

    return 0;
  }

  // =========================
  // EDUCATION
  // =========================

  private calcEducation(f: any): number {
    return (
      Number(f.inputs?.toddlers ?? 0) * Number(f.rules?.nursery ?? 0) +
      Number(f.inputs?.kindergarten ?? 0) * Number(f.rules?.kindergarten ?? 0) +
      Number(f.inputs?.elementary ?? 0) * Number(f.rules?.primary ?? 0) +
      Number(f.inputs?.middle ?? 0) * Number(f.rules?.middle ?? 0) +
      Number(f.inputs?.high ?? 0) * Number(f.rules?.highschool ?? 0)
    );
  }

  // =========================
  // HEALTH
  // =========================

  private calcHealth(f: any): number {
    return (
      Number(f.inputs?.health_total ?? 0) * Number(f.rules?.health_total ?? 0) +
      Number(f.inputs?.health_0_50 ?? 0) * Number(f.rules?.health_0_50 ?? 0) +
      Number(f.inputs?.health_50_70 ?? 0) * Number(f.rules?.health_50_70 ?? 0) +
      Number(f.inputs?.health_70_plus ?? 0) *
        Number(f.rules?.health_70_plus ?? 0)
    );
  }

  private calcHealthParticipation(
    f: any,
    healthCost: number,
    netSalary: number,
  ): number {
    const cashIncome = Math.round(this.calcCashIncome(netSalary, f));

    const rate = Number(f.rules?.F19 ?? 0);

    const cap = Math.round(cashIncome * rate);

    return healthCost > cap ? cap - healthCost : 0;
  }

  // =========================
  // TAKA
  // =========================

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
      return takaBase * familyStandard - incomeSum;
    }

    return 0;
  }

  // =========================
  // CASH INCOME
  // =========================

  private calcCashIncome(netSalaryParents: number, f: any): number {
    const allowances = Number(f.inputs?.child_allowance ?? 0);

    const extraIncome =
      Number(f.inputs?.pension ?? 0) +
      Number(f.inputs?.survivors ?? 0) +
      Number(f.inputs?.old_age_allowance ?? 0);

    const taka = this.calcTaka(f, netSalaryParents);

    return netSalaryParents + allowances + extraIncome + taka;
  }

  // =========================
  // EDUCATION PARTICIPATION
  // =========================

  private calcEducationParticipation(
    educationExpensesRaw: number,
    cashIncome: number,
    f: any,
  ): number {
    const educationExpenses = Math.round(educationExpensesRaw);

    const rate = Number(f.rules?.F16 ?? 0);

    const maxAllowed = Math.round(cashIncome * rate);

    return educationExpenses > maxAllowed ? maxAllowed - educationExpenses : 0;
  }

  // =========================
  // PAYROLL ENGINE
  // =========================

  private calculateIncomeTax(gross: number, creditPoints: number): number {
    const rules = this.rules();

    if (!rules) return 0;

    const pointValue = Number(rules?.Point_Value ?? 0);

    let tax = 0;

    for (let i = 1; i <= 6; i++) {
      const limit = Number(rules?.[`mas_${i}_limit`] ?? 0);

      const rate = Number(rules?.[`mas_${i}_diff`] ?? 0);

      if (gross > limit) {
        tax += (gross - limit) * rate;
      }
    }

    tax -= creditPoints * pointValue;

    return Math.max(0, tax);
  }

  private calculateNationalInsurance(gross: number): number {
    const rules = this.rules();

    if (!rules) return 0;

    const lowLevel = Number(rules?.BL_Low_Level ?? 0);

    const lowRate = Number(rules?.BL_Low_Rate ?? 0);

    const highRate = Number(rules?.BL_High_Rate ?? 0);

    const maxIncome = Number(rules?.BL_Max_Income ?? 0);

    return (
      Math.min(gross, lowLevel) * lowRate +
      Math.max(0, Math.min(gross, maxIncome) - lowLevel) * highRate
    );
  }

  private calculateNetSalary(
    gross: number,
    creditPoints: number,
    incomeType: string,
    rules: any,
  ): number {
    if (incomeType === 'פנסיה' || incomeType === 'קצבה') {
      return 0;
    }

    const pensionRate = Number(rules?.Pension_Rate ?? 0);

    const incomeTax = this.calculateIncomeTax(gross, creditPoints);

    const nationalInsurance = this.calculateNationalInsurance(gross);

    const pension = gross * pensionRate;

    const net = gross - incomeTax - nationalInsurance - pension;

    console.log('=== NET SALARY DEBUG ===');

    console.log({
      gross,

      creditPoints,

      incomeType,

      pensionRate,

      incomeTax,

      nationalInsurance,

      pension,

      net: gross - incomeTax - nationalInsurance - pension,
    });

    return Math.max(Math.round(net), 0);
  }

  // =========================
  // RESULT
  // =========================

  result = computed(() => {
    const f = this.familyState();

    const p = this.paramsState();

    if (!f || !p) return null;

    console.log('=== RULES ===');

    console.log(f.rules);

    // =========================
    // 🔥 PAYROLL DEBUG
    // =========================

    for (const member of f.members ?? []) {
      const gross = Number(member.gross_income || 0);

      const excelNet = Number(member.currentSalary || 0);

      console.log({
        member,

        gross: member.gross_income,

        tempGross: member.tempGross,
      });

      const calculatedNet = this.calculateNetSalary(
        gross,

        Number(member.credit_points || 0),

        member.income_type || '',

        f.rules || {},
      );

      /*console.log('=== PAYROLL CHECK ===');

      console.log({
        name: member.name,

        gross,

        excelNet,

        calculatedNet: Math.round(calculatedNet),

        diff: Math.round(calculatedNet - excelNet),

        creditPoints: member.credit_points,

        incomeType: member.income_type,
      });*/
    }

    const netSalaryParents = this.netSalaryParents();

    const updatedNetSalary = f.updatedNetSalary ?? netSalaryParents;

    const taka = this.calcTaka(f, updatedNetSalary);

    const mutualResponsibility = this.calcMutualResponsibility(
      updatedNetSalary,
      Number(f.pension ?? 0),
      f.rules,
    );

    const mutualCap = Number(f.rules?.F4 ?? Infinity);

    const mutualResponsibilityCapped = Math.min(
      mutualResponsibility,
      mutualCap,
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

    const healthParticipation = this.calcHealthParticipation(
      f,
      healthCost,
      updatedNetSalary,
    );

    const healthExpenses = this.familyService.round(
      healthCost + healthParticipation,
    );

    const cashIncome = this.calcCashIncome(updatedNetSalary, f);

    const educationParticipation = this.calcEducationParticipation(
      educationExpensesRaw,
      cashIncome,
      f,
    );

    const educationExpenses = Math.round(educationExpensesRaw);

    const educationNet = educationExpenses + educationParticipation;

    const balanceTax = netSalaryParents * (p.balanceTaxRate ?? 0);

    const taxes =
      mutualResponsibilityCapped +
      Number(f.community_tax ?? 0) +
      Number(f.municipal_tax ?? 0) +
      Number(f.arnona ?? 0);

    const totalExpenses = educationNet + healthExpenses + taxes;

    const expensesWithoutTaxes = educationNet + healthExpenses;

    //const hishtalmutFund = Number(f.hishtalmut_fund ?? 0);

    console.log('SAVINGS RULES', {
      hishtalmut_rate: f.rules?.hishtalmut_rate,

      hishtalmut_min_salary: f.rules?.hishtalmut_min_salary,

      pension_fund_rate: f.rules?.pension_fund_rate,

      pension_fund_offset: f.rules?.pension_fund_offset,
    });
    const hishtalmutFund = (f.members ?? []).reduce(
      (sum: number, member: any) => {
        const gross = Number(member.tempGross ?? member.gross_income ?? 0);

        return sum + this.calculateHishtalmut(gross, f.rules);
      },

      0,
    );

    //const pensionContribution = Number(f.pension_contribution ?? 0);
    const pensionContribution = (f.members ?? [])

      .filter((m: any) => Number(m.tempGross ?? m.gross_income ?? 0) > 0)

      .reduce(
        (sum: number, member: any) => {
          const gross = Number(member.tempGross ?? member.gross_income ?? 0);

          const pension = this.calculatePension(gross, f.rules);

          console.log({
            name: member.name,

            gross,

            pension,
          });

          return sum + pension;
        },

        0,
      );

    const totalSavings = hishtalmutFund + pensionContribution;

    const netDisposableIncome = totalIncome - totalExpenses - totalSavings;

    const sim = f.simulation ?? {};

    const currentState =
      Number(sim.budget_distribution ?? 0) +
      Number(sim.personal_bonus ?? 0) +
      Number(sim.women_work_benefit ?? 0) +
      Number(sim.travel ?? 0) +
      Number(sim.periodic_grant ?? 0) +
      Number(sim.special_help ?? 0);

    const newIncome =
      updatedNetSalary +
      Number(f.inputs?.pension ?? 0) +
      Number(f.inputs?.survivors ?? 0) +
      Number(f.inputs?.old_age_allowance ?? 0) +
      Number(f.inputs?.child_allowance ?? 0) +
      this.calcTaka(f, updatedNetSalary);

    const newExpenses = educationNet + healthExpenses + taxes;

    const currentStateBreakdown = currentState;

    const disposableIncome = newIncome - newExpenses;

    const cashFlowDiff = disposableIncome - currentState;

    const economicDiff = cashFlowDiff + totalSavings;

    return {
      currentState,

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

      economicDiff,
    };
  });

  // =========================
  // UPDATE SALARY
  // =========================

  updateExpectedSalary(memberId: string, value: number) {
    this.loading.set(true);

    const f = this.family();

    if (!f) {
      this.loading.set(false);

      return;
    }

    const member = (f.members ?? []).find((m) => m.id === memberId);

    if (!member) {
      this.loading.set(false);

      return;
    }

    const calculatedNet = this.calculateNetSalary(
      Number(value || 0),

      Number(member.credit_points || 0),

      member.income_type || '',

      f.rules || {},
    );

    member.gross_income = value;

    member.tempGross = value;

    member.expectedSalary = Math.round(calculatedNet);

    this.familyService.updateUpdatedNetSalary();

    setTimeout(() => {
      this.loading.set(false);
    }, 2000);
  }

  calculateHishtalmut(gross: number, rules: any): number {
    const rate = Number(rules?.hishtalmut_rate || 0);

    const minSalary = Number(rules?.hishtalmut_min_salary || 0);

    if (gross <= minSalary) {
      return 0;
    }

    return gross * rate;
  }

  calculatePension(gross: number, rules: any): number {
    if (gross <= 0) {
      return 0;
    }

    const rate = Number(rules?.pension_fund_rate || 0);

    const offset = Number(rules?.pension_fund_offset || 0);

    const pension = gross * rate - offset;

    console.log({
      gross,

      rate,

      offset,

      pension,
    });

    return Math.max(pension, 0);
  }
}
