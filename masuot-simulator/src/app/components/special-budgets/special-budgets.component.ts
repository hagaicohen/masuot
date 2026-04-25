import { inject } from '@angular/core';
import { SimulatorService } from '../../services/simulator.service';
import { Component } from '@angular/core';
import { AccordionPanelComponent } from '../shared/accordion-panel/accordion-panel.component';
import { BarMitzvahComponent } from "./bar-mitzvah/bar-mitzvah.component";
import { BatMitzvahComponent } from "./bat-mitzvah/bat-mitzvah.component";
import { WeddingComponent } from "./wedding/wedding.component";
import { StudyComponent } from "./study/study.component";
import { HouseBuildingComponent } from "./house-building/house-building.component";

@Component({
  selector: 'app-special-budgets',
  standalone: true,
  imports: [AccordionPanelComponent, BarMitzvahComponent,BatMitzvahComponent, WeddingComponent, StudyComponent, HouseBuildingComponent],
  templateUrl: './special-budgets.component.html',
  styleUrl: './special-budgets.component.css'
})
export class SpecialBudgetsComponent {

  private simulator = inject(SimulatorService);

  total = this.simulator.specialGrantsTotal;

  private formatMoney(value: number): string {
    return value.toLocaleString('he-IL') + ' ₪';
  }

  get badge() {
    const t = this.total();
    return t > 0 ? this.formatMoney(t) : '';
  }
}
