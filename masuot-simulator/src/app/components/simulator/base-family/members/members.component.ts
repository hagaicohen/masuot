import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({ selector: 'app-members', standalone: true, imports: [CommonModule, AccordionPanelComponent], templateUrl: './members.component.html' })
export class MembersComponent {
  
  family = inject(FamilyService).family;

  get badge(): string {
    const count = this.adultMembers.length;
    return `${count} חברים`;
  }

  get adultMembers() {
    return (this.family()?.members || []).filter(m => {
      return m.statusCode == 1;
    });
  }

}
