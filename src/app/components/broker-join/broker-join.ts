import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header';
import { ContactModalComponent } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-broker-join',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, ContactModalComponent],
  template: `
    <div class="broker-join-wrapper">
      <!-- Header -->
      <app-header (contactClick)="openModal()"></app-header>

      <main class="main-content">
        <!-- Hero Section -->
        <section class="hero-section container">
          <div class="hero-content animate-fade-in">
            <span class="badge-premium">RED DE CORREDORES LATAM</span>
            <h1 class="hero-title">Impulsa tus Ventas y Gestión al Siguiente Nivel</h1>
            <p class="hero-subtitle">
              Únete a la red inmobiliaria de mayor confianza en Latinoamérica. Comparte propiedades, gestiona documentos legales de forma ágil y accede a herramientas avanzadas de geolocalización.
            </p>
          </div>
        </section>

        <!-- Commercial Terms Section -->
        <section class="contract-section container animate-fade-in">
          <div class="section-header">
            <h2>Esquema Comercial Transparente</h2>
            <p>Cobramos una comisión mínima únicamente cuando cierras un negocio utilizando nuestra plataforma.</p>
          </div>

          <div class="contract-cards">
            <!-- Card 1: Ventas -->
            <div class="contract-card" [class.active]="selectedTab === 'venta'" (click)="selectedTab = 'venta'">
              <div class="card-icon">💼</div>
              <h3>Venta de Propiedades</h3>
              <p class="percentage">0.5%</p>
              <p class="card-desc">Del valor total de la transacción inmobiliaria.</p>
              <ul class="features">
                <li>✓ Acceso a tasaciones</li>
                <li>✓ Estudio de títulos automatizado</li>
                <li>✓ Soporte legal de cierre</li>
              </ul>
            </div>

            <!-- Card 2: Arriendos -->
            <div class="contract-card" [class.active]="selectedTab === 'arriendo'" (click)="selectedTab = 'arriendo'">
              <div class="card-icon">🔑</div>
              <h3>Arriendo Tradicional</h3>
              <p class="percentage">5.0%</p>
              <p class="card-desc">Del valor del primer mes de arriendo acordado.</p>
              <ul class="features">
                <li>✓ Filtro de arrendatarios</li>
                <li>✓ Firma de contrato digital</li>
                <li>✓ Gestión de inventario fotográfico</li>
              </ul>
            </div>

            <!-- Card 3: Administración -->
            <div class="contract-card" [class.active]="selectedTab === 'administracion'" (click)="selectedTab = 'administracion'">
              <div class="card-icon">📊</div>
              <h3>Administración</h3>
              <p class="percentage">2.0%</p>
              <p class="card-desc">Mensual sobre el valor del canon de arriendo administrado.</p>
              <ul class="features">
                <li>✓ Recaudación automática</li>
                <li>✓ Liquidaciones a propietarios</li>
                <li>✓ Control de reajustes e IPC</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Simulator Row -->
        <section class="interactive-section container" style="max-width: 600px; margin: 0 auto;">
          <!-- Commission Simulator -->
          <div class="simulator-box card-glass animate-fade-in">
            <h3 class="box-title">Simulador de Comisiones</h3>
            <p class="box-subtitle">Calcula tu ganancia neta y el costo de la plataforma por operación.</p>

            <div class="form-group">
              <label>Tipo de Operación</label>
              <select [(ngModel)]="simOperation" (change)="calculateSimulation()" class="form-control">
                <option value="venta">Venta de Propiedad (0.5% tarifa)</option>
                <option value="arriendo">Arriendo de Propiedad (5.0% tarifa)</option>
                <option value="administracion">Administración Mensual (2.0% tarifa)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Valor de la Propiedad o Canon (UF)</label>
              <input type="number" [(ngModel)]="simValue" (input)="calculateSimulation()" placeholder="Ej: 3500" class="form-control">
            </div>

            <div class="simulation-results">
              <div class="result-row">
                <span>Comisión del Corredor (Est. 2% venta / 50% arriendo)</span>
                <span class="val">{{ simBrokerComm | number:'1.0-2' }} UF</span>
              </div>
              <div class="result-row accent">
                <span>Costo por uso de plataforma LATAM Trust</span>
                <span class="val">- {{ simPlatformFee | number:'1.0-2' }} UF</span>
              </div>
              <div class="divider"></div>
              <div class="result-row total">
                <span>Tu Ganancia Neta Estimada</span>
                <span class="val green">{{ simNetProfit | number:'1.0-2' }} UF</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Global Contact Modal -->
      <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
    </div>
  `,
  styles: [`
    .broker-join-wrapper {
      background-color: var(--bg-color);
      min-height: 100vh;
      color: #fff;
      font-family: 'Inter', sans-serif;
    }

    .main-content {
      padding-top: 120px;
      padding-bottom: 80px;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 4rem;
    }

    .badge-premium {
      background: rgba(251, 191, 36, 0.1);
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 2px;
      display: inline-block;
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.2;
      max-width: 800px;
      margin: 0 auto 1.5rem auto;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Contract Section */
    .contract-section {
      margin-bottom: 5rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .contract-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .contract-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .contract-card:hover, .contract-card.active {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--primary);
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(251, 191, 36, 0.08);
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .contract-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .percentage {
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary);
      margin: 0.5rem 0;
      font-family: monospace;
    }

    .card-desc {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
      min-height: 40px;
    }

    .features {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .features li {
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    /* Interactive Section (Simulator & Form) */
    .interactive-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 3rem;
      align-items: start;
    }

    @media (max-width: 991px) {
      .interactive-grid {
        grid-template-columns: 1fr;
      }
    }

    .card-glass {
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .box-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .box-subtitle {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.2rem;
    }

    .form-group label {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-row {
      display: flex;
      gap: 1.2rem;
    }

    @media (max-width: 576px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }

    .form-control {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.8rem 1rem;
      color: #fff;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.07);
    }

    /* Simulation Results */
    .simulation-results {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.2rem;
      margin-top: 2rem;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      margin-bottom: 0.8rem;
      color: #cbd5e1;
    }

    .result-row.accent {
      color: #f87171;
    }

    .result-row .val {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .simulation-results .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 1rem 0;
    }

    .result-row.total {
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
    }

    .result-row.total .val.green {
      color: #10b981;
      font-size: 1.2rem;
    }

    /* Form specific */
    .checkbox-group {
      display: flex;
      gap: 0.8rem;
      align-items: flex-start;
      margin: 1.5rem 0;
    }

    .checkbox-group input {
      margin-top: 3px;
      cursor: pointer;
    }

    .checkbox-group label {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
      cursor: pointer;
    }

    .btn-submit {
      background: var(--primary);
      border: none;
      color: #000;
      padding: 1rem;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.9rem;
      width: 100%;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }

    .btn-submit:hover:not(:disabled) {
      background: #fff;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
    }

    .btn-submit:disabled {
      background: #4b5563;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .error-text {
      font-size: 0.72rem;
      color: #ef4444;
      margin-top: 2px;
    }

    .block {
      display: block;
    }

    /* Success state */
    .success-state {
      text-align: center;
      padding: 2rem 0;
    }

    .success-icon {
      width: 60px;
      height: 60px;
      background: rgba(16, 185, 129, 0.1);
      border: 2px solid #10b981;
      color: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1.5rem auto;
      font-weight: bold;
    }

    .success-state h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .success-state p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .btn-primary {
      background: var(--primary);
      border: none;
      color: #000;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Animation utility */
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BrokerJoinComponent implements OnInit {
  joinForm: FormGroup;
  showModal = false;
  selectedTab = 'venta';
  isSubmitted = false;

  // Simulator binding states
  simOperation = 'venta';
  simValue: number | null = 3500; // 3500 UF default
  simBrokerComm = 0;
  simPlatformFee = 0;
  simNetProfit = 0;

  private fb = inject(FormBuilder);

  constructor() {
    this.joinForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      commune: [''],
      experience: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.calculateSimulation();
  }

  openModal() {
    this.showModal = true;
  }

  calculateSimulation() {
    const val = this.simValue || 0;
    if (this.simOperation === 'venta') {
      // 2% is the standard broker sale commission in Chile
      this.simBrokerComm = val * 0.02;
      // 0.5% platform fee of total transaction
      this.simPlatformFee = val * 0.005;
    } else if (this.simOperation === 'arriendo') {
      // 50% of first month is the standard broker lease commission
      this.simBrokerComm = val * 0.5;
      // 5% platform fee of first month rent
      this.simPlatformFee = val * 0.05;
    } else {
      // Administration is usually 10% broker fee
      this.simBrokerComm = val * 0.1;
      // 2% monthly platform fee of rental value
      this.simPlatformFee = val * 0.02;
    }
    this.simNetProfit = this.simBrokerComm - this.simPlatformFee;
  }

  onSubmit() {
    if (this.joinForm.valid) {
      console.log('Broker request submitted:', this.joinForm.value);
      this.isSubmitted = true;
    }
  }

  resetForm() {
    this.joinForm.reset({
      fullName: '',
      email: '',
      phone: '',
      commune: '',
      experience: '',
      acceptTerms: false
    });
    this.isSubmitted = false;
  }
}
