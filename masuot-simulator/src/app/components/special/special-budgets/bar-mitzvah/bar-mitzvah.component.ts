import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../../models/simulator.models';

@Component({
  selector: 'app-bar-mitzvah',
  standalone: true,
  imports: [CommonModule,AccordionPanelComponent],
  templateUrl: './bar-mitzvah.component.html',
  styleUrl: './bar-mitzvah.component.css'
})
export class BarMitzvahComponent {

  private familyService = inject(FamilyService);

  total = computed(() =>
    this.barMitzvah().reduce((s, x) => s + x.amount, 0)
  );

  barMitzvah = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.bar_mitzvah_amount > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.bar_mitzvah_amount,
        year: x.bar_mitzvah_year,
        age: x.age
      }))
      .sort((a, b) => a.year - b.year);
  });

  private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    return this.formatMoney(this.total());
  }
}