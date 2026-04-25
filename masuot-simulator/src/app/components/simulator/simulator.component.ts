import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { BaseFamilyComponent } from './base-family/base-family.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { NewStateComponent } from './new-state/new-state.component';
import { DiffComponent } from './diff/diff.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';
import { SpecialBudgetsComponent } from '../special-budgets/special-budgets.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BaseFamilyComponent, CurrentStateComponent, NewStateComponent, DiffComponent, SummaryBarComponent, SpecialBudgetsComponent ],
  templateUrl: './simulator.component.html',
  styleUrl: './simulator.component.scss'
})
export class SimulatorComponent implements OnInit {

  tab: 'current' | 'special' = 'current';

  ngOnInit() { 
  }
}
