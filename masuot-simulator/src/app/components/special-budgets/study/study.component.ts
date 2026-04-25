import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../services/family.service';
import { AccordionPanelComponent } from '../../../components/shared/accordion-panel/accordion-panel.component';
import { SpecialBudget } from '../../../models/simulator.models';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule,AccordionPanelComponent],
  templateUrl: './study.component.html',
  styleUrl: './study.component.css'
})
export class StudyComponent {
  private familyService = inject(FamilyService);

  total = computed(() =>
    this.study().reduce((s, x) => s + x.amount, 0)
  );

  study = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .filter((x: SpecialBudget) => x.study_grant > 0)
      .map((x: SpecialBudget) => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.study_grant,
        year: x.study_year,
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

