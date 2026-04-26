import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FamilyService } from '../../../../services/family.service';
import { AccordionPanelComponent } from '../../../shared/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-house-building',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './house-building.component.html',
  styleUrl: './house-building.component.css'
})
export class HouseBuildingComponent {

  private familyService = inject(FamilyService);

  // 🔥 סכום כולל של צביעה לכל המשפחה
  total = computed(() => {
    const f = this.familyService.family();
    if (!f) return 0;

    const list = f.specialBudgets ?? [];

    return list.reduce(
      (sum, x) => sum + (x.paint_grant || 0),
      0
    );
  });

  private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    return this.formatMoney(this.total());
  }
}