import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../services/family.service';
import { AccordionPanelComponent } from '../../../components/shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../models/simulator.models';

@Component({
  selector: 'app-house-building',
  standalone: true,
  imports: [CommonModule,AccordionPanelComponent],
  templateUrl: './house-building.component.html',
  styleUrl: './house-building.component.css'
})
export class HouseBuildingComponent {
  private familyService = inject(FamilyService);

  total = computed(() =>
    this.paintGrant().reduce((s, x) => s + x.amount, 0)
  );

  paintGrant = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.paint_grant > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.paint_grant,
        year: x.paint_year,
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
