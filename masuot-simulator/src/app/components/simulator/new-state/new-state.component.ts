import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { IncomeComponent } from './income/income.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { FamilyService } from '../../../services/family.service';
import { SavingsComponent } from "./savings/savings.component";
import { TaxesComponent } from "./taxes/taxes.component";

@Component({ selector: 'app-new-state', standalone: true, imports: [CommonModule, AccordionPanelComponent, IncomeComponent, ExpensesComponent, SavingsComponent, TaxesComponent], templateUrl: './new-state.component.html' })
export class NewStateComponent {

  constructor(private familyService: FamilyService) {}
  
  result = inject(SimulatorService).result;
  get badge() {
    const r = this.result();
    if (!r) return '';

    const disposable =
      (r.newIncome || 0) -
      /*(r.totalSavings || 0) -*/
      (r.newExpenses || 0);

    const val = this.familyService.round(disposable);

    return 'הכנסות - הוצאות: ' + val.toLocaleString('he-IL') + ' ₪';
  }
}