import { Component, computed, inject } from '@angular/core';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { LeavingGrantAge65Component } from './leaving-grant-age-65/leaving-grant-age-65.component';
import { LeavingGrant25YearsComponent } from './leaving-grant-25-years/leaving-grant-25-years.component';
import { SimulatorService } from '../../../services/simulator.service';

@Component({
  selector: 'app-leaving-budgets',
  standalone: true,
  imports: [
    AccordionPanelComponent,
    LeavingGrant25YearsComponent,
    LeavingGrantAge65Component
  ],
  templateUrl: './leaving-budgets.component.html',
  styleUrl: './leaving-budgets.component.css'
})
export class LeavingBudgetsComponent {

  private simulator = inject(SimulatorService);

  total = this.simulator.leavingGrantsTotal;

  private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    const t = this.total();
    return this.formatMoney(t);
  }
}