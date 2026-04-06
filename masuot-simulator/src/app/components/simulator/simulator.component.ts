import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../services/family.service';
import { HeaderComponent } from './header/header.component';
import { BaseFamilyComponent } from './base-family/base-family.component';
import { CurrentStateComponent } from './current-state/current-state.component';
import { NewStateComponent } from './new-state/new-state.component';
import { DiffComponent } from './diff/diff.component';
import { SummaryBarComponent } from './summary-bar/summary-bar.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BaseFamilyComponent, CurrentStateComponent, NewStateComponent, DiffComponent, SummaryBarComponent],
  templateUrl: './simulator.component.html',
  styleUrl: './simulator.component.scss'
})
export class SimulatorComponent implements OnInit {
  private familyService = inject(FamilyService);
  ngOnInit() { //this.familyService.loadMockFamily(); 
    }
}
