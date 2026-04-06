import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FamilyData, FamilyMember, Child } from '../models/simulator.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FamilyService {

  family = signal<FamilyData | null>(null);

  constructor(private http: HttpClient) {}

  async loadFamily(): Promise<void> {
    const budgetCode = localStorage.getItem('budgetCode');

    if (!budgetCode) {
      console.error('❌ No budgetCode');
      return;
    }

    console.time('family load');

    try {
      const data = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/api/family/${budgetCode}/simulation` // ✅ FIXED
        )
      );

      console.log('FAMILY DATA:', data);

      const members: FamilyMember[] = data.members.map((m: any, index: number) => ({
        id: `${index}`,
        name: `${this.clean(m.first_name)} ${this.clean(m.last_name)}`,
        age: Number(m.age),
        status: 'employed',
        currentSalary: Number(m.net_salary || 0),
        expectedSalary: Math.round(Number(m.net_salary || 0))
      }));

      const children: Child[] = this.mapChildren(members);

      const sim = data.simulation || data.family;

      const baseFamily = {
        familyName: data.family.family_name,
        budgetCode: data.family.budget_code,
        familySize: Number(data.family.family_size || 0),
        familyStandard: Number(data.family.family_standard ?? 0),
        incomeForStandard: Number(data.family.income_for_standard ?? 0),

        members,
        children,

        netSalary: this.toNumber(data.inputs?.salary_net),
        updatedNetSalary: this.toNumber(data.inputs?.salary_net),

        hishtalmut_fund: Number(data.family?.hishtalmut_fund ?? 0),
        pension_contribution: Number(data.family?.pension_contribution ?? 0),

        inputs: {
          ...data.inputs,
          pension: Number(data.inputs?.pension),
          survivors: Number(data.inputs?.survivors),
          old_age_allowance: Number(data.inputs?.old_age_allowance),
          flow_income: Number(data.inputs?.flow_income),
          health_cost: 0
        },

        simulation: {
          budget_distribution: Number(sim?.budget_distribution),
          personal_bonus: Number(sim?.personal_bonus),
          women_work_benefit: Number(sim?.women_work_benefit),
          travel: Number(sim?.travel),
          periodic_grant: Number(sim?.periodic_grant),
          special_help: Number(sim?.special_help),

          current_state:
            Number(sim?.budget_distribution) +
            Number(sim?.personal_bonus) +
            Number(sim?.women_work_benefit) +
            Number(sim?.travel) +
            Number(sim?.periodic_grant) +
            Number(sim?.special_help)
        },

        rules: data.rules
      };

      const healthCost = this.calculateHealthCost(baseFamily);

      this.family.set({
        ...baseFamily,
        inputs: {
          ...baseFamily.inputs,
          health_cost: healthCost
        }
      });

      console.log('NORMALIZED FAMILY:', this.family());

    } catch (err) {
      console.error(err);
    }

    console.timeEnd('family load');
  }

  calculateHealthCost(f: any): number {

    const total = Number(f.inputs?.health_total ?? 0);
    const young = Number(f.inputs?.health_0_50 ?? 0);
    const mid   = Number(f.inputs?.health_50_70 ?? 0);
    const old   = Number(f.inputs?.health_70_plus ?? 0);

    const r = f.rules ?? {};

    const cost =
      total * Number(r.health_total ?? 0) +
      young * Number(r.health_0_50 ?? 0) +
      mid   * Number(r.health_50_70 ?? 0) +
      old   * Number(r.health_70_plus ?? 0);

    return this.round(cost);
  }

  updateUpdatedNetSalary() {
    const f = this.family();
    if (!f) return;

    const updated = Math.round(
      f.members.reduce(
        (sum, m) => sum + (m.expectedSalary ?? 0),
        0
      )
    );

    this.family.set({
      ...f,
      updatedNetSalary: updated
    });
  }

  private mapChildren(rawMembers: FamilyMember[]): Child[] {
    return rawMembers
      .filter(m => (m.age ?? 0) <= 18)
      .map((m, index) => {
        const age = m.age ?? 0;

        return {
          id: `${index}`,
          name: m.name,
          gender: 'male',
          age,
          educationLevel: this.getEducationLevel(age)
        };
      });
  }

  private getEducationLevel(age: number): Child['educationLevel'] {
    if (age <= 3) return 'daycare';
    if (age <= 6) return 'kindergarten';
    if (age <= 12) return 'elementary';
    if (age <= 14) return 'middle';
    return 'high';
  }

  private clean(value: string | undefined): string {
    if (!value) return '';
    return value.replace(/\s+/g, ' ').trim();
  }

  public round(value: any): number {
    if (value == null) return 0;
    return Math.round(Number(value));
  }

  private toNumber(value: any): number {
    if (value == null) return 0;
    return Math.round(Number(value));
  }
}