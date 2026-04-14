import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { EducationComponent } from './education/education.component';
import { HealthComponent } from './health/health.component';
//import { TaxesComponent } from './taxes/taxes.component';
import { FamilyService } from '../../../../services/family.service';

@Component({ selector: 'app-expenses', standalone: true, imports: [CommonModule, AccordionPanelComponent, EducationComponent, HealthComponent/*, TaxesComponent*/], templateUrl: './expenses.component.html' })
export class ExpensesComponent {
  
  constructor(private familyService: FamilyService) {}
  
  result = inject(SimulatorService).result;

 get badge() {
      const r = this.result();
      if (!r) return '';

      const total = this.familyService.round(r.expensesWithoutTaxes);
      return total.toLocaleString('he-IL') + ' ₪';
  }
}
