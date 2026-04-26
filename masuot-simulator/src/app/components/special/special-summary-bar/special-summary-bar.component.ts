import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';

@Component({
  selector: 'app-special-summary-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './special-summary-bar.component.html',
  styleUrl: './special-summary-bar.component.scss'
})
export class SpecialSummaryBarComponent {

  simulator = inject(SimulatorService);

  special = this.simulator.specialGrantsTotal;
  leaving = this.simulator.leavingGrantsTotal;
  shares  = this.simulator.sharesTotal;
  total   = this.simulator.allSpecialTotal;

  format(value: number): string {
    return `${value.toLocaleString('he-IL')} ₪`;
  }
}