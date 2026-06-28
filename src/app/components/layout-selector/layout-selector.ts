import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AppLayout {
  id: string;
  name: string;
  description: string;
  iconSvg: string;
}

@Component({
  selector: 'app-layout-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-selector-container">
      <!-- Floating Button -->
      <button 
        class="floating-layout-btn" 
        (click)="toggleMenu($event)" 
        [class.active]="isOpen"
        title="Cambiar Distribución de Página"
        aria-label="Seleccionar Distribución de Página"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
        <span class="tooltip">Diseño</span>
      </button>

      <!-- Layout Dropdown Menu -->
      <div class="layout-dropdown" [class.open]="isOpen" (click)="$event.stopPropagation()">
        <div class="layout-header">
          <span class="mono title">Estructura Web</span>
          <span class="mono subtitle">Elige la distribución de la página</span>
        </div>
        
        <div class="layout-list">
          <button 
            *ngFor="let layout of layouts" 
            class="layout-option-btn" 
            [class.active]="currentLayoutId === layout.id"
            (click)="selectLayout(layout.id)"
            [title]="layout.description"
          >
            <div class="layout-icon-preview" [innerHTML]="layout.iconSvg"></div>
            <div class="layout-details">
              <span class="layout-name mono">{{ layout.name }}</span>
              <span class="layout-desc">{{ layout.description }}</span>
            </div>
          </button>
        </div>

        <div class="layout-footer">
          <button class="reset-btn mono" (click)="resetLayout()">DISEÑO ORIGINAL</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-selector-container {
      position: fixed;
      bottom: 115px; /* Positioned above the theme selector */
      left: 40px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }

    /* Floating Button */
    .floating-layout-btn {
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

    .floating-layout-btn:hover {
      transform: scale(1.1);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
    }

    .floating-layout-btn.active {
      transform: scale(1.05);
      background-color: var(--primary);
      color: var(--bg-color);
      border-color: var(--primary);
    }

    .floating-layout-btn .tooltip {
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

    .floating-layout-btn:hover .tooltip {
      opacity: 1;
    }

    /* Dropdown */
    .layout-dropdown {
      position: absolute;
      bottom: 0;
      left: 75px; /* Open to the right side of the buttons */
      width: 320px;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      transform: translateX(-15px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      transform-origin: bottom left;
    }

    .layout-dropdown.open {
      transform: translateX(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .layout-header {
      margin-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.8rem;
    }

    .layout-header .title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .layout-header .subtitle {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    .layout-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-height: 350px;
      overflow-y: auto;
    }

    .layout-option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      color: var(--text-main);
      width: 100%;
    }

    .layout-option-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .layout-option-btn.active {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--primary);
    }

    .layout-icon-preview {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--primary);
      flex-shrink: 0;
    }

    .layout-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .layout-name {
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .layout-desc {
      font-size: 0.65rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .layout-footer {
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
      background: var(--primary);
      color: var(--bg-color);
      border-color: var(--primary);
    }

    @media (max-width: 768px) {
      .layout-selector-container {
        bottom: 80px;
        left: 20px;
      }
      .floating-layout-btn {
        width: 50px;
        height: 50px;
      }
      .floating-layout-btn .tooltip {
        display: none;
      }
      .layout-dropdown {
        left: 60px;
        width: 260px;
        padding: 1rem;
      }
    }
  `]
})
export class LayoutSelectorComponent implements OnInit {
  isOpen = false;
  currentLayoutId = 'classic';

  readonly layouts: AppLayout[] = [
    {
      id: 'classic',
      name: 'Triptico Simétrico',
      description: 'Texto izquierda, botón servicios centro, blueprint derecha',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" />
          <line x1="3" y1="12" x2="9" y2="12" stroke="currentColor" />
          <line x1="3" y1="18" x2="9" y2="18" stroke="currentColor" />
          <rect x="11" y="9" width="2" height="6" rx="0.5" stroke="currentColor" />
          <rect x="15" y="6" width="6" height="12" rx="1" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'split',
      name: 'Dividido Moderno',
      description: 'Texto y CTA izquierda, gran blueprint derecha, servicios abajo',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="8" height="11" rx="1" stroke="currentColor" />
          <rect x="13" y="4" width="8" height="11" rx="1" stroke="currentColor" />
          <rect x="3" y="17" width="18" height="3" rx="0.5" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'centered',
      name: 'Mínimal Centrado',
      description: 'Todo centrado verticalmente con el blueprint debajo',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="6" y1="5" x2="18" y2="5" stroke="currentColor" />
          <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" />
          <rect x="10" y="12" width="4" height="2" rx="0.5" stroke="currentColor" />
          <rect x="5" y="16" width="14" height="4" rx="1" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'reverse',
      name: 'Ingeniería Inversa',
      description: 'Blueprint a la izquierda y el texto a la derecha',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="6" width="6" height="12" rx="1" stroke="currentColor" />
          <rect x="11" y="9" width="2" height="6" rx="0.5" stroke="currentColor" />
          <line x1="15" y1="6" x2="21" y2="6" stroke="currentColor" />
          <line x1="15" y1="12" x2="21" y2="12" stroke="currentColor" />
          <line x1="15" y1="18" x2="21" y2="18" stroke="currentColor" />
        </svg>
      `
    }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const savedLayout = localStorage.getItem('app-layout-theme');
    if (savedLayout) {
      this.applyLayout(savedLayout);
    } else {
      this.applyLayout('classic');
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

  selectLayout(layoutId: string) {
    this.applyLayout(layoutId);
    localStorage.setItem('app-layout-theme', layoutId);
  }

  resetLayout() {
    this.applyLayout('classic');
    localStorage.removeItem('app-layout-theme');
  }

  private applyLayout(layoutId: string) {
    this.currentLayoutId = layoutId;
    const root = document.documentElement;
    root.setAttribute('data-layout', layoutId);
  }
}
