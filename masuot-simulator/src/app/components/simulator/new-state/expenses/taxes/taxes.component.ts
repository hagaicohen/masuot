import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';
import { FamilyService } from '../../../../../services/family.service';

@Component({
  selector: 'app-taxes',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './taxes.component.html'
})
export class TaxesComponent {
  constructor(private familyService: FamilyService) {}
  result = inject(SimulatorService).result;

  get badge() {
    const r = this.result();
    let tx = 0;
    if (r != null){
      tx = this.familyService.round(r!.taxes);
    }
    
    return tx.toLocaleString('he-IL') + ' ₪';
  }
}