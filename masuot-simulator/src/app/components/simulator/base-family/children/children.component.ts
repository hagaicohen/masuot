import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-children', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './children.component.html' })
export class ChildrenComponent {
  
  family = inject(FamilyService).family;

  // 🔥 ילדים ממוינים לפי גיל (עולה)
  get childrenSorted() {
    const f = this.family();
    return (f?.children || [])
      .slice() // חשוב כדי לא לשנות מקור
      .sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
  }

  get badge() {
    const f = this.family();
    const count = f?.children?.length || 0;
    return `${count} ילדים`;
  }
}
