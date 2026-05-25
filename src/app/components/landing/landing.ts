import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { HeroComponent } from '../hero/hero';
import { ContactModalComponent } from '../contact-modal/contact-modal';

declare var paypal: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    ContactModalComponent
  ],
  template: `
    <div class="landing-wrapper">
      <app-header (contactClick)="openModal()"></app-header>
      
      <main>
        <app-hero (ctaClick)="openModal()"></app-hero>
      </main>

      <section class="payment-test">
        <div class="container">
          <div class="payment-card">
            <div class="payment-header mono">Pasarela de Pago | Acceso Seguro</div>
            <div class="payment-body">
              <h3>Finalizar Contratación</h3>
              <p>Utiliza nuestra pasarela segura para formalizar tu sesión de consultoría técnica.</p>
              
              <!-- Real PayPal Buttons Container -->
              <div id="paypal-button-container" class="paypal-container"></div>
            </div>
          </div>
        </div>
      </section>

      <footer class="basic-footer">
        <div class="container footer-grid">
          <div class="footer-brand mono">LATAM Trust Network | 2026</div>
          <div class="footer-meta mono">Protocolo de Red LATAM v4.1</div>
        </div>
      </footer>



      <!-- Global Modal -->
      <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
    </div>
  `,
  styles: [`
    .landing-wrapper { background-color: var(--bg-color); }
    
    /* Payment Test Section */
    .payment-test {
      padding: 4rem 0;
      border-top: 1px solid var(--blueprint-line);
      background: rgba(255, 212, 0, 0.02);
    }
    .payment-card {
      max-width: 600px;
      margin: 0 auto;
      border: 1px solid var(--blueprint-line);
      background: rgba(0,0,0,0.3);
    }
    .payment-header {
      background: var(--blueprint-line);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      font-size: 0.7rem;
      letter-spacing: 2px;
    }
    .payment-body {
      padding: 3rem;
      text-align: center;
    }
    .payment-body h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }
    .payment-body p {
      color: var(--text-muted);
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }
    .paypal-container {
      max-width: 400px;
      margin: 0 auto;
      min-height: 150px;
    }

    .basic-footer {
      padding: 3rem 0;
      border-top: 1px solid var(--blueprint-line);
      background: rgba(0,0,0,0.2);
    }

    .footer-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0.4;
    }
    @media (max-width: 768px) {
      .footer-grid { flex-direction: column; gap: 1rem; text-align: center; }
    }
  `]
})
export class LandingComponent implements AfterViewInit {
  showModal = false;

  ngAfterViewInit() {
    this.renderPayPalButtons();
  }

  renderPayPalButtons() {
    if (typeof paypal !== 'undefined') {
      paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Consultoría Técnica - LATAM Trust',
              amount: {
                currency_code: 'USD',
                value: '1.00' // Precio de prueba
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            alert('¡Pago completado con éxito, ' + details.payer.name.given_name + '!');
            console.log('Transaction details:', details);
            // Aquí podrías redirigir a una página de éxito
          });
        },
        onError: (err: any) => {
          console.error('PayPal Error:', err);
          alert('Hubo un error con el pago. Por favor intenta de nuevo.');
        }
      }).render('#paypal-button-container');
    } else {
      // Reintentar si el SDK aún no carga
      setTimeout(() => this.renderPayPalButtons(), 500);
    }
  }

  openModal() {
    this.showModal = true;
  }

  openWhatsApp() {
    window.open('https://wa.me/569XXXXXXXX', '_blank');
  }
}
