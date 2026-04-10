import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../../../services/family.service';
import { AdminService } from '../../../../../services/admin.service';
import { SimulatorService } from '../../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './education.component.html'
})
export class EducationComponent {

  family = inject(FamilyService).family;
  admin  = inject(AdminService).params;
  result = inject(SimulatorService).result;

  inputs = inject(SimulatorService).inputs;
  rules  = inject(SimulatorService).rules;

  // 🔴 FIX — הבאנר מציג הוצאה בפועל (כולל השתתפות)
  get badge() {
    const r = this.result();
    return r ? r.educationNet.toLocaleString('he-IL') + ' ₪' : '';
  }

  eduLabel(level: string): string {
    const map: Record<string,string> = {
      daycare: 'פעוטון',
      kindergarten: 'גן',
      elementary: 'יסודי',
      middle: 'חטיבה',
      high: 'תיכון'
    };
    return map[level] ?? level;
  }

  eduRate(level: string): number {
    const p = this.admin();
    if (!p) return 0;

    const rates: Record<string,number> = {
      daycare: p.education.daycare,
      kindergarten: p.education.kindergarten,
      elementary: p.education.elementary,
      middle: p.education.middle,
      high: p.education.high
    };

    return rates[level] ?? 0;
  }
}