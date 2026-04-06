import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { FamilyService } from '../../../../services/family.service';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './savings.component.html'
})
export class SavingsComponent {

  constructor(private familySvc:FamilyService){

  }

  result = inject(SimulatorService).result;

  get badge(): string {
    const r = this.result();
    if (!r) return '';

    const total = (r.hishtalmutFund || 0) + (r.pensionContribution || 0);
    const rnd_total = this.familySvc.round(total);
    return rnd_total.toLocaleString('he-IL') + ' ₪';
  }
}