import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { IncomeComponent } from './income/income.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { FamilyService } from '../../../services/family.service';
import { SavingsComponent } from "./savings/savings.component";

@Component({ selector: 'app-new-state', standalone: true, imports: [CommonModule, AccordionPanelComponent, IncomeComponent, ExpensesComponent, SavingsComponent], templateUrl: './new-state.component.html' })
export class NewStateComponent {

  constructor(private familyService: FamilyService) {}
  
  result = inject(SimulatorService).result;
  get badge() {
    const r = this.result();
    if (!r) return '';

    const disposable =
      (r.newIncome || 0) +
      (r.totalSavings || 0) -
      (r.newExpenses || 0);

    // 🔥 DEBUG LOGS
    /*
    console.log('newIncome:', r.newIncome);
    console.log('totalSavings:', r.totalSavings);
    console.log('newExpenses:', r.newExpenses);
    console.log('disposable:', disposable);*/

    const val = this.familyService.round(disposable);

    return 'הכנסה פנויה: ' + val.toLocaleString('he-IL') + ' ₪';
  }
}