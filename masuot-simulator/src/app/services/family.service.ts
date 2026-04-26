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
        name: `${this.clean(this.flipParentheses(m.first_name))}`,
        age: Number(m.age),
        status: 'employed',
        currentSalary: Number(m.net_salary || 0),
        expectedSalary: Math.round(Number(m.net_salary || 0)),
        statusCode:Math.round(Number(m.status_code || 0)),
         educationGroup: m.education_group
      }));

      const children: Child[] = this.mapChildren(members);

      const sim = data.simulation || data.family;

      const baseFamily = {
        familyName: this.flipParentheses(data.family.family_name),
        budgetCode: data.family.budget_code,
        familySize: Number(data.family.family_size || 0),
        familyStandard: Number(data.family.family_standard ?? 0),
        incomeForStandard: Number(data.family.income_for_standard ?? 0),

        arnona: Number(data.family?.arnona ?? 0),
        community_tax: Number(data.family?.community_tax ?? 0),
        municipal_tax: Number(data.family?.municipal_tax ?? 0),
        mutual_responsibility_cap:Number(data.family?.mutual_responsibility_cap ?? 0),

        members,
        children,
        specialBudgets: this.normalizeSpecialBudgets(data.specialBudgets),
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

      console.log('SPECIAL NORMALIZED:', baseFamily.specialBudgets);

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
      //.filter(m => (m.age ?? 0) <= 18)
      .filter(m => m.statusCode != 1)
      .map((m, index) => {
        return {
          id: `${index}`,
          name: m.name,
          gender: 'male',
          age: m.age ?? 0,
          educationGroup: m.educationGroup // 🔥 זה הקשר
        };
      });
  }

  private flipParentheses(text: string): string {
    if (!text) return '';

    return text
      .replace(/\(/g, 'TEMP')
      .replace(/\)/g, '(')
      .replace(/TEMP/g, ')');
  }

  private normalizeSpecialBudgets(data: any[]) {
  if (!data) return [];

    return data.map(r => ({
        member_code: r.member_code,
        first_name: this.clean(r.first_name),
        last_name: this.flipParentheses(this.clean(r.last_name)),
        age: this.toNumber(r.age),
        
        bar_mitzvah_amount: this.toNumber(r.bar_mitzvah_amount),
        bar_mitzvah_year: this.toNumber(r.bar_mitzvah_year),

        bat_mitzvah_amount: this.toNumber(r.bat_mitzvah_amount),
        bat_mitzvah_year: this.toNumber(r.bat_mitzvah_year),

        wedding_grant: this.toNumber(r.wedding_grant),
        wedding_year: this.toNumber(r.wedding_year),

        study_grant: this.toNumber(r.study_grant),
        study_year: this.toNumber(r.study_year),

        paint_grant: this.toNumber(r.paint_grant),
        paint_year: this.toNumber(r.paint_year),

        leaving_grant_25y: this.toNumber(r.leaving_grant_25y),
        leaving_grant_25y_year: this.toNumber(r.leaving_grant_25y_year),

        leaving_grant_age_65: this.toNumber(r.leaving_grant_age_65),
        leaving_grant_age_65_year: this.toNumber(r.leaving_grant_age_65_year),

        shares_amount: this.toNumber(r.shares_amount)
      }));
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