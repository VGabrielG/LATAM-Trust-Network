import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { ContactModalComponent } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ContactModalComponent],
  template: `
    <app-header (contactClick)="showModal = true"></app-header>
    <div class="page-top-offset"></div>
    
    <section id="nosotros" class="about-section">
      <div class="container">
        <div class="about-grid">
          <!-- Text Content -->
          <div class="about-content animate-up">
            <div class="section-label mono">// SOBRE_EL_HUB</div>
            <h2>Legal PropTech: El Hub de Gestión Inmobiliaria</h2>
            <p class="lead">
              LATAM Trust Network es un ecosistema digital que redefine la gestión inmobiliaria a través de la transparencia, la ética y la trazabilidad.
            </p>
            <p>
              Como el primer Hub de desarrollo inmobiliario en Chile, operamos bajo el protocolo de <strong>Ingeniería de Confianza</strong>. No solo gestionamos activos; diseñamos soluciones jurídicas integrales que aseguran tu futuro patrimonial en un entorno digital y globalizado.
            </p>
            
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-num">4</span>
                <span class="stat-label">Países (CL, BR, CO, USA)</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">100%</span>
                <span class="stat-label">Transparencia en Fees</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">IoT</span>
                <span class="stat-label">Programa de Agentes</span>
              </div>
            </div>
          </div>

          <!-- Pillars Visual -->
          <div class="pillars-visual animate-up delay-1">
            <div class="pillar-card legal">
              <div class="pillar-icon">⚖️</div>
              <div class="pillar-info">
                <h3>Legal</h3>
                <p>Blindaje contractual y gestión de herencias.</p>
              </div>
            </div>
            <div class="pillar-card technical">
              <div class="pillar-icon">🏗️</div>
              <div class="pillar-info">
                <h3>Técnico</h3>
                <p>Tasaciones precisas y análisis de activos.</p>
              </div>
            </div>
            <div class="pillar-card commercial">
              <div class="pillar-icon">🤝</div>
              <div class="pillar-info">
                <h3>Comercial</h3>
                <p>Estrategias de salida y red de inversión.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Section -->
        <div class="team-section animate-up delay-2">
          <div class="section-label mono">// EQUIPO_DIRECTIVO</div>
          <div class="team-grid">
            <div class="team-card">
              <div class="member-image">
                <div class="img-placeholder"></div>
              </div>
              <div class="member-info">
                <h3>Beltrán Godoy</h3>
                <p class="role">CEO & Founder</p>
                <p class="bio">Visionario detrás del concepto de Ingeniería de Confianza, liderando la transformación digital de la gestión inmobiliaria en LATAM.</p>
              </div>
            </div>
            <div class="team-card">
              <div class="member-image">
                <div class="img-placeholder"></div>
              </div>
              <div class="member-info">
                <h3>Andrés Villalobos</h3>
                <p class="role">Director Legal</p>
                <p class="bio">Experto en saneamiento de títulos y cumplimiento de la Ley de Protección de Datos (2026), asegurando discreción total.</p>
              </div>
            </div>
            <div class="team-card">
              <div class="member-image">
                <div class="img-placeholder"></div>
              </div>
              <div class="member-info">
                <h3>Carolina Santis</h3>
                <p class="role">Directora de Estrategia</p>
                <p class="bio">Especialista en mercados internacionales y desarrollo de marca personal para agentes dentro del Hub.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Blog/Insights Section -->
        <div class="blog-section animate-up delay-3">
          <div class="section-label mono">// INSIGHTS_DE_CONFIANZA</div>
          <div class="blog-grid">
            <div class="blog-card">
              <div class="blog-meta mono">MARKET INSIGHT // 2026</div>
              <h3>Tu inversión en piloto automático</h3>
              <p>Descubre cómo nuestro modelo de administración (10%) utiliza Marketing Digital e Ingeniería para maximizar tu rentabilidad sin fricciones.</p>
              <a href="#" class="read-more">CONOCER MODELO →</a>
            </div>
            <div class="blog-card">
              <div class="blog-meta mono">HUB EXCLUSIVE // ESTRATEGIA</div>
              <h3>El impacto del programa IoT en Agentes</h3>
              <p>Análisis de cómo la marca personal y el respaldo legal del Hub están transformando el cierre de negocios en la región.</p>
              <a href="#" class="read-more">VER PROGRAMA →</a>
            </div>
          </div>
        </div>

        <!-- Regional Network Section -->
        <div class="network-banner animate-up delay-2">
          <div class="banner-content">
            <div class="banner-text">
              <h3>Una Red de Confianza en Todo Chile</h3>
              <p>Nuestros ejecutivos regionales no solo conocen el mercado; viven en él. Garantizamos una respuesta ágil y conocimiento local profundo en cada rincón del país.</p>
            </div>
            <div class="network-visual">
              <div class="dot-pulse"></div>
              <span class="mono">STATUS: NETWORK_ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
    <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
  `,
  styles: [`
    .page-top-offset {
      height: 80px;
      background: #000;
    }
    .about-section {
      padding: 10rem 0;
      background: #000;
      position: relative;
      overflow: hidden;
    }
    
    .about-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 6rem;
      align-items: center;
      margin-bottom: 8rem;
    }

    .section-label {
      color: var(--primary);
      letter-spacing: 4px;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
    }

    h2 {
      font-size: 3.5rem;
      line-height: 1.1;
      margin-bottom: 2rem;
      font-weight: 900;
      letter-spacing: -2px;
    }

    p {
      color: var(--text-muted);
      font-size: 1.1rem;
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }

    .lead {
      color: #fff;
      font-size: 1.4rem;
      font-weight: 500;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .stat-num {
      display: block;
      font-size: 2rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Pillars */
    .pillars-visual {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .pillar-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      padding: 2rem;
      display: flex;
      gap: 2rem;
      align-items: center;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .pillar-card:hover {
      border-color: var(--primary);
      transform: translateX(10px);
      background: rgba(251, 191, 36, 0.05);
    }

    .pillar-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .pillar-info h3 {
      font-size: 1.2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    .pillar-info p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* Network Banner */
    .network-banner {
      background: var(--primary);
      padding: 4rem;
      color: #000;
      position: relative;
    }

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4rem;
    }

    .banner-text h3 {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: 1rem;
      letter-spacing: -1px;
    }

    .banner-text p {
      color: rgba(0,0,0,0.8);
      margin: 0;
      font-weight: 500;
      max-width: 600px;
    }

    .network-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .dot-pulse {
      width: 12px;
      height: 12px;
      background: #000;
      border-radius: 50%;
      position: relative;
    }

    .dot-pulse::after {
      content: '';
      position: absolute;
      inset: -10px;
      border: 1px solid #000;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    /* Animations */
    .animate-up {
      opacity: 0;
      transform: translateY(40px);
      animation: fadeUp 1s ease forwards;
    }
    .delay-1 { animation-delay: 0.3s; }
    .delay-2 { animation-delay: 0.6s; }

    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }

    /* Team Styles */
    .team-section {
      margin-bottom: 8rem;
    }
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-top: 3rem;
    }
    .team-card {
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.05);
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .team-card:hover {
      border-color: rgba(251, 191, 36, 0.3);
      transform: translateY(-5px);
    }
    .member-image {
      aspect-ratio: 1;
      background: #111;
      margin-bottom: 1.5rem;
      position: relative;
    }
    .img-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #111, #1a1a1a);
      position: relative;
    }
    .img-placeholder::after {
      content: 'IMAGE_PORTRAIT';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      color: rgba(255,255,255,0.1);
      letter-spacing: 2px;
    }
    .member-info h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }
    .role {
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .bio {
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Blog Styles */
    .blog-section {
      margin-bottom: 8rem;
    }
    .blog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 3rem;
    }
    .blog-card {
      background: #111;
      padding: 3rem;
      border-left: 2px solid var(--primary);
    }
    .blog-meta {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .blog-card h3 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .blog-card p {
      font-size: 1rem;
      margin-bottom: 2rem;
    }
    .read-more {
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    @media (max-width: 1024px) {
      .about-grid { grid-template-columns: 1fr; gap: 4rem; }
      .banner-content { flex-direction: column; text-align: center; gap: 2rem; }
      h2 { font-size: 2.5rem; }
      .blog-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {
  showModal = false;
}
