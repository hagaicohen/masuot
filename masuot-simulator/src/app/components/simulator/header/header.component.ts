import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../../../services/family.service';
import { AuthService } from '../../../services/auth.service';

@Component({ selector: 'app-header', standalone: true, imports: [CommonModule], templateUrl: './header.component.html', styleUrl: './header.component.scss' })
export class HeaderComponent {
  family = inject(FamilyService).family;
  auth   = inject(AuthService);
}
