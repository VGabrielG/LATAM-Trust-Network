import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PastelColor {
  id: string;
  name: string;
  rgb: string; // RGB values like "255, 179, 186"
}

@Component({
  selector: 'app-background-effects-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="effects-selector-container">
      <!-- Floating Button -->
      <button 
        class="floating-effects-btn" 
        (click)="toggleMenu($event)" 
        [class.active]="isOpen"
        title="Ajustar Cuadriculado y Partículas"
        aria-label="Ajustar Cuadriculado y Partículas"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span class="tooltip">Fondo FX</span>
      </button>

      <!-- Control Panel Dropdown -->
      <div class="effects-dropdown" [class.open]="isOpen" (click)="$event.stopPropagation()">
        <div class="effects-header">
          <span class="mono title">Fondo & Partículas</span>
          <span class="mono subtitle">Personaliza el cuadriculado y FX</span>
        </div>

        <div class="settings-list">
          <!-- 1. Grid Color Picker -->
          <div class="setting-item">
            <span class="setting-label mono">Color del Cuadriculado</span>
            <div class="color-presets-grid">
              <button 
                *ngFor="let color of colors" 
                class="preset-color-btn" 
                [class.active]="currentColorId === color.id"
                [style.background-color]="'rgb(' + color.rgb + ')'"
                (click)="selectColor(color)"
                [title]="color.name"
              >
              </button>
            </div>
          </div>

          <!-- 2. Grid Opacity Slider -->
          <div class="setting-item">
            <div class="slider-label-row">
              <span class="setting-label mono">Opacidad del Plano</span>
              <span class="slider-value mono">{{ (gridOpacity * 100) | number:'1.0-0' }}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              [(ngModel)]="gridOpacity" 
              (input)="updateGridOpacity()"
              class="range-slider"
            />
          </div>

          <!-- 3. Particles Toggle -->
          <div class="setting-item flex-row">
            <span class="setting-label mono">Efecto Partículas (Constelación)</span>
            <label class="switch-toggle">
              <input type="checkbox" [(ngModel)]="particlesEnabled" (change)="toggleParticles()" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- 4. Particle Speed Slider (Conditional) -->
          <div class="setting-item" *ngIf="particlesEnabled">
            <div class="slider-label-row">
              <span class="setting-label mono">Velocidad / Dinamismo</span>
              <span class="slider-value mono">{{ particleSpeed }}x</span>
            </div>
            <input 
              type="range" 
              min="0.2" 
              max="2.5" 
              step="0.1" 
              [(ngModel)]="particleSpeed" 
              (input)="updateParticleSpeed()"
              class="range-slider"
            />
          </div>
        </div>

        <div class="effects-footer">
          <button class="reset-btn mono" (click)="resetSettings()">EFECTOS ORIGINALES</button>
        </div>
      </div>
    </div>

    <!-- Background Canvas for Particles -->
    <canvas id="effects-particles-canvas" [class.visible]="particlesEnabled"></canvas>
  `,
  styles: [`
    .effects-selector-container {
      position: fixed;
      bottom: 190px; /* Positioned above the service style selector */
      left: 40px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }

    /* Floating Button */
    .floating-effects-btn {
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

    .floating-effects-btn:hover {
      transform: scale(1.1);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
    }

    .floating-effects-btn.active {
      transform: scale(1.05);
      background-color: var(--primary);
      color: var(--bg-color);
      border-color: var(--primary);
    }

    .floating-effects-btn .tooltip {
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

    .floating-effects-btn:hover .tooltip {
      opacity: 1;
    }

    /* Dropdown */
    .effects-dropdown {
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

    .effects-dropdown.open {
      transform: translateX(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .effects-header {
      margin-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.8rem;
    }

    .effects-header .title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .effects-header .subtitle {
      display: block;
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .setting-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting-item.flex-row {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .setting-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    /* Color Presets Grid */
    .color-presets-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-top: 4px;
    }

    .preset-color-btn {
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.2s;
    }

    .preset-color-btn:hover {
      transform: scale(1.15);
      border-color: #fff;
    }

    .preset-color-btn.active {
      transform: scale(1.1);
      border-color: #fff;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    /* Slider styling */
    .slider-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .slider-value {
      font-size: 0.65rem;
      color: var(--primary);
    }

    .range-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      outline: none;
    }

    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--primary);
      cursor: pointer;
      transition: transform 0.1s;
    }

    .range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    /* Toggle Switch styling */
    .switch-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
    }

    .switch-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.1);
      transition: .4s;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .switch-slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: var(--text-muted);
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .switch-slider {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: var(--primary);
    }

    input:checked + .switch-slider:before {
      transform: translateX(22px);
      background-color: var(--primary);
    }

    /* Reset Button */
    .effects-footer {
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

    /* Fixed Canvas styles */
    #effects-particles-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.8s ease;
    }

    #effects-particles-canvas.visible {
      opacity: 0.75;
    }

    @media (max-width: 768px) {
      .effects-selector-container {
        bottom: 140px; /* Shifted on mobile */
        left: 20px;
      }
      .floating-effects-btn {
        width: 50px;
        height: 50px;
      }
      .floating-effects-btn .tooltip {
        display: none;
      }
      .effects-dropdown {
        left: 60px;
        width: 260px;
        padding: 1rem;
      }
    }
  `]
})
export class BackgroundEffectsSelectorComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentColorId = 'white';
  gridOpacity = 0.05;
  particlesEnabled = false;
  particleSpeed = 1.0;

  // Custom Pastel Preset Colors
  readonly colors: PastelColor[] = [
    { id: 'white', name: 'Original', rgb: '255, 255, 255' },
    { id: 'blue', name: 'Azul Pastel', rgb: '173, 216, 230' },
    { id: 'rose', name: 'Rosa Pastel', rgb: '255, 209, 220' },
    { id: 'green', name: 'Menta Pastel', rgb: '178, 252, 219' },
    { id: 'yellow', name: 'Crema Pastel', rgb: '255, 253, 208' },
    { id: 'lavender', name: 'Lavanda', rgb: '230, 230, 250' }
  ];

  // Particle System Canvas Fields
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private particles: Array<any> = [];
  private activeColorRgb = '255, 255, 255';

  constructor() {}

  ngOnInit() {
    this.loadSettings();
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  ngOnDestroy() {
    this.stopAnimation();
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && !target.closest('.effects-selector-container')) {
      this.isOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      if (this.particlesEnabled) {
        this.createParticles();
      }
    }
  }

  // Value Selectors & CSS bindings
  selectColor(color: PastelColor) {
    this.currentColorId = color.id;
    this.activeColorRgb = color.rgb;
    document.documentElement.style.setProperty('--blueprint-line-color', color.rgb);
    this.saveSettings();
  }

  updateGridOpacity() {
    document.documentElement.style.setProperty('--blueprint-line-opacity', this.gridOpacity.toString());
    this.saveSettings();
  }

  toggleParticles() {
    this.saveSettings();
    if (this.particlesEnabled) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  updateParticleSpeed() {
    this.saveSettings();
  }

  resetSettings() {
    this.gridOpacity = 0.05;
    this.currentColorId = 'white';
    this.activeColorRgb = '255, 255, 255';
    this.particlesEnabled = false;
    this.particleSpeed = 1.0;

    document.documentElement.style.setProperty('--blueprint-line-color', '255, 255, 255');
    document.documentElement.style.setProperty('--blueprint-line-opacity', '0.05');

    this.stopAnimation();
    this.saveSettings();
  }

  // Local Storage Management
  private saveSettings() {
    const settings = {
      colorId: this.currentColorId,
      rgb: this.activeColorRgb,
      opacity: this.gridOpacity,
      particles: this.particlesEnabled,
      speed: this.particleSpeed
    };
    localStorage.setItem('app-effects-settings', JSON.stringify(settings));
  }

  private loadSettings() {
    const saved = localStorage.getItem('app-effects-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.currentColorId = settings.colorId ?? 'white';
        this.activeColorRgb = settings.rgb ?? '255, 255, 255';
        this.gridOpacity = settings.opacity ?? 0.05;
        this.particlesEnabled = settings.particles ?? false;
        this.particleSpeed = settings.speed ?? 1.0;

        document.documentElement.style.setProperty('--blueprint-line-color', this.activeColorRgb);
        document.documentElement.style.setProperty('--blueprint-line-opacity', this.gridOpacity.toString());
      } catch (e) {
        console.error('Failed to parse effects settings', e);
      }
    }
  }

  // Custom Canvas Particle Engine
  private initCanvas() {
    this.canvas = document.getElementById('effects-particles-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d');
      if (this.particlesEnabled) {
        this.startAnimation();
      }
    }
  }

  private startAnimation() {
    this.stopAnimation();
    if (!this.canvas) this.initCanvas();
    this.createParticles();
    this.animate();
  }

  private stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private createParticles() {
    if (!this.canvas) return;
    this.particles = [];
    const count = Math.min(60, Math.floor((this.canvas.width * this.canvas.height) / 25000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  private animate = () => {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Update and Draw Particles
    this.particles.forEach((p) => {
      p.x += p.vx * this.particleSpeed;
      p.y += p.vy * this.particleSpeed;

      // Wrap around edges
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      this.ctx!.beginPath();
      this.ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx!.fillStyle = `rgba(${this.activeColorRgb}, ${p.alpha})`;
      this.ctx!.fill();
    });

    // 2. Draw Connections (Constellation Lines)
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${this.activeColorRgb}, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
