import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="service-detail-wrapper">
      <app-header></app-header>
      
      <main class="container">
        <!-- Hero Header -->
        <div class="service-header animate-up">
          <div class="service-header-content">
            <h1>{{ serviceData.title }}</h1>
            <div class="rate-badge" *ngIf="serviceData.rate">{{ serviceData.rate }}</div>
            <p class="subtitle">{{ serviceData.subtitle }}</p>
            <div class="divider"></div>
          </div>
        </div>

        <!-- CTA Marketplace -->
        <section class="marketplace-cta animate-up delay-1">
          <div class="cta-inner">
            <div class="cta-text">

              <h2>{{ serviceData.ctaTitle }}</h2>
              <p>{{ serviceData.ctaDescription }}</p>
            </div>
            <div class="cta-actions">
              <button class="btn btn-primary">Ver Marketplace</button>
              <button class="btn btn-outline">Agendar con Ejecutivo</button>
            </div>
          </div>
        </section>

        <!-- Process Steps -->
        <section class="process-section animate-up delay-2" *ngIf="serviceData.steps.length">
          <div class="section-header">

            <h2>¿Cómo Funciona?</h2>
          </div>
          <div class="steps-grid">
            <div class="step-card" *ngFor="let step of serviceData.steps; let i = index">
              <div class="step-number mono">{{ (i + 1).toString().padStart(2, '0') }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </section>

        <!-- Key Benefits -->
        <section class="benefits-section animate-up" *ngIf="serviceData.benefits.length">
          <div class="section-header">

            <h2>¿Por Qué Elegirnos?</h2>
          </div>
          <div class="benefits-grid">
            <div class="benefit-card" *ngFor="let benefit of serviceData.benefits">
              <div class="benefit-icon">{{ benefit.icon }}</div>
              <h3>{{ benefit.title }}</h3>
              <p>{{ benefit.description }}</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    .service-detail-wrapper {
      min-height: 100vh;
      background: var(--bg-color);
      padding-top: 120px;
      padding-bottom: 100px;
    }

    /* Header */
    .service-header { 
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5rem; 
      gap: 3rem;
    }
    .service-header-content {
      flex: 1;
    }
    .service-header h1 {
      font-size: 3.5rem;
      margin: 1rem 0 0.5rem;
      font-weight: 900;
      letter-spacing: -2px;
    }
    .subtitle {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 700px;
      line-height: 1.8;
      margin-bottom: 2rem;
    }
    .divider { width: 80px; height: 3px; background: var(--primary); }
    .rate-badge {
      display: inline-block;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 0.4rem 1.2rem;
      margin-bottom: 1.5rem;
    }

    /* Section Headers */
    .section-header {
      margin-bottom: 3rem;
    }
    .section-header h2 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin-top: 0.5rem;
    }

    /* Marketplace CTA */
    .marketplace-cta {
      margin-bottom: 6rem;
    }
    .cta-inner {
      border: 1px solid rgba(255,255,255,0.1);
      background: var(--surface-color);
      padding: 4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 3rem;
    }
    .cta-text h2 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0.8rem 0;
      letter-spacing: -1px;
    }
    .cta-text p {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.7;
      max-width: 550px;
    }
    .cta-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex-shrink: 0;
    }

    /* Process Steps */
    .process-section { margin-bottom: 6rem; }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
    .step-card {
      border: 1px solid rgba(255,255,255,0.05);
      background: var(--surface-color);
      padding: 2.5rem;
      transition: all 0.3s ease;
    }
    .step-card:hover {
      border-color: var(--primary);
      transform: translateY(-5px);
    }
    .step-number {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 1rem;
      opacity: 0.6;
    }
    .step-card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.8rem;
    }
    .step-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* Benefits */
    .benefits-section { margin-bottom: 6rem; }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .benefit-card {
      padding: 2.5rem;
      border-left: 3px solid var(--primary);
      background: var(--surface-color);
    }
    .benefit-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .benefit-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.8rem;
    }
    .benefit-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* Regional */
    .regional-section { margin-bottom: 6rem; }
    .regions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .region-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: var(--surface-color);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .region-card .dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--primary);
    }
    .regional-note {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.7;
      max-width: 700px;
    }

    /* Commission */
    .commission-section { margin-bottom: 6rem; }
    .commission-card {
      border: 1px solid var(--primary);
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }
    .commission-rate {
      font-size: 4rem;
      font-weight: 900;
      color: var(--primary);
      margin: 1rem 0;
      letter-spacing: -2px;
    }
    .commission-detail {
      color: var(--text-muted);
      font-size: 1rem;
    }

    /* Final CTA */
    .final-cta {
      text-align: center;
      padding: 5rem 0;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .final-cta h2 {
      font-size: 2.5rem;
      font-weight: 900;
      margin-bottom: 1rem;
      letter-spacing: -1px;
    }
    .final-cta p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
      max-width: 550px;
      margin-left: auto;
      margin-right: auto;
    }
    .final-actions {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
    }

    /* Animations */
    .animate-up {
      opacity: 0;
      transform: translateY(30px);
      animation: fadeUp 0.8s ease forwards;
    }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .service-header { flex-direction: column; }
      .service-visual { width: 100%; max-width: 300px; margin-top: 2rem; }
      .service-header h1 { font-size: 2.5rem; }
      .cta-inner { flex-direction: column; padding: 2.5rem; }
      .steps-grid { grid-template-columns: 1fr; }
      .commission-rate { font-size: 3rem; }
    }
  `]
})
export class ServiceDetailComponent implements OnInit {
  serviceSlug = '';
  serviceData: any = {
    title: '', subtitle: '', protocol: '', ctaTitle: '', ctaDescription: '',
    commission: '', commissionDetail: '', steps: [], benefits: []
  };

  private services: { [key: string]: any } = {
    'venta-tradicional': {
      title: 'Venta Tradicional',
      rate: '2% Comprador  ·  2% Vendedor',
      subtitle: 'Maximiza el valor de tu propiedad con nuestra red de ejecutivos regionales en todo Chile. Conectamos vendedores con compradores calificados para lograr las mejores condiciones de mercado.',
      protocol: 'VENTA_PROTOCOL_v3.1',
      ctaTitle: 'Explora Nuestro Marketplace Inmobiliario',
      ctaDescription: 'Accede a nuestro catálogo de propiedades y agenda directamente con ejecutivos especializados en tu zona. Nuestra red regional conecta oportunidades reales con compradores verificados.',
      commission: '',
      commissionDetail: '',
      steps: [
        { title: 'Evaluación Profesional', description: 'Realizamos un análisis de mercado y tasación de tu propiedad para determinar el precio óptimo de venta.' },
        { title: 'Estrategia de Venta', description: 'Diseñamos un plan de comercialización adaptado al tipo de propiedad y perfil de comprador objetivo.' },
        { title: 'Difusión y Marketplace', description: 'Tu propiedad se publica en nuestro marketplace y en portales estratégicos con fotografía profesional.' },
        { title: 'Negociación y Cierre', description: 'Nuestro equipo legal y comercial te acompaña en cada paso hasta la firma ante notario.' }
      ],
      benefits: [
        { icon: '⚡', title: 'Velocidad de Cierre', description: 'Conectamos compradores calificados rápidamente gracias a nuestra base de datos regional activa.' },
        { icon: '🔒', title: 'Seguridad Jurídica', description: 'Cada operación es supervisada por nuestro equipo legal para proteger tu patrimonio.' },
        { icon: '📊', title: 'Precio Justo de Mercado', description: 'Tasación profesional basada en datos reales y comparables de tu zona.' },
        { icon: '🤝', title: 'Acompañamiento Total', description: 'Te guiamos desde la primera visita hasta la entrega de llaves sin complicaciones.' }
      ]
    },
    'sucesiones': {
      title: 'Herencia Pendiente (Sucesiones)',
      rate: '3.5% Comprador  ·  3.5% Vendedor',
      subtitle: 'Gestionamos la venta de propiedades con herencias pendientes, posesiones efectivas y trámites sucesorios complejos.',
      protocol: 'SUCESION_PROTOCOL_v2.0',
      ctaTitle: 'Resolvemos Tu Caso de Sucesión',
      ctaDescription: 'Contamos con abogados especializados en derecho sucesorio que agilizan el proceso para que puedas vender sin trabas legales.',
      commission: '',
      commissionDetail: '',
      steps: [
        { title: 'Diagnóstico Legal', description: 'Evaluamos el estado de la sucesión, herederos involucrados y documentación necesaria.' },
        { title: 'Gestión de Posesión Efectiva', description: 'Tramitamos la posesión efectiva y las inscripciones necesarias en el Conservador de Bienes Raíces.' },
        { title: 'Acuerdo entre Herederos', description: 'Facilitamos la negociación y acuerdo entre co-herederos para viabilizar la venta.' },
        { title: 'Venta y Cierre', description: 'Una vez regularizada, ejecutamos la venta con todas las garantías legales.' }
      ],
      benefits: [
        { icon: '⚖️', title: 'Expertise Legal', description: 'Abogados especializados en derecho sucesorio y bienes raíces.' },
        { icon: '📋', title: 'Gestión Integral', description: 'Nos encargamos de toda la tramitación legal y documental.' },
        { icon: '🕐', title: 'Ahorro de Tiempo', description: 'Agilizamos procesos que normalmente toman meses.' },
        { icon: '🛡️', title: 'Sin Riesgos', description: 'Validamos cada paso para evitar problemas futuros.' }
      ]
    },
    'propiedad-comercial': {
      title: 'Propiedad Comercial',
      rate: '2% Comprador  ·  2% Vendedor',
      subtitle: 'Vende locales comerciales, oficinas y espacios de uso mixto con estrategias especializadas para el mercado corporativo.',
      protocol: 'COMMERCIAL_PROTOCOL_v1.5',
      ctaTitle: 'Comercializa Tu Propiedad Comercial',
      ctaDescription: 'Nuestro equipo conecta tu activo con inversionistas y empresas que buscan espacios estratégicos.',
      commission: '',
      commissionDetail: '',
      steps: [
        { title: 'Análisis Comercial', description: 'Evaluamos ubicación, flujo, rentabilidad y potencial del espacio comercial.' },
        { title: 'Perfil de Comprador', description: 'Identificamos el tipo de comprador ideal para maximizar el valor.' },
        { title: 'Marketing Dirigido', description: 'Campañas focalizadas en el segmento corporativo e inversionista.' },
        { title: 'Due Diligence y Cierre', description: 'Verificación completa de la operación con respaldo legal.' }
      ],
      benefits: [
        { icon: '🏢', title: 'Red Corporativa', description: 'Acceso a nuestra base de empresas e inversionistas activos.' },
        { icon: '📈', title: 'Maximización de Valor', description: 'Estrategias de pricing basadas en rentabilidad y cap rate.' },
        { icon: '📑', title: 'Due Diligence', description: 'Revisión completa de la situación legal y comercial del activo.' },
        { icon: '🌎', title: 'Alcance Nacional', description: 'Conectamos con compradores de todas las regiones de Chile.' }
      ]
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.serviceSlug = url[url.length - 1].path;
      this.serviceData = this.services[this.serviceSlug] || this.getDefaultService(this.serviceSlug);
    });
  }

  private getDefaultService(slug: string) {
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title,
      subtitle: 'Servicio especializado con acompañamiento profesional en cada etapa del proceso.',
      protocol: 'SERVICE_PROTOCOL_v1.0',
      ctaTitle: 'Agenda con Nuestro Equipo',
      ctaDescription: 'Conecta con ejecutivos regionales especializados para recibir asesoría personalizada en tu zona.',
      commission: '',
      commissionDetail: '',
      steps: [
        { title: 'Consulta Inicial', description: 'Evaluamos tu caso particular y definimos la mejor estrategia.' },
        { title: 'Plan de Acción', description: 'Diseñamos un plan personalizado con plazos y objetivos claros.' },
        { title: 'Ejecución', description: 'Nuestro equipo trabaja en tu caso con seguimiento constante.' },
        { title: 'Cierre Exitoso', description: 'Finalizamos la operación con toda la documentación en orden.' }
      ],
      benefits: [
        { icon: '🛡️', title: 'Equipo Profesional', description: 'Ejecutivos certificados con experiencia en el mercado chileno.' },
        { icon: '🔍', title: 'Transparencia Total', description: 'Información clara en cada etapa del proceso.' },
        { icon: '📍', title: 'Red Nacional', description: 'Presencia en las principales ciudades del país.' },
        { icon: '💎', title: 'Sin Letra Chica', description: 'Tarifas claras y competitivas sin costos ocultos.' }
      ]
    };
  }
}
