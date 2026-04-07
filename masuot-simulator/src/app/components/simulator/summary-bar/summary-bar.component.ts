import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';
import { FamilyService } from '../../../services/family.service';

@Component({ selector: 'app-summary-bar', standalone: true, imports: [CommonModule], templateUrl: './summary-bar.component.html', styleUrl: './summary-bar.component.scss' })
export class SummaryBarComponent {
  
  family = this.familyService.family;

  constructor(public familyService: FamilyService) {}

  toNumber(val: any): number {
    return Number(val ?? 0);
  }
  result = inject(SimulatorService).result;

  public get simFamily() {
    const f = this.family();
    return f?.simulation;
  }
  
  getCurrentState(){

    if (!this.family()?.simulation) return '';

    // 🔥 עיגול
    const value = this.familyService.round(Number(this.family()?.simulation.current_state ?? 0));

    return `${value.toLocaleString('he-IL')} ₪`;
  }
}
