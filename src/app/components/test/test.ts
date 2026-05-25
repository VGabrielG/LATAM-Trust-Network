import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from '../landing/landing';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, LandingComponent],
  template: `
    <div [class]="currentThemeClass" 
         [class.force-color]="isColorEnabled" 
         class="theme-wrapper">
      
      <!-- Top Slim Bar Switcher -->
      <div class="theme-toolbar">
        <div class="toolbar-content container">
          <div class="toolbar-header mono">PROTOCOL_ENGINE_v7.0</div>
          
          <div class="toolbar-actions">
            <!-- Mode Toggle -->
            <button class="mode-btn" [class.active]="isColorEnabled" (click)="isColorEnabled = !isColorEnabled">
              <span class="indicator"></span>
              {{ isColorEnabled ? 'IMG:COLOR' : 'IMG:BW' }}
            </button>

            <div class="separator"></div>

            <!-- Horizontal Theme List -->
            <div class="theme-strip">
              <button *ngFor="let theme of themes" 
                      class="strip-btn"
                      (click)="setTheme(theme.id)" 
                      [class.active]="currentTheme === theme.id">
                {{ theme.name.split('//')[1].trim() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-landing></app-landing>
    </div>
  `,
  styles: [`
    .theme-wrapper {
      min-height: 100vh;
      background-color: var(--bg-color);
      color: var(--text-main);
      transition: all 0.5s ease;
    }
    .theme-wrapper.force-color {
      --img-filter: none !important;
      --img-opacity: 1 !important;
    }

    .theme-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      z-index: 10001; /* Above header */
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .toolbar-header {
      font-size: 0.55rem;
      color: var(--primary);
      letter-spacing: 2px;
      white-space: nowrap;
      opacity: 0.6;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
      overflow: hidden;
    }

    .mode-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      font-size: 0.55rem;
      font-family: 'Space Mono', monospace;
      padding: 3px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      border-radius: 20px;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .mode-btn .indicator {
      width: 5px;
      height: 5px;
      background: #444;
      border-radius: 50%;
    }
    .mode-btn.active { border-color: var(--primary); color: var(--primary); }
    .mode-btn.active .indicator { background: var(--primary); box-shadow: 0 0 5px var(--primary); }

    .separator {
      width: 1px;
      height: 15px;
      background: rgba(255,255,255,0.1);
    }

    .theme-strip {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 5px 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .theme-strip::-webkit-scrollbar { display: none; }

    .strip-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      font-size: 0.5rem;
      font-family: 'Space Mono', monospace;
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      border-radius: 3px;
      transition: all 0.2s;
    }
    .strip-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .strip-btn.active {
      color: var(--primary);
      background: rgba(255,255,255,0.05);
      font-weight: 800;
      box-shadow: inset 0 -1px 0 var(--primary);
    }
    
    /* THEME DEFINITIONS */
    .theme-gold { --primary: #fbbf24; --bg-color: #050505; --text-main: #fff; --text-muted: #888; --blueprint-line: rgba(255,255,255,0.03); --body-font: 'Inter', sans-serif; }
    .theme-silver { --primary: #94a3b8; --bg-color: #0f172a; --text-main: #f8fafc; --text-muted: #64748b; --blueprint-line: rgba(148,163,184,0.05); --body-font: 'Outfit', sans-serif; }
    .theme-navy { --primary: #64ffda; --bg-color: #0a192f; --text-main: #ccd6f6; --text-muted: #8892b0; --blueprint-line: rgba(100,255,218,0.03); --body-font: 'Inter', sans-serif; }
    .theme-forest { --primary: #52b788; --bg-color: #061e1b; --text-main: #d8f3dc; --text-muted: #74c69d; --blueprint-line: rgba(82,183,136,0.05); --body-font: 'Inter', sans-serif; }
    .theme-white { --primary: #000; --bg-color: #fff; --text-main: #111; --text-muted: #666; --blueprint-line: rgba(0,0,0,0.05); --body-font: 'Inter', sans-serif; }
    .theme-rose { --primary: #e0aaff; --bg-color: #1a1617; --text-main: #fff; --text-muted: #c8b6ff; --blueprint-line: rgba(224,170,255,0.05); --body-font: 'Outfit', sans-serif; }
    .theme-cyber { --primary: #ff00ff; --bg-color: #0d0221; --text-main: #fff; --text-muted: #00f5d4; --blueprint-line: rgba(0,245,212,0.1); --body-font: 'Space Mono', monospace; }
    .theme-blueprint { --primary: #e0e1dd; --bg-color: #1b263b; --text-main: #fff; --text-muted: #778da9; --blueprint-line: rgba(255,255,255,0.2); --body-font: 'Space Mono', monospace; }
    .theme-mars { --primary: #ff4d4d; --bg-color: #1a0f0f; --text-main: #ffe3e3; --text-muted: #a35c5c; --blueprint-line: rgba(255,77,77,0.05); --body-font: 'Outfit', sans-serif; }
    .theme-mono { --primary: #fff; --bg-color: #111; --text-main: #fff; --text-muted: #444; --blueprint-line: rgba(255,255,255,0.1); --body-font: 'Inter', sans-serif; }
    .theme-dusk { --primary: #ff9e00; --bg-color: #2d1b1b; --text-main: #fff; --text-muted: #ff5400; --blueprint-line: rgba(255,158,0,0.05); --body-font: 'Outfit', sans-serif; }
    .theme-ice { --primary: #0077b6; --bg-color: #f0f4f8; --text-main: #023e8a; --text-muted: #0096c7; --blueprint-line: rgba(0,119,182,0.1); --body-font: 'Inter', sans-serif; }
    .theme-vapor { --primary: #ff0054; --bg-color: #240046; --text-main: #70e000; --text-muted: #9ef01a; --blueprint-line: rgba(112,224,0,0.1); --body-font: 'Space Mono', monospace; }
    .theme-terra { --primary: #d4a373; --bg-color: #3d2b1f; --text-main: #faedcd; --text-muted: #ccd5ae; --blueprint-line: rgba(212,163,115,0.05); --body-font: 'Inter', sans-serif; }
    
    /* NEW CREATIVE THEMES */
    .theme-ocean { --primary: #00f5d4; --bg-color: #001219; --text-main: #94d2bd; --text-muted: #0a9396; --blueprint-line: rgba(0,245,212,0.05); --body-font: 'Outfit', sans-serif; }
    .theme-solar { --primary: #eeef20; --bg-color: #004b23; --text-main: #ccff33; --text-muted: #38b000; --blueprint-line: rgba(238,239,32,0.05); --body-font: 'Inter', sans-serif; }
    .theme-amethyst { --primary: #9d4edd; --bg-color: #240046; --text-main: #e0aaff; --text-muted: #7b2cbf; --blueprint-line: rgba(157,78,221,0.1); --body-font: 'Outfit', sans-serif; }
    .theme-ruby { --primary: #ba181b; --bg-color: #0b090a; --text-main: #f5f3f4; --text-muted: #e5383b; --blueprint-line: rgba(186,24,27,0.05); --body-font: 'Inter', sans-serif; }
    .theme-obsidian { --primary: #333; --bg-color: #000; --text-main: #999; --text-muted: #222; --blueprint-line: rgba(255,255,255,0.02); --body-font: 'Space Mono', monospace; }
    .theme-neon-gold { --primary: #ffb700; --bg-color: #1a1a1a; --text-main: #fff; --text-muted: #666; --blueprint-line: rgba(255,183,0,0.1); --body-font: 'Space Mono', monospace; }
    .theme-lava { --primary: #ff4d00; --bg-color: #1a0a00; --text-main: #ff9d00; --text-muted: #8a2e00; --blueprint-line: rgba(255,77,0,0.1); --body-font: 'Outfit', sans-serif; }
    .theme-glacier { --primary: #caf0f8; --bg-color: #00b4d8; --text-main: #fff; --text-muted: #0077b6; --blueprint-line: rgba(255,255,255,0.2); --body-font: 'Inter', sans-serif; }
    .theme-sandstone { --primary: #bc6c25; --bg-color: #fefae0; --text-main: #283618; --text-muted: #606c38; --blueprint-line: rgba(188,108,37,0.1); --body-font: 'Outfit', sans-serif; }
    .theme-midnight { --primary: #4cc9f0; --bg-color: #480ca8; --text-main: #f72585; --text-muted: #b5179e; --blueprint-line: rgba(76,201,240,0.1); --body-font: 'Space Mono', monospace; }
  `]
})
export class TestComponent {
  currentTheme = 'gold';
  isColorEnabled = false;

  get currentThemeClass() { return 'theme-' + this.currentTheme; }

  themes = [
    { id: 'gold', name: '01 // GOLD' },
    { id: 'silver', name: '02 // SILVER' },
    { id: 'navy', name: '03 // NAVY' },
    { id: 'forest', name: '04 // FOREST' },
    { id: 'white', name: '05 // LIGHT' },
    { id: 'rose', name: '06 // ROSE' },
    { id: 'cyber', name: '07 // CYBER' },
    { id: 'blueprint', name: '08 // BLUE' },
    { id: 'mars', name: '09 // MARS' },
    { id: 'mono', name: '10 // MONO' },
    { id: 'dusk', name: '11 // DUSK' },
    { id: 'ice', name: '12 // ICE' },
    { id: 'vapor', name: '13 // VAPOR' },
    { id: 'terra', name: '14 // TERRA' },
    { id: 'ocean', name: '15 // OCEAN' },
    { id: 'solar', name: '16 // SOLAR' },
    { id: 'amethyst', name: '17 // PURPLE' },
    { id: 'ruby', name: '18 // RUBY' },
    { id: 'obsidian', name: '19 // DARK' },
    { id: 'neon-gold', name: '20 // N_GOLD' },
    { id: 'lava', name: '21 // LAVA' },
    { id: 'glacier', name: '22 // GLACIER' },
    { id: 'sandstone', name: '23 // SAND' },
    { id: 'midnight', name: '24 // MIDNIGHT' }
  ];

  setTheme(theme: string) {
    this.currentTheme = theme;
  }
}
