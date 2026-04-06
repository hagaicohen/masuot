import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';

@Component({ selector: 'app-summary-bar', standalone: true, imports: [CommonModule], templateUrl: './summary-bar.component.html', styleUrl: './summary-bar.component.scss' })
export class SummaryBarComponent {
  result = inject(SimulatorService).result;
}
