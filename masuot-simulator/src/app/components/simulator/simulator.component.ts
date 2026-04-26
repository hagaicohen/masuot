import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { BaseFamilyComponent } from './base-family/base-family.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { NewStateComponent } from './new-state/new-state.component';
import { DiffComponent } from './diff/diff.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';
import { SpecialBudgetsComponent } from '../special/special-budgets/special-budgets.component';
import { LeavingBudgetsComponent } from "../special/leaving-budgets/leaving-budgets.component";
import { SharesComponent } from "../special/shares/shares.component";
import { SimulatorService } from '../../services/simulator.service';
import { SpecialSummaryBarComponent } from "../special/special-summary-bar/special-summary-bar.component";

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BaseFamilyComponent, CurrentStateComponent, NewStateComponent, DiffComponent, SummaryBarComponent, SpecialBudgetsComponent, LeavingBudgetsComponent, SharesComponent, SpecialSummaryBarComponent],
  templateUrl: './simulator.component.html',
  styleUrl: './simulator.component.scss'
})
export class SimulatorComponent implements OnInit {

  simulator = inject(SimulatorService);

  //tab: 'current' | 'special' = 'current';

  ngOnInit() { 
  }
}
