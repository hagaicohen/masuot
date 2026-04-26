import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../../components/shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../../models/simulator.models';

@Component({
  selector: 'app-leaving-grant-age-65',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './leaving-grant-age-65.component.html',
  styleUrl: './leaving-grant-age-65.component.css'
})
export class LeavingGrantAge65Component {

  private familyService = inject(FamilyService);

  // 🔥 רשימת חברים
  grants = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.leaving_grant_age_65 > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.leaving_grant_age_65,
        year: x.leaving_grant_age_65_year,
        age: x.age
      }))
      .sort((a, b) => a.year - b.year);
  });

  // 🔥 סכום כולל
  total = computed(() =>
    this.grants().reduce((s, x) => s + x.amount, 0)
  );

  private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    const t = this.total();
    return this.formatMoney(t);
  }
}