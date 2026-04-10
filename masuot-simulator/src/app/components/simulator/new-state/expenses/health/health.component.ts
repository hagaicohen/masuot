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

  Math = Math;

  family = inject(FamilyService).family; // 🔥 הוספנו
  result = inject(SimulatorService).result;

  get badge() {
    const r = this.result();

    if (!r) return '';

    // 🔥 ADDED — normalize participation (always positive)
    const participation = Math.abs(
      Number(this.family()?.inputs?.health_participation ?? 0)
    );

    // 🔥 UPDATED — subtract participation
    const total = Math.round((r.healthExpenses ?? 0) - participation);

    return total.toLocaleString('he-IL') + ' ₪';
  }
}