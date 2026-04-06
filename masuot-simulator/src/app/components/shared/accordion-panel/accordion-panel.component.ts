import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-panel.component.html'
})
export class AccordionPanelComponent {
  @Input() title    = '';
  @Input() badge    = '';
  @Input() level    = 1;
  @Input() open     = false;
  @Input() badgeRed = false;
  toggle() { this.open = !this.open; }
}