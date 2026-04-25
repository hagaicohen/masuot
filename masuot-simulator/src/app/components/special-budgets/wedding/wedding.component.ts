import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../services/family.service';
import { AccordionPanelComponent } from '../../../components/shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../models/simulator.models';


@Component({
  selector: 'app-wedding',
  standalone: true,
  imports: [CommonModule,AccordionPanelComponent],
  templateUrl: './wedding.component.html',
  styleUrl: './wedding.component.css'
})
export class WeddingComponent {
  private familyService = inject(FamilyService);

  total = computed(() =>
    this.wedding().reduce((s, x) => s + x.amount, 0)
  );

  wedding = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.wedding_grant > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.wedding_grant,
        year: x.wedding_year,
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
