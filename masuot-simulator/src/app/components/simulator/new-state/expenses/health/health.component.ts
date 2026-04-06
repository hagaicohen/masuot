import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../../../services/simulator.service';
import { FamilyService } from '../../../../../services/family.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './health.component.html'
})
export class HealthComponent {

  family = inject(FamilyService).family; // 🔥 הוספנו
  result = inject(SimulatorService).result;

  get badge() {
    const r = this.result();
    return r ? Math.round(r.healthExpenses ?? 0).toLocaleString('he-IL') + ' ₪' : '';
  }
}