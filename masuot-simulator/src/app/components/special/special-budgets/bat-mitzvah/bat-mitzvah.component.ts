import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../../models/simulator.models';


@Component({
  selector: 'app-bat-mitzvah',
  standalone: true,
  imports: [CommonModule,AccordionPanelComponent],
  templateUrl: './bat-mitzvah.component.html',
  styleUrl: './bat-mitzvah.component.css'
})
export class BatMitzvahComponent {
  private familyService = inject(FamilyService);

  total = computed(() =>
    this.batMitzvah().reduce((s, x) => s + x.amount, 0)
  );

  batMitzvah = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.bat_mitzvah_amount > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.bat_mitzvah_amount,
        year: x.bat_mitzvah_year,
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
