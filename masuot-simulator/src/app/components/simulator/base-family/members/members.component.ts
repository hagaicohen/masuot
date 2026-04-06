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
    return m.age > 18;
  });
}

getAge(date: Date): number {
  const today = new Date();
  const birth = new Date(date);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

}
