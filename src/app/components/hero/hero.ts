import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section id="hero" class="hero-section" [class.dropdown-open]="showServices">
      
      <div class="container hero-grid">
        <div class="hero-text animate-up">

          <h1><span>Asesoría Experta</span> para Activos Inmobiliarios</h1>
          <p>Te acompañamos en cada etapa: legal, técnica y comercial. Una ingeniería de confianza diseñada para proteger tu patrimonio y maximizar tu inversión en todo el proceso.</p>
          
          <div class="hero-actions">
            <button class="btn btn-primary" (click)="ctaClick.emit()">Consultoría Gratis</button>
          </div>
        </div>

        <div class="services-center animate-up delay-1">
          <div class="services-container">
            <button class="btn btn-square btn-outline services-toggle" (click)="toggleServices()">
              <div class="btn-content">
                <span class="mono mono-arrows">>></span>
                <span class="btn-label">SERVICIOS<br>QUE OFRECEMOS</span>
                <span class="arrow" [class.open]="showServices">▾</span>
              </div>
            </button>

            <!-- Interactive Custom Services Accordion -->
            <div class="services-dropdown" *ngIf="showServices">
              <div class="custom-services-layout">
                <!-- Category Select Buttons (Gradient from Black to White) -->
                <div class="custom-cat-row">
                  <button *ngFor="let cat of serviceCategories; let idx = index" 
                          class="custom-cat-btn mono" 
                          [class.active]="activeCategoryIndex === idx"
                          (click)="selectCategory(idx, $event)"
                          [style.background-color]="getCatBg(idx)"
                          [style.border-color]="getCatBorder(idx)"
                          [style.color]="getCatColor(idx)">
                    <span class="num">0{{ idx + 1 }}</span>
                    <span class="lbl">{{ cat.shortTitle }}</span>
                  </button>
                </div>

                <!-- List of Services inside the active category -->
                <div class="custom-services-list" *ngIf="activeCategoryIndex !== null">
                  <div class="custom-service-item" *ngFor="let opt of serviceCategories[activeCategoryIndex].options; let sIdx = index">
                    <button class="custom-service-header" (click)="toggleServiceDetail(sIdx, $event)" [class.expanded]="activeServiceIndex === sIdx">
                      <span class="bullet">//</span> {{ opt.label }}
                      <span class="chevron">{{ activeServiceIndex === sIdx ? '−' : '+' }}</span>
                    </button>
                    <div class="custom-service-body animate-slide-down" *ngIf="activeServiceIndex === sIdx">
                      <p class="service-desc-text">{{ opt.desc }}</p>
                      <a [routerLink]="opt.link" class="service-details-btn mono" (click)="showServices = false">
                        Ver Detalles del Servicio →
                      </a>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

        <div class="hero-visual animate-up delay-2">
          <div class="blueprint-frame">
            <img src="/images/hero.png" alt="Luxury Asset">
            <div class="scan-line"></div>
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      padding-top: 100px;
      padding-bottom: 100px;
      overflow: visible;
    }
    .hero-section.dropdown-open {
      padding-bottom: 500px;
    }
    
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 200px 1fr;
      gap: 2rem;
      align-items: center;
      width: 100%;
    }

    h1 {
      font-size: 3.5rem;
      line-height: 1;
      margin-bottom: 2rem;
      font-weight: 800;
    }
    h1 span {
      display: block;
      color: transparent;
      -webkit-text-stroke: 1px var(--primary);
    }
    p {
      font-size: 1.25rem;
      color: var(--text-muted);
      margin-bottom: 3rem;
      max-width: 600px;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-top: 2rem;
    }
    .hero-actions .btn-primary {
      padding: 1.2rem 4rem;
      width: 100%;
      max-width: 400px;
      font-weight: 800;
      font-size: 1.1rem;
      position: relative;
      text-align: left;
    }
    .hero-actions .btn-primary::after {
      content: ' →';
      position: absolute;
      right: 2rem;
      transition: right 0.2s;
    }
    .hero-actions .btn-primary:hover::after {
      right: 1.5rem;
    }

    /* Services Dropdown Toggle Button */
    .services-center {
      position: relative;
      display: flex;
      justify-content: center;
      z-index: 110;
    }
    .services-container {
      position: relative;
    }
    .btn-square {
      width: 200px;
      height: 200px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: rgba(251, 191, 36, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(251, 191, 36, 0.3);
      cursor: pointer;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.05);
    }
    .btn-square::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        transparent 150deg,
        var(--primary) 180deg,
        transparent 210deg,
        transparent 360deg
      );
      animation: rotate-border 4s linear infinite;
      opacity: 0.5;
      z-index: -1;
    }
    .btn-square::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: #000;
      z-index: -1;
    }
    .btn-square:hover {
      transform: scale(1.05) translateY(-5px);
      border-color: var(--primary);
      box-shadow: 0 15px 40px rgba(251, 191, 36, 0.2);
      background: rgba(251, 191, 36, 0.08);
    }
    .btn-square:hover .btn-label {
      letter-spacing: 1px;
    }
    .btn-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      z-index: 1;
    }
    .btn-label {
      font-size: 0.9rem;
      font-weight: 800;
      line-height: 1.2;
      color: var(--primary);
      transition: all 0.3s ease;
      text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
    }
    .mono-arrows {
      color: var(--primary);
      animation: blink 2s infinite;
      font-weight: bold;
    }
    .services-toggle .arrow {
      font-size: 1.5rem;
      color: var(--primary);
      transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .services-toggle .arrow.open {
      transform: rotate(180deg) scale(1.2);
    }
    
    @keyframes rotate-border {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; transform: translateX(0); }
      50% { opacity: 0.5; transform: translateX(5px); }
    }

    /* Main Services Dropdown Window */
    .services-dropdown {
      position: absolute;
      top: calc(100% + 40px);
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 1000;
      padding: 4rem;
      box-shadow: 0 50px 120px rgba(0,0,0,0.9);
      display: block !important;
      animation: dropdown-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes dropdown-fade-in {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    /* 0. Classic Grid style */
    .dropdown-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3rem;
    }
    .service-category {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .cat-header {
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--primary);
      text-transform: uppercase;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .cat-header::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 30px;
      height: 1px;
      background: var(--primary);
    }
    /* Custom Services Layout styles */
    .custom-services-layout {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .custom-cat-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      width: 100%;
    }
    .custom-cat-btn {
      flex: 1;
      min-width: 160px;
      height: 80px;
      padding: 1rem;
      border: 1px solid;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .custom-cat-btn.active {
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.25);
      border-color: #fff !important;
      transform: translateY(-3px);
    }
    .custom-cat-btn .num {
      font-size: 0.65rem;
      opacity: 0.6;
      margin-bottom: 4px;
    }
    .custom-cat-btn .lbl {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .custom-services-list {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
      text-align: left;
    }
    .custom-service-item {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 1rem;
    }
    .custom-service-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .custom-service-header {
      width: 100%;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      font-family: inherit;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 10px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      transition: color 0.2s;
    }
    .custom-service-header:hover,
    .custom-service-header.expanded {
      color: var(--primary);
    }
    .custom-service-header .bullet {
      color: var(--primary);
      margin-right: 8px;
      opacity: 0.6;
    }
    .custom-service-header .chevron {
      font-size: 1.2rem;
      font-family: monospace;
      color: rgba(255, 255, 255, 0.4);
    }
    .custom-service-body {
      padding: 8px 0 8px 24px;
    }
    .service-desc-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.65);
      margin: 0 0 12px 0;
    }
    .service-details-btn {
      font-size: 0.8rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 800;
      display: inline-block;
      transition: transform 0.2s;
    }
    .service-details-btn:hover {
      transform: translateX(4px);
    }
    .animate-slide-down {
      animation: slideDown 0.25s ease-out;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Blueprint Visual Decoration */
    .blueprint-frame {
      position: relative;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
    }
    .blueprint-frame img {
      width: 100%;
      height: auto;
      filter: var(--img-filter, grayscale(1) contrast(1.2));
      opacity: var(--img-opacity, 0.8);
      transition: all 0.5s ease;
    }
    .scan-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      box-shadow: 0 0 15px var(--primary);
      animation: scan 4s linear infinite;
    }
    @keyframes scan {
      0% { top: 0; }
      100% { top: 100%; }
    }
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid var(--primary);
    }
    .tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
    .tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
    .bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
    .br { bottom: -2px; right: -2px; border-left: none; border-top: none; }

    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; gap: 3rem; text-align: center; }
      .services-center { order: 2; margin: 2rem 0; }
      .hero-visual { order: 3; max-width: 500px; margin: 0 auto; }
      .hero-text { order: 1; }
      h1 { font-size: 3rem; }
      .label-wrapper { justify-content: center; }
      .hero-actions { flex-direction: column; justify-content: center; }
      
      .services-dropdown { 
        width: 90vw; 
        margin-top: 150px; 
        padding: 2rem 1.5rem; 
      }
      
      .dropdown-grid,
      .bento-services-layout,
      .console-output-grid { 
        grid-template-columns: 1fr !important; 
        gap: 2rem; 
      }
      
      .split-services-layout {
        flex-direction: column !important;
        height: auto !important;
      }
      
      .split-service-panel {
        width: 100% !important;
        flex: none !important;
      }
      
      .split-service-panel .panel-collapsed-view {
        display: none !important;
      }
      
      .split-service-panel .panel-expanded-view {
        display: flex !important;
        opacity: 1 !important;
      }
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  @Output() ctaClick = new EventEmitter<void>();
  showServices = false;
  activeCategoryIndex: number | null = null;
  activeServiceIndex: number | null = null;
  private observer: MutationObserver | null = null;

  serviceCategories = [
    {
      title: 'Quiero Vender — 2% & 2%',
      shortTitle: 'Vender',
      options: [
        { 
          label: 'Venta Tradicional', 
          link: '/servicios/venta-tradicional',
          desc: 'Corretaje premium de propiedades residenciales con comisión transparente de 2% para vendedor y 2% para comprador.'
        },
        { 
          label: 'Con Herencia Pendiente', 
          link: '/servicios/sucesiones',
          desc: 'Regularizamos herencias y posesiones efectivas pendientes de forma paralela a la comercialización del inmueble.'
        },
        { 
          label: 'Propiedad Comercial', 
          link: '/servicios/propiedad-comercial',
          desc: 'Venta de locales, bodegas, oficinas y terrenos comerciales con foco en rentabilidad y clientes corporativos.'
        }
      ]
    },
    {
      title: 'Quiero Arrendar — 50%',
      shortTitle: 'Arrendar',
      options: [
        { 
          label: 'Arriendo Residencial', 
          link: '/servicios/arriendo-residencial',
          desc: 'Evaluación de perfil comercial de arrendatarios, codeudores solidarios, redacción de contratos y entrega del inmueble.'
        },
        { 
          label: 'Arriendo Comercial', 
          link: '/servicios/arriendo-comercial',
          desc: 'Colocación estratégica de oficinas, locales comerciales y retail optimizando los contratos a largo plazo.'
        },
        { 
          label: 'Mediación', 
          link: '/servicios/mediacion',
          desc: 'Arbitraje y resolución de conflictos entre propietarios y arrendatarios para regularizar situaciones complejas.'
        }
      ]
    },
    {
      title: 'Administración de Bienes — 10%',
      shortTitle: 'Admin',
      options: [
        { 
          label: 'Herencias y Posesiones Efectivas', 
          link: '/servicios/herencias-posesiones',
          desc: 'Gestión legal, posesión efectiva testada o intestada para habilitar legalmente la transferencia de bienes raíces.'
        },
        { 
          label: 'Renta Corta', 
          link: '/servicios/renta-corta',
          desc: 'Optimización de arriendos temporales tipo Airbnb, incluyendo limpieza, check-in/out, precios dinámicos y mantención.'
        },
        { 
          label: 'Proyecto Cultural y Comercial', 
          link: '/servicios/proyecto-cultural-comercial',
          desc: 'Asesoría para reconvertir casonas o espacios históricos a fines comerciales, gastronómicos o centros culturales.'
        }
      ]
    },
    {
      title: 'Soy Inversionista',
      shortTitle: 'Invertir',
      options: [
        { 
          label: 'Remates y Oportunidades', 
          link: '/servicios/remates',
          desc: 'Búsqueda activa de propiedades con valores bajo mercado, asesoría en remates judiciales y saneamiento legal.'
        },
        { 
          label: 'Multifamily / Departamentos', 
          link: '/servicios/multifamily',
          desc: 'Evaluación y estructuración de carteras de departamentos residenciales para fondos o inversionistas privados.'
        }
      ]
    }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.observer = new MutationObserver(() => {
        // Observers can be kept for dynamic updates
      });
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleServices() {
    this.showServices = !this.showServices;
    if (this.showServices) {
      this.activeCategoryIndex = 0; // Default to first category
      this.activeServiceIndex = null;
      setTimeout(() => {
        const dropdown = document.querySelector('.services-dropdown');
        if (dropdown) {
          const yOffset = -150;
          const y = dropdown.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    } else {
      this.activeCategoryIndex = null;
      this.activeServiceIndex = null;
    }
  }

  selectCategory(idx: number, event: Event) {
    event.stopPropagation();
    this.activeCategoryIndex = idx;
    this.activeServiceIndex = null;
  }

  toggleServiceDetail(sIdx: number, event: Event) {
    event.stopPropagation();
    this.activeServiceIndex = this.activeServiceIndex === sIdx ? null : sIdx;
  }

  getCatBg(idx: number): string {
    // Gradient from black/dark gray to whiter
    // idx: 0 -> #121212
    // idx: 1 -> #2d2d2d
    // idx: 2 -> #555555
    // idx: 3 -> #9c9c9c
    const bgs = ['#121212', '#2a2a2a', '#555555', '#999999'];
    return bgs[idx] || '#121212';
  }

  getCatBorder(idx: number): string {
    const borders = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)', 'rgba(0,0,0,0.15)'];
    return borders[idx] || 'rgba(255,255,255,0.1)';
  }

  getCatColor(idx: number): string {
    // If bg is light (last one), text should be black
    return idx === 3 ? '#000000' : '#ffffff';
  }
}
