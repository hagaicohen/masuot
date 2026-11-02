import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './members.component.html',
})
export class MembersComponent {
  family = inject(FamilyService).family;

  get badge(): string {
    const count = this.adultMembers.length;
    return `${count} חברים`;
  }

  get adultMembers() {
    return (this.family()?.members || []).filter((m) => {
      return m.statusCode == 1;
    });
  }

  // Display only: years.months (not decimal years)
  formatAge(age: number | null | undefined): string {
    if (age == null || !Number.isFinite(Number(age)) || Number(age) < 0) {
      return '—';
    }

    const value = Number(age);
    const years = Math.floor(value);
    const months = Math.min(
      11,
      Math.floor((value - years) * 12 + 1e-9)
    );

    return `${years}.${String(months).padStart(2, '0')}`;
  }

}
