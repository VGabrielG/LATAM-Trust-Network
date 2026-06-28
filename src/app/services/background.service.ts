import { Injectable, signal } from '@angular/core';

export type BgMode = 'particles' | 'map';

@Injectable({ providedIn: 'root' })
export class BackgroundService {
  readonly mode = signal<BgMode>('particles');

  setMode(m: BgMode) {
    this.mode.set(m);
    localStorage.setItem('app-bg-mode', m);
  }

  loadSaved() {
    const saved = localStorage.getItem('app-bg-mode') as BgMode | null;
    if (saved === 'particles' || saved === 'map') {
      this.mode.set(saved);
    }
  }
}
