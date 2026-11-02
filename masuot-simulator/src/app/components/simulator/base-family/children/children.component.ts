
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-children',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './children.component.html',
})
export class ChildrenComponent {
  family = inject(FamilyService).family;

  get childrenSorted() {
    const f = this.family();

    return (f?.children || [])
      .slice()
      .sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
  }

  get badge() {
    const f = this.family();
    const count = f?.children?.length || 0;
    return `${count} ילדים`;
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
