import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceStyle {
  id: string;
  name: string;
  description: string;
  iconSvg: string;
}

@Component({
  selector: 'app-service-style-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="service-style-selector-container">
      <!-- Floating Button -->
      <button 
        class="floating-style-btn" 
        (click)="toggleMenu($event)" 
        [class.active]="isOpen"
        title="Cambiar Diseño de Servicios"
        aria-label="Seleccionar Diseño de Servicios"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span class="tooltip">Servicios</span>
      </button>

      <!-- Dropdown Menu -->
      <div class="style-dropdown" [class.open]="isOpen" (click)="$event.stopPropagation()">
        <div class="style-header">
          <span class="mono title">Estilo de Servicios</span>
          <span class="mono subtitle">Elige cómo se ven los servicios</span>
        </div>
        
        <div class="style-list">
          <button 
            *ngFor="let style of styles" 
            class="style-option-btn" 
            [class.active]="currentStyleId === style.id"
            (click)="selectStyle(style.id)"
            [title]="style.description"
          >
            <div class="style-icon-preview" [innerHTML]="style.iconSvg"></div>
            <div class="style-details">
              <span class="style-name mono">{{ style.name }}</span>
              <span class="style-desc">{{ style.description }}</span>
            </div>
          </button>
        </div>

        <div class="style-footer">
          <button class="reset-btn mono" (click)="resetStyle()">ESTILO ORIGINAL</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .service-style-selector-container {
      position: fixed;
      bottom: 115px; /* Positioned directly above the theme selector */
      left: 40px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }

    /* Floating Button */
    .floating-style-btn {
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

    .floating-style-btn:hover {
      transform: scale(1.1);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
    }

    .floating-style-btn.active {
      transform: scale(1.05);
      background-color: var(--primary);
      color: var(--bg-color);
      border-color: var(--primary);
    }

    .floating-style-btn .tooltip {
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

    .floating-style-btn:hover .tooltip {
      opacity: 1;
    }

    /* Dropdown */
    .style-dropdown {
      position: absolute;
      bottom: 0;
      left: 75px;
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

    .style-dropdown.open {
      transform: translateX(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .style-header {
      margin-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.8rem;
    }

    .style-header .title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .style-header .subtitle {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    .style-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-height: 350px;
      overflow-y: auto;
    }

    .style-option-btn {
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

    .style-option-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .style-option-btn.active {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--primary);
    }

    .style-icon-preview {
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

    .style-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .style-name {
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .style-desc {
      font-size: 0.65rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .style-footer {
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
      .service-style-selector-container {
        bottom: 80px;
        left: 20px;
      }
      .floating-style-btn {
        width: 50px;
        height: 50px;
      }
      .floating-style-btn .tooltip {
        display: none;
      }
      .style-dropdown {
        left: 60px;
        width: 260px;
        padding: 1rem;
      }
    }
  `]
})
export class ServiceStyleSelectorComponent implements OnInit {
  isOpen = false;
  currentStyleId = 'classic';

  readonly styles: ServiceStyle[] = [
    {
      id: 'classic',
      name: 'Grilla Clásica',
      description: 'Listado limpio en cuatro columnas ordenadas',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" />
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" />
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" />
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'bento',
      name: 'Bento Grid',
      description: 'Tarjetas asimétricas con brillo hover y badges técnicos',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="6" height="6" rx="0.5" stroke="currentColor" />
          <rect x="11" y="3" width="10" height="6" rx="0.5" stroke="currentColor" />
          <rect x="3" y="11" width="10" height="10" rx="0.5" stroke="currentColor" />
          <rect x="15" y="11" width="6" height="10" rx="0.5" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'split',
      name: 'Pestañas Acordeón',
      description: 'Paneles que se expanden elegantemente con hover',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="4" height="18" stroke="currentColor" />
          <rect x="9" y="3" width="6" height="18" stroke="currentColor" />
          <rect x="17" y="3" width="4" height="18" stroke="currentColor" />
        </svg>
      `
    },
    {
      id: 'console',
      name: 'Consola Retro',
      description: 'Líneas de código cyberpunk con aspecto de terminal',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5" stroke="currentColor" />
          <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" />
        </svg>
      `
    }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const savedStyle = localStorage.getItem('app-service-style');
    if (savedStyle) {
      this.applyStyle(savedStyle);
    } else {
      this.applyStyle('classic');
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

  selectStyle(styleId: string) {
    this.applyStyle(styleId);
    localStorage.setItem('app-service-style', styleId);
  }

  resetStyle() {
    this.applyStyle('classic');
    localStorage.removeItem('app-service-style');
  }

  private applyStyle(styleId: string) {
    this.currentStyleId = styleId;
    const root = document.documentElement;
    root.setAttribute('data-service-style', styleId);
  }
}
