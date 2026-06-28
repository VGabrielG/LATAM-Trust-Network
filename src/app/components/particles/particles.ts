import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-particles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Canvas pegado al body como fondo global -->
    <canvas #particlesCanvas></canvas>

    <!-- Botón flotante para abrir panel -->
    <button class="particles-fab" (click)="toggleControls()" [class.active]="showControls">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"></path>
      </svg>
      <span>Fondo</span>
    </button>

    <!-- Panel de controles -->
    <div class="particles-panel" [class.open]="showControls">
      <div class="panel-header">
        <span class="panel-title mono">⚙ Fondo e Interacción</span>
        <button class="panel-close" (click)="toggleControls()">✕</button>
      </div>

      <div class="panel-body">
        <!-- Fondo Switcher -->
        <div class="ctrl-row">
          <label class="ctrl-label mono">Estilo de Fondo</label>
        </div>
        <div class="bg-mode-selector">
          <button class="bg-mode-btn" [class.active]="bgService.mode() === 'map'" (click)="bgService.setMode('map')">
            Fondo 1 (Red 3D)
          </button>
          <button class="bg-mode-btn" [class.active]="bgService.mode() === 'particles'" (click)="bgService.setMode('particles')">
            Fondo 2 (Glow)
          </button>
        </div>
        <!-- Background Gradients Presets -->
        <div class="ctrl-row">
          <label class="ctrl-label mono">Gradiantes de Fondo</label>
        </div>
        <div class="bg-palette-grid">
          <button *ngFor="let bg of bgColors" 
                  class="bg-btn" 
                  [class.selected]="config.bgColorStart === bg.value" 
                  (click)="setBgColor(bg)" 
                  [title]="bg.name"
                  [style.background]="'linear-gradient(135deg, ' + bg.value + ', ' + bg.valueEnd + ')'">
          </button>
        </div>

        <!-- Particle Color Palette (Single Color) -->
        <div class="ctrl-row top-margin">
          <label class="ctrl-label mono">Color de Partículas</label>
        </div>
        <div class="particle-colors-grid">
          <button *ngFor="let c of particleColors" 
                  class="particle-color-btn" 
                  [class.selected]="config.particleColor === c.value" 
                  (click)="setParticleColor(c.value)" 
                  [title]="c.name"
                  [style.background-color]="c.value">
          </button>
        </div>

        <div class="ctrl-row top-margin">
          <label class="ctrl-label mono">Opacidad Partículas</label>
          <span class="ctrl-val mono">{{ config.opacity }}</span>
        </div>
        <input type="range" min="0.02" max="1" step="0.02" [(ngModel)]="config.opacity" (ngModelChange)="saveConfig()" class="slider">

        <div class="ctrl-row">
          <label class="ctrl-label mono">Cant. Partículas</label>
          <span class="ctrl-val mono">{{ config.numParticles }}</span>
        </div>
        <input type="range" min="20" max="200" step="10" [(ngModel)]="config.numParticles" (ngModelChange)="reinitParticles()" class="slider">

        <div class="ctrl-row">
          <label class="ctrl-label mono">Conexión</label>
          <span class="ctrl-val mono">{{ config.connectionDist }}px</span>
        </div>
        <input type="range" min="30" max="300" step="10" [(ngModel)]="config.connectionDist" (ngModelChange)="saveConfig()" class="slider">

        <div class="ctrl-row">
          <label class="ctrl-label mono">Radio cursor</label>
          <span class="ctrl-val mono">{{ config.mouseRadius }}px</span>
        </div>
        <input type="range" min="50" max="350" step="10" [(ngModel)]="config.mouseRadius" (ngModelChange)="saveConfig()" class="slider">

        <div class="ctrl-row">
          <label class="ctrl-label mono">Velocidad</label>
          <span class="ctrl-val mono">{{ config.speed }}x</span>
        </div>
        <input type="range" min="0.1" max="3" step="0.1" [(ngModel)]="config.speed" (ngModelChange)="saveConfig()" class="slider">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
    }

    /* FAB button */
    .particles-fab {
      position: fixed;
      bottom: 100px;
      left: 24px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 50px;
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .particles-fab:hover,
    .particles-fab.active {
      background: rgba(255,255,255,0.22);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.4);
    }

    /* Panel */
    .particles-panel {
      position: fixed;
      bottom: 155px;
      left: 24px;
      z-index: 9999;
      width: 285px;
      background: rgba(8,8,12,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      overflow: hidden;
      transform: translateY(12px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    }

    .particles-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .panel-title {
      font-size: 0.72rem;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.8);
    }

    .panel-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      font-size: 1rem;
      padding: 0 4px;
      line-height: 1;
      transition: color 0.2s;
    }
    .panel-close:hover { color: #fff; }

    .panel-body {
      padding: 16px 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 72vh;
      overflow-y: auto;
    }

    .ctrl-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .ctrl-row.top-margin { margin-top: 12px; }

    .ctrl-label {
      font-size: 0.62rem;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
    }

    .ctrl-val {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.75);
    }

    .slider {
      width: 100%;
      margin-bottom: 10px;
      -webkit-appearance: none;
      appearance: none;
      height: 3px;
      border-radius: 2px;
      background: rgba(255,255,255,0.15);
      outline: none;
      cursor: pointer;
    }
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 8px rgba(255,255,255,0.5);
      cursor: pointer;
      transition: transform 0.2s;
    }
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.3);
    }

    /* Background palette grid */
    .bg-palette-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 6px;
    }
    .bg-btn {
      aspect-ratio: 1;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bg-btn:hover {
      transform: scale(1.1);
      border-color: #fff;
    }
    .bg-btn.selected {
      border-color: #fff;
      box-shadow: 0 0 12px rgba(255,255,255,0.45);
      transform: scale(1.05);
    }

    /* Particle colors grid */
    .particle-colors-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 6px;
    }
    .particle-color-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.25);
      cursor: pointer;
      transition: all 0.2s;
    }
    .particle-color-btn:hover {
      transform: scale(1.2);
      border-color: #fff;
    }
    .particle-color-btn.selected {
      border-color: #fff;
      box-shadow: 0 0 8px currentColor;
      transform: scale(1.15);
    }

    @media (max-width: 600px) {
      .particles-fab { bottom: 80px; left: 16px; }
      .particles-panel { bottom: 130px; left: 16px; width: 260px; }
    }

    .bg-mode-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      margin-top: 4px;
    }
    .bg-mode-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 0.65rem;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.25s;
    }
    .bg-mode-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .bg-mode-btn.active {
      background: rgba(255, 255, 255, 0.25);
      border-color: #fff;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
    }
  `]
})
export class ParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  bgService = inject(BackgroundService);
  showControls = false;

  config = {
    numParticles: 150,
    connectionDist: 300,
    mouseRadius: 340,
    opacity: 0.92,
    speed: 0.4,
    particleColor: '#c084fc',
    bgColorStart: '#070708',
    bgColorEnd: '#0d0d0f'
  };

  particleColors = [
    { name: 'Blanco Nevado', value: '#ffffff' },
    { name: 'Celeste Eléctrico', value: '#38bdf8' },
    { name: 'Verde Menta', value: '#4ade80' },
    { name: 'Rosa Pastel', value: '#f472b6' },
    { name: 'Oro Imperial', value: '#fbbf24' },
    { name: 'Lavanda Mágica', value: '#c084fc' }
  ];

  bgColors = [
    // Dark Elegant Gradients
    { 
      name: 'Negro Abisal', 
      value: '#050508', 
      valueEnd: '#111116',
      themeId: 'obsidian', 
      surface: '#0d0d0f', 
      primary: '#ffffff', 
      textColor: '#ffffff', 
      mutedColor: '#666666', 
      btnTextColor: '#000000' 
    },
    { 
      name: 'Gris Grafito', 
      value: '#121214', 
      valueEnd: '#222226',
      themeId: 'charcoal', 
      surface: '#27272a', 
      primary: '#f4f4f5', 
      textColor: '#ffffff', 
      mutedColor: '#a1a1aa', 
      btnTextColor: '#000000' 
    },
    { 
      name: 'Midnight Original', 
      value: '#080c14', 
      valueEnd: '#121b2d',
      themeId: 'navy', 
      surface: '#0f1624', 
      primary: '#94a3b8', 
      textColor: '#f8fafc', 
      mutedColor: '#64748b', 
      btnTextColor: '#080c14' 
    },
    { 
      name: 'Navy Eléctrico', 
      value: '#060b18', 
      valueEnd: '#112240',
      themeId: 'navy', 
      surface: '#0d1527', 
      primary: '#3b82f6', 
      textColor: '#f1f5f9', 
      mutedColor: '#60a5fa', 
      btnTextColor: '#060b18' 
    },
    { 
      name: 'Acero Medianoche', 
      value: '#0f172a', 
      valueEnd: '#1e293b',
      themeId: 'navy', 
      surface: '#1b2537', 
      primary: '#cbd5e1', 
      textColor: '#f8fafc', 
      mutedColor: '#94a3b8', 
      btnTextColor: '#0f172a' 
    },
    { 
      name: 'Índigo Profundo', 
      value: '#0c0721', 
      valueEnd: '#1c123e',
      themeId: 'plum', 
      surface: '#201648', 
      primary: '#a78bfa', 
      textColor: '#faf5ff', 
      mutedColor: '#d8b4fe', 
      btnTextColor: '#0c0721' 
    },
    // Soft & Light Warm/Pastel Gradients
    { 
      name: 'Beige Lino', 
      value: '#f5f5f3', 
      valueEnd: '#dedcd6',
      themeId: 'beige', 
      surface: '#f3f1eb', 
      primary: '#6a5d4d', 
      textColor: '#2e2d2a', 
      mutedColor: '#7c7a75', 
      btnTextColor: '#ffffff' 
    },
    { 
      name: 'Menta Pálido', 
      value: '#f0fdf4', 
      valueEnd: '#dcfce7',
      themeId: 'beige', 
      surface: '#eafaf0', 
      primary: '#15803d', 
      textColor: '#142219', 
      mutedColor: '#4b6b55', 
      btnTextColor: '#ffffff' 
    },
    { 
      name: 'Rosa Pálido', 
      value: '#fff1f2', 
      valueEnd: '#ffe4e6',
      themeId: 'beige', 
      surface: '#fff0f2', 
      primary: '#be123c', 
      textColor: '#271015', 
      mutedColor: '#884855', 
      btnTextColor: '#ffffff' 
    },
    { 
      name: 'Azul Glaciar', 
      value: '#f0f9ff', 
      valueEnd: '#e0f2fe',
      themeId: 'beige', 
      surface: '#eaf6fe', 
      primary: '#0369a1', 
      textColor: '#0f1d2a', 
      mutedColor: '#4c6a85', 
      btnTextColor: '#ffffff' 
    },
    { 
      name: 'Naranja Arena', 
      value: '#fffaf0', 
      valueEnd: '#f5e8d3',
      themeId: 'beige', 
      surface: '#fcf3e3', 
      primary: '#b45309', 
      textColor: '#331b0c', 
      mutedColor: '#88624d', 
      btnTextColor: '#ffffff' 
    },
    { 
      name: 'Lavanda Pálida', 
      value: '#faf5ff', 
      valueEnd: '#eedffd',
      themeId: 'beige', 
      surface: '#f6efff', 
      primary: '#6b21a8', 
      textColor: '#1e0a30', 
      mutedColor: '#684d85', 
      btnTextColor: '#ffffff' 
    }
  ];

  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private mouse = { x: -9999, y: -9999 };
  private animationFrameId!: number;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.loadConfig();
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initParticles();
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  toggleControls() {
    this.showControls = !this.showControls;
    this.cdr.markForCheck();
  }

  setBgColor(bg: any) {
    this.config.bgColorStart = bg.value;
    this.config.bgColorEnd = bg.valueEnd;
    const root = document.documentElement;
    root.setAttribute('data-theme', bg.themeId);
    
    // Dynamically apply properties defined in the background gradient preset
    root.style.setProperty('--bg-color', bg.value);
    root.style.setProperty('--surface-color', bg.surface || '#0a0a0a');
    root.style.setProperty('--primary', bg.primary || '#ffffff');
    root.style.setProperty('--accent', bg.primary || '#ffffff');
    root.style.setProperty('--text-main', bg.textColor || '#ffffff');
    root.style.setProperty('--text-muted', bg.mutedColor || '#666666');
    root.style.setProperty('--btn-text-color', bg.btnTextColor || '#000000');
    
    this.saveConfig();
  }

  setParticleColor(color: string) {
    this.config.particleColor = color;
    this.reinitParticles();
  }

  reinitParticles() {
    this.initParticles();
    this.saveConfig();
  }

  saveConfig() {
    localStorage.setItem('app-particles-config-v2', JSON.stringify(this.config));
  }

  loadConfig() {
    const saved = localStorage.getItem('app-particles-config-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
        
        // Find matching background preset to apply dynamic properties on load
        const match = this.bgColors.find(b => b.value === this.config.bgColorStart);
        if (match) {
          this.setBgColor(match);
        }
      } catch (e) {
        console.error('Error loading config', e);
      }
    }
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.initParticles();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target) {
      // 1. Check if hovering over standard interactive elements or within specific layouts
      const isInteractive = target.closest('button, a, input, select, textarea, summary, label, [role="button"]');
      const isHeader = target.closest('.header, header');
      const isFooter = target.closest('.footer, footer, .basic-footer');
      const isPanel = target.closest('.particles-panel, .theme-toolbar, .modal-content, .contact-modal');
      
      if (isInteractive || isHeader || isFooter || isPanel) {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
        return;
      }
    }
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  @HostListener('window:mouseleave')
  onMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  initParticles() {
    const canvas = this.canvasRef.nativeElement;
    this.particles = [];
    for (let i = 0; i < this.config.numParticles; i++) {
      const speed = this.config.speed;
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * 3 + 1
      });
    }
  }

  private animate = () => {
    const canvas = this.canvasRef.nativeElement;

    if (this.bgService.mode() !== 'particles') {
      canvas.style.display = 'none';
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }
    canvas.style.display = 'block';

    // Paint background as linear gradient
    this.ctx.globalAlpha = 1;
    const grad = this.ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, this.config.bgColorStart || '#050508');
    grad.addColorStop(1, this.config.bgColorEnd || '#111116');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update & draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Apply speed scale dynamically
      const speedFactor = this.config.speed / 0.7;
      p.x += p.vx * speedFactor;
      p.y += p.vy * speedFactor;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse attraction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.config.mouseRadius && dist > 0) {
        p.x += (dx / dist) * 0.5;
        p.y += (dy / dist) * 0.5;
      }

      // Draw particle with single color
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor || '#ffffff';
      this.ctx.globalAlpha = this.config.opacity;
      this.ctx.fill();
    }

    // Draw connection lines (Plexus effect) with matching particleColor
    this.ctx.lineWidth = 0.7;
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.connectionDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          const alpha = (1 - dist / this.config.connectionDist) * this.config.opacity * 0.35;
          this.ctx.strokeStyle = this.config.particleColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1.0;
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
