// src/app/core/services/loading.service.ts

import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSignal = signal(false);

  loading = computed(() => this.loadingSignal());

  show() {
    this.loadingSignal.set(true);
  }

  hide(delay = 400) {
    setTimeout(() => {
      this.loadingSignal.set(false);
    }, delay);
  }
}
