import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../../../../services/family.service';
import { SimulatorService } from '../../../../services/simulator.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-salaries',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionPanelComponent],
  templateUrl: './salaries.component.html',
  styleUrl: './salaries.component.scss',
})
export class SalariesComponent {
  constructor(private familyService: FamilyService) {}

  family = inject(FamilyService).family;
  private sim = inject(SimulatorService);

  isMobile = window.innerWidth < 768;

  private salaryTimers: Record<string, any> = {};

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  get badge() {
    const f = this.family();
    if (!f) return '';

    const net = this.familyService.round(f.netSalary);

    // 🔥 משתמשים בערך המחושב האמיתי
    const updated = this.familyService.round(f.updatedNetSalary);

    return `נטו ${this.format(net)} ₪ · לחישוב ${this.format(updated)} ₪`;
  }

  private format(value: number): string {
    return value.toLocaleString('he-IL', { maximumFractionDigits: 0 });
  }

  memberBadge(m: any) {
    const current = this.format(m.currentSalary ?? 0);
    const expected = this.format(m.expectedSalary ?? 0);
    return `${current} ← ${expected} ₪`;
  }

  updateSalary(memberId: string, value: string) {
    const num = parseFloat(value.replace(/,/g, '')) || 0;
    this.sim.updateExpectedSalary(memberId, num);
  }

  // 🔥 פה התיקון האמיתי
  onSalaryChange() {
    const f = this.family();

    if (!f) return;

    f.members.forEach((m) => {
      this.sim.updateExpectedSalary(
        m.id,

        Number(m.gross_income || 0),
      );

      console.log('=== GROSS UPDATE ===');

      console.log({
        name: m.name,

        gross: m.gross_income,

        calculatedNet: m.expectedSalary,
      });
    });

    this.familyService.updateUpdatedNetSalary();
  }

  getMemberTitle(index: number, m: any): string {
    if (this.isMobile) {
      return `${m.name}`;
    }
    return `[${index + 1}] ${m.name}`;
  }

  getSortedMembers() {
    return (this.family()?.members ?? [])
      .filter((m) => (m.statusCode == 1))
      .sort((a, b) => (b.age ?? 0) - (a.age ?? 0));
  }

  formatMoney(value: any): string {
    const num = Math.round(Number(value || 0));

    return num.toLocaleString('he-IL');
  }

  onGrossInput(m: any, value: string) {
    const cleaned = value.replace(/[^0-9]/g, '');

    m.tempGross = Number(cleaned || 0);

    clearTimeout(this.salaryTimers[m.id]);

    this.salaryTimers[m.id] = setTimeout(() => {
      this.sim.updateExpectedSalary(
        m.id,

        Number(m.tempGross || 0),
      );

      console.log('=== AUTO NET ===');

      console.log({
        name: m.name,

        gross: m.tempGross,

        calculatedNet: m.expectedSalary,
      });
    }, 700);
  }
}
