import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../services/simulator.service';

@Component({ selector: 'app-diff', standalone: true, imports: [CommonModule], templateUrl: './diff.component.html' })
export class DiffComponent {
  result = inject(SimulatorService).result;
  get badge() {
    const r = this.result();
    if (!r) return '';
    const sign = r.diff > 0 ? '▼' : '▲';
    return sign + ' ' + Math.abs(r.diff).toLocaleString('he-IL') + ' ₪';
  }
  get badgeRed() { return (this.result()?.diff ?? 0) > 0; }
}
