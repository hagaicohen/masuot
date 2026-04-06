import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../services/family.service';
import { SimulatorService } from '../../../services/simulator.service';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { MembersComponent } from './members/members.component';
import { ChildrenComponent } from './children/children.component';
import { SalariesComponent } from './salaries/salaries.component';

@Component({
  selector: 'app-base-family',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent, MembersComponent, ChildrenComponent, SalariesComponent],
  templateUrl: './base-family.component.html'
})
export class BaseFamilyComponent {
  constructor(private familyService: FamilyService) {}
  family = inject(FamilyService).family;
  result = inject(SimulatorService).result;

  get badge(): string {
    const f = this.family();
    if (!f) return '';

    const total = f.members?.length ?? 0;

    const updatedNet = this.familyService.round(f.netSalary ?? 0);

    return `${total} נפשות · נטו ${updatedNet.toLocaleString('he-IL')} ₪`;
  }
}