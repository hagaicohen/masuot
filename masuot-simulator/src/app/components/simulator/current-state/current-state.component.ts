import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { FamilyService } from '../../../services/family.service';

@Component({
  selector: 'app-current-state',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './current-state.component.html'
})
export class CurrentStateComponent {

  constructor(private familyService: FamilyService) {}

  family = inject(FamilyService).family;

  // 🔥 טיפוס מקומי קטן
  public get simFamily() {
    const f = this.family();
    return f?.simulation;
  }

  get badge(): string {
    const sim = this.simFamily;

    if (!sim) return '';

    // 🔥 עיגול
    const value = this.familyService.round(Number(sim.current_state ?? 0));

    return `${value.toLocaleString('he-IL')} ₪`;
  }
}