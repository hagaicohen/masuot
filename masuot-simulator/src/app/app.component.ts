import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(public loading: LoadingService) {}
}
