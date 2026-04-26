import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AccordionPanelComponent } from '../../shared/accordion-panel/accordion-panel.component';
import { FamilyService } from '../../../services/family.service';
import { SimulatorService } from '../../../services/simulator.service';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [CommonModule, AccordionPanelComponent],
  templateUrl: './shares.component.html',
  styleUrl: './shares.component.css'
})
export class SharesComponent {

  private familyService = inject(FamilyService);
  private simulatorService = inject(SimulatorService);

  // 🔥 רשימת מניות לפי חבר
  shares = computed(() => {
    const f = this.familyService.family();
    if (!f) return [];

    return (f.specialBudgets ?? [])
      .map(x => ({
        name: `${x.first_name} ${x.last_name}`,
        amount: x.shares_amount || 0
      }))
      .filter(x => x.amount > 0);
  });

  // 🔥 סכום כולל (ל־badge)
   private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    return this.formatMoney(this.simulatorService.sharesTotal());
  }
}