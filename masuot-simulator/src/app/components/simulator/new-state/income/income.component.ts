import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { FamilyService } from '../../../../services/family.service';
import { SimulatorService } from '../../../../services/simulator.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './income.component.html'
})
export class IncomeComponent {

  constructor(private familyService: FamilyService) {}

  private root = inject(FamilyService).family;
  simulator = inject(SimulatorService); // 🔥 חשוב ל-loading

  private formatMoney(n: number) {
    return this.familyService.round(n).toLocaleString('he-IL') + ' ₪';
  }

  private computeIncome(data: any) {
    if (!data) return null;

    const f = data;

    const netSalary = this.familyService.round(f.netSalary ?? 0);
    const updatedNetSalary = this.familyService.round(f.updatedNetSalary ?? 0);

    const childAllowances = this.familyService.round(f.inputs?.child_allowance ?? 0);

    const pensionAddition = this.familyService.round(f.simulation?.family?.pension_addition ?? 0);
    const survivorPension = this.familyService.round(f.simulation?.family?.survivor_pension ?? 0);
    const oldAgePension = this.familyService.round(f.simulation?.family?.old_age_pension ?? 0);

    const incomeForStandard = Number(f.incomeForStandard ?? 0);
    const threshold = Number(f.rules?.F21 ?? 0);
    const familyStandard = parseFloat(f.familyStandard ?? '0');

    const base = threshold * familyStandard;
    const current = updatedNetSalary + childAllowances;

    const takeHomeAddition =
      incomeForStandard < threshold
        ? Math.max(0, this.familyService.round(base - current))
        : 0;

    const totalIncome = this.familyService.round(
      updatedNetSalary +
      childAllowances +
      pensionAddition +
      survivorPension +
      oldAgePension +
      takeHomeAddition
    );

    return {
      netSalary,
      updatedNetSalary,
      childAllowances,
      pensionAddition,
      survivorPension,
      oldAgePension,
      takeHomeAddition,
      totalIncome
    };
  }

  result = computed(() => this.computeIncome(this.root()));

  get badge() {
    const r = this.result();
    return r ? this.formatMoney(r.totalIncome) : '';
  }
}