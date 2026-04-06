import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-children', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './children.component.html' })
export class ChildrenComponent {
  family = inject(FamilyService).family;
  get badge() {
    const f = this.family();
    const count = f?.children?.length || 0;
  return `${count} ילדים`;
 }

  eduLabel(level: string): string {
    const map: Record<string,string> = { daycare: 'פעוטון', kindergarten: 'גן', elementary: 'יסודי', middle: 'חטיבה', high: 'תיכון' };
    return map[level] ?? level;
  }
}
