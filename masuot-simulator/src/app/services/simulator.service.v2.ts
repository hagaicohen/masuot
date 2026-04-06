import { Injectable, computed, inject } from '@angular/core';
import { FamilyService } from './family.service';

@Injectable({ providedIn: 'root' })
export class SimulatorServiceV2 {

  private familyService = inject(FamilyService);
  private family = this.familyService.family;

  // =========================
  // RESULT
  // =========================
  result = computed(() => {
    const f = this.family();
    if (!f) return null;

    const income = this.calculateIncome(f);

    return {
      income
    };
  });

  // =========================
  // INCOME ROOT
  // =========================
  private calculateIncome(f: any) {
    const netSalary = this.calcNetSalary(f);
    const allowances = this.calcAllowances(f);
    const extraIncome = this.calcExtraIncome(f);

    const taka = this.calcTaka(f, netSalary, allowances, extraIncome);

    const totalIncome =
      netSalary +
      allowances +
      extraIncome +
      taka;

    return {
      netSalary,
      allowances,
      extraIncome,
      taka,
      totalIncome
    };
  }

  // =========================
  // NET SALARY
  // =========================
  private calcNetSalary(f: any): number {
    const members = f.members ?? [];

    const calculated = members.reduce((sum: number, m: any) => {
      return sum + (Number(m.expectedSalary) || 0);
    }, 0);

    return calculated;
  }

  // =========================
  // ALLOWANCES
  // =========================
  private calcAllowances(f: any): number {
    const inputs = f.inputs || {};

    return Number(inputs.child_allowance || 0);
  }

  // =========================
  // EXTRA INCOME (SUM)
  // =========================
  private calcExtraIncome(f: any): number {
    const inputs = f.inputs || {};

    return (
      Number(inputs.pension || 0) +
      Number(inputs.survivors || 0) +
      Number(inputs.old_age_allowance || 0)
    );
  }

  // =========================
  // SUM FOR TAKA
  // =========================
  private calcIncomeSumForTaka(
    netSalary: number,
    allowances: number,
    extraIncome: number
  ): number {
    return netSalary + allowances + extraIncome;
  }

  // =========================
  // TAKA (תק״ה)
  // =========================
  private calcTaka(
    f: any,
    netSalary: number,
    allowances: number,
    extraIncome: number
  ): number {

    const rules = f.rules || {};
    const inputs = f.inputs || {};

    const takaBase = Number(rules.F21 || 0);
    const familyStandard = parseFloat(f.family_standard ?? f.familyStandard ?? '0');

    const incomeForStandard = Number(inputs.flow_income || 0);

    const incomeSum = this.calcIncomeSumForTaka(
      netSalary,
      allowances,
      extraIncome
    );

    if (incomeForStandard < takaBase) {
      return (takaBase * familyStandard) - incomeSum;
    }

    return 0;
  }
}