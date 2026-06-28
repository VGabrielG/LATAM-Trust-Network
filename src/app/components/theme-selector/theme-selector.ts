import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ThemeColor {
  id: string;
  name: string;
  bg: string;
  surface: string;
  accent: string;
  textColor: string;
  mutedColor: string;
}

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector-container">
      <!-- Floating Button -->
      <button 
        class="floating-theme-btn" 
        (click)="toggleMenu($event)" 
        [class.active]="isOpen"
        title="Cambiar Color de Fondo"
        aria-label="Seleccionar Color de Fondo"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C4.95206 19.0983 5 19.2322 5 19.3712V20C5 21.1046 5.89543 22 7 22H12Z"/>
          <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
          <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/>
          <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/>
          <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/>
        </svg>
        <span class="tooltip">Fondo</span>
      </button>

      <!-- Palette Dropdown Menu -->
      <div class="theme-palette-dropdown" [class.open]="isOpen" (click)="$event.stopPropagation()">
        <div class="palette-header">
          <span class="mono title">Filtro de Colores</span>
          <span class="mono subtitle">Paleta de tonos serios</span>
        </div>
        
        <div class="palette-grid">
          <button 
            *ngFor="let theme of themes" 
            class="color-option-btn" 
            [class.active]="currentThemeId === theme.id"
            (click)="selectTheme(theme)"
            [title]="theme.name"
          >
            <!-- Preview of BG and Surface -->
            <span class="color-preview" [style.background-color]="theme.bg">
              <span class="inner-preview" [style.background-color]="theme.surface"></span>
            </span>
            <span class="color-name mono">{{ theme.name }}</span>
          </button>
        </div>

        <div class="palette-footer">
          <button class="reset-btn mono" (click)="resetTheme()">RESTAURAR ORIGINAL</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector-container {
      position: fixed;
      bottom: 40px;
      left: 40px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }

    /* Floating Button */
    .floating-theme-btn {
      width: 60px;
      height: 60px;
      background-color: var(--surface-color);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }

    .floating-theme-btn:hover {
      transform: scale(1.1) rotate(15deg);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
    }

    .floating-theme-btn.active {
      transform: scale(1.05) rotate(90deg);
      background-color: var(--text-main);
      color: var(--bg-color);
      border-color: var(--text-main);
    }

    .floating-theme-btn .tooltip {
      position: absolute;
      left: 75px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.7rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: 'Space Mono', monospace;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      white-space: nowrap;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .floating-theme-btn:hover .tooltip {
      opacity: 1;
    }

    /* Dropdown */
    .theme-palette-dropdown {
      position: absolute;
      bottom: 75px;
      left: 0;
      width: 320px;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      transform: translateY(15px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      transform-origin: bottom left;
    }

    .theme-palette-dropdown.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .palette-header {
      margin-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.8rem;
    }

    .palette-header .title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .palette-header .subtitle {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    .palette-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }

    /* Custom Scrollbar for Grid */
    .palette-grid::-webkit-scrollbar {
      width: 4px;
    }
    .palette-grid::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
    }
    .palette-grid::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }

    .color-option-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      color: var(--text-main);
      width: 100%;
    }

    .color-option-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .color-option-btn.active {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--text-main);
    }

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .inner-preview {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .color-name {
      font-size: 0.65rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .palette-footer {
      margin-top: 1.2rem;
      padding-top: 0.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: center;
    }

    .reset-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--text-main);
      padding: 8px;
      border-radius: 4px;
      font-size: 0.65rem;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .reset-btn:hover {
      background: var(--text-main);
      color: var(--bg-color);
      border-color: var(--text-main);
    }

    @media (max-width: 768px) {
      .theme-selector-container {
        bottom: 20px;
        left: 20px;
      }
      .floating-theme-btn {
        width: 50px;
        height: 50px;
      }
      .floating-theme-btn .tooltip {
        display: none; /* Hide tooltip on mobile */
      }
      .theme-palette-dropdown {
        bottom: 60px;
        width: 280px;
        padding: 1rem;
      }
      .palette-grid {
        max-height: 220px;
      }
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  isOpen = false;
  currentThemeId = 'obsidian';

  // 17 Themes including "Beige Flat"
  readonly themes: ThemeColor[] = [
    { id: 'beige', name: 'Beige Plano', bg: '#f2f1ed', surface: '#eae9e5', accent: '#1e2022', textColor: '#1e2022', mutedColor: '#7f858a' },
    { id: 'obsidian', name: 'Obsidian', bg: '#050505', surface: '#0a0a0a', accent: '#ffffff', textColor: '#ffffff', mutedColor: '#666666' },
    { id: 'charcoal', name: 'Charcoal', bg: '#121212', surface: '#1c1c1c', accent: '#e0e0e0', textColor: '#ffffff', mutedColor: '#777777' },
    { id: 'midnight', name: 'Midnight', bg: '#080c14', surface: '#0f1624', accent: '#94a3b8', textColor: '#f8fafc', mutedColor: '#64748b' },
    { id: 'navy', name: 'Deep Navy', bg: '#060b18', surface: '#0d1527', accent: '#3b82f6', textColor: '#f1f5f9', mutedColor: '#60a5fa' },
    { id: 'slate', name: 'Slate Gray', bg: '#0f172a', surface: '#1e293b', accent: '#cbd5e1', textColor: '#f8fafc', mutedColor: '#94a3b8' },
    { id: 'nord', name: 'Nord Cold', bg: '#1a1c23', surface: '#242933', accent: '#88c0d0', textColor: '#eceff4', mutedColor: '#d8dee9' },
    { id: 'steel', name: 'Steel Blue', bg: '#131924', surface: '#1d2432', accent: '#818cf8', textColor: '#f5f7ff', mutedColor: '#94a3b8' },
    { id: 'forest', name: 'Deep Forest', bg: '#05120a', surface: '#0a2012', accent: '#34d399', textColor: '#ecfdf5', mutedColor: '#6ee7b7' },
    { id: 'moss', name: 'Dark Moss', bg: '#0c0f0a', surface: '#161c12', accent: '#a3e635', textColor: '#f7fee7', mutedColor: '#bef264' },
    { id: 'burgundy', name: 'Burgundy', bg: '#120509', surface: '#200a10', accent: '#f43f5e', textColor: '#fff1f2', mutedColor: '#fda4af' },
    { id: 'aubergine', name: 'Aubergine', bg: '#0d0614', surface: '#180c24', accent: '#c084fc', textColor: '#faf5ff', mutedColor: '#d8b4fe' },
    { id: 'espresso', name: 'Espresso', bg: '#0f0b08', surface: '#1c1510', accent: '#fb923c', textColor: '#fff7ed', mutedColor: '#fdba74' },
    { id: 'teal', name: 'Dark Teal', bg: '#041416', surface: '#092327', accent: '#2dd4bf', textColor: '#f0fdfa', mutedColor: '#5eead4' },
    { id: 'graphite', name: 'Graphite', bg: '#18181b', surface: '#27272a', accent: '#d4d4d8', textColor: '#f4f4f5', mutedColor: '#a1a1aa' },
    { id: 'plum', name: 'Gothic Plum', bg: '#100512', surface: '#1c0a20', accent: '#e879f9', textColor: '#fdf4ff', mutedColor: '#f0abfc' },
    { id: 'sage', name: 'Muted Sage', bg: '#10120e', surface: '#1a1f17', accent: '#a7f3d0', textColor: '#f0fdf4', mutedColor: '#86efac' }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('app-bg-theme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.id === savedTheme);
      if (theme) {
        this.applyTheme(theme);
      }
    } else {
      // Default to obsidian
      const theme = this.themes.find(t => t.id === 'obsidian');
      if (theme) this.applyTheme(theme);
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  selectTheme(theme: ThemeColor) {
    this.applyTheme(theme);
    localStorage.setItem('app-bg-theme', theme.id);
  }

  resetTheme() {
    const defaultTheme = this.themes.find(t => t.id === 'obsidian') || this.themes[1];
    this.applyTheme(defaultTheme);
    localStorage.removeItem('app-bg-theme');
  }

  private applyTheme(theme: ThemeColor) {
    this.currentThemeId = theme.id;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--bg-color', theme.bg);
    root.style.setProperty('--surface-color', theme.surface);
    root.style.setProperty('--primary', theme.accent);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--text-main', theme.textColor);
    root.style.setProperty('--text-muted', theme.mutedColor);
  }
}
