import { Component, Output, EventEmitter } from '@angular/core';
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

            <div class="services-dropdown" *ngIf="showServices">
              <div class="dropdown-grid">
                <div class="service-category" *ngFor="let cat of serviceCategories">
                  <div class="cat-header mono">{{ cat.title }}</div>
                  <ul class="cat-list">
                    <li *ngFor="let opt of cat.options">
                      <a [routerLink]="opt.link" class="service-link" (click)="showServices = false">
                        <span class="bullet">//</span> {{ opt.label }}
                      </a>
                    </li>
                  </ul>
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
      padding-bottom: 100px; /* Base padding */
      overflow: visible;
    }
    .hero-section.dropdown-open {
      padding-bottom: 500px; /* Extra space for dropdown */
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

    /* Services Dropdown - Centered & Square */
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
    .services-dropdown {
      position: absolute;
      top: calc(100% + 40px);
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(251, 191, 36, 0.2);
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
      border-bottom: 1px solid rgba(251, 191, 36, 0.1);
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
    .cat-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .cat-list li {
      position: relative;
    }
    .service-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.8rem 1rem;
      border-radius: 4px;
      margin-left: -1rem;
    }
    .service-link:hover {
      color: #fff;
      background: rgba(251, 191, 36, 0.05);
      padding-left: 1.5rem;
    }
    .service-link .bullet {
      color: var(--primary);
      font-weight: 900;
      opacity: 0.5;
      transition: all 0.3s ease;
      font-size: 0.8rem;
      margin-top: 2px;
    }
    .service-link:hover .bullet {
      opacity: 1;
      transform: translateX(3px);
    }

    /* Blueprint Visual */
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
      .services-dropdown { width: 90vw; margin-top: 150px; }
      .dropdown-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
  `]
})
export class HeroComponent {
  @Output() ctaClick = new EventEmitter<void>();
  showServices = false;

  serviceCategories = [
    {
      title: 'Quiero Vender — 2% & 2%',
      options: [
        { label: 'Venta Tradicional', link: '/servicios/venta-tradicional' },
        { label: 'Con Herencia Pendiente (Sucesiones)', link: '/servicios/sucesiones' },
        { label: 'Propiedad Comercial', link: '/servicios/propiedad-comercial' }
      ]
    },
    {
      title: 'Quiero Arrendar — 50%',
      options: [
        { label: 'Arriendo Residencial', link: '/servicios/arriendo-residencial' },
        { label: 'Arriendo Comercial', link: '/servicios/arriendo-comercial' },
        { label: 'Mediación', link: '/servicios/mediacion' }
      ]
    },
    {
      title: 'Administración de Bienes — 10%',
      options: [
        { label: 'Herencias y Posesiones Efectivas', link: '/servicios/herencias-posesiones' },
        { label: 'Renta Corta', link: '/servicios/renta-corta' },
        { label: 'Proyecto Cultural y Comercial', link: '/servicios/proyecto-cultural-comercial' }
      ]
    },
    {
      title: 'Soy Inversionista',
      options: [
        { label: 'Remates y Oportunidades', link: '/servicios/remates' },
        { label: 'Multifamily / Departamentos', link: '/servicios/multifamily' }
      ]
    }
  ];

  toggleServices() {
    this.showServices = !this.showServices;
    
    if (this.showServices) {
      // Small timeout to allow *ngIf to render the dropdown
      setTimeout(() => {
        const dropdown = document.querySelector('.services-dropdown');
        if (dropdown) {
          const yOffset = -150; // Offset for the sticky header
          const y = dropdown.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  }
}
