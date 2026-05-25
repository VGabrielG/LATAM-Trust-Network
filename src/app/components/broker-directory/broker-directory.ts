import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrokerService, BrokerProfile } from '../../services/broker.service';
import { PropertyService, Property } from '../../services/property.service';
import { HeaderComponent } from '../header/header';
import { ContactModalComponent } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-broker-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, ContactModalComponent],
  template: `
    <div class="directory-wrapper">
      <app-header (contactClick)="openModal()"></app-header>

      <div class="directory-container container">
        <!-- Section Header -->
        <div class="directory-header animate-fade-in">
          <span class="badge-accent">NUESTRA RED</span>
          <h1 class="directory-title">Corredores Autorizados</h1>
          <p class="directory-subtitle">Encuentra y contacta directamente a los profesionales certificados de la red LATAM Trust.</p>
        </div>

        <!-- Search Bar -->
        <div class="search-bar card-glass animate-fade-in">
          <div class="search-input-group">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchText" placeholder="Buscar por nombre, comuna o empresa..." class="search-input" (input)="filterBrokers()" />
          </div>
        </div>

        <!-- Loader -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando directorio de corredores...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && filteredBrokers.length === 0" class="empty-state animate-fade-in">
          <p>No se encontraron corredores que coincidan con tu búsqueda.</p>
        </div>

        <!-- Grid of Brokers -->
        <div class="brokers-grid" *ngIf="!isLoading && filteredBrokers.length > 0">
          <div *ngFor="let b of filteredBrokers" class="broker-card animate-fade-in">
            <!-- Broker Header/Photo -->
            <div class="card-header">
              <div class="avatar-container">
                <img [src]="b.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'" alt="{{ b.name }}" class="broker-avatar">
              </div>
              <div class="broker-meta">
                <h3 class="broker-name">{{ b.name || b.email }}</h3>
                <span class="broker-company" *ngIf="b.company">{{ b.company }}</span>
                <span class="broker-email-small" [title]="b.email">{{ b.email }}</span>
              </div>
            </div>

            <!-- Broker Body -->
            <div class="card-body">
              <p class="broker-bio">{{ b.bio || 'Corredor asociado a la red inmobiliaria LATAM Trust Network.' }}</p>
              <div class="broker-badge-row">
                <span class="badge badge-listing-count">
                  🏢 {{ getPropertyCount(b.email) }} Propiedades
                </span>
                <span class="badge badge-phone" *ngIf="b.phone">
                  📞 Certificado
                </span>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Card Actions -->
            <div class="card-actions">
              <a [routerLink]="['/corredores', b.email]" class="btn-profile">
                Ver Propiedades
              </a>
              <a *ngIf="b.whatsapp" [href]="'https://wa.me/' + b.whatsapp" target="_blank" class="btn-whatsapp">
                WhatsApp
              </a>
              <a *ngIf="!b.whatsapp && b.phone" [href]="'tel:' + b.phone" class="btn-whatsapp">
                Llamar
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Contact Modal -->
      <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
    </div>
  `,
  styles: [`
    .directory-wrapper {
      background-color: var(--bg-color);
      min-height: 100vh;
      color: #fff;
    }

    .directory-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 120px 2rem 50px 2rem;
    }

    .directory-header {
      margin-bottom: 3rem;
      border-left: 2px solid var(--primary);
      padding-left: 1.5rem;
    }

    .badge-accent {
      background: rgba(251, 191, 36, 0.1);
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .directory-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.8rem;
      font-weight: 800;
      color: #fff;
      margin: 0.5rem 0;
      letter-spacing: -1px;
    }

    .directory-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      line-height: 1.6;
      margin: 0;
    }

    /* Search Bar */
    .search-bar {
      margin-bottom: 3rem;
    }

    .card-glass {
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.2rem 1.5rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    }

    .search-input-group {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .search-icon {
      font-size: 1.2rem;
      opacity: 0.7;
    }

    .search-input {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      width: 100%;
    }

    /* Grid of Cards */
    .brokers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .broker-card {
      background: rgba(15, 15, 15, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(15px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .broker-card:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: 0 20px 40px rgba(255, 255, 255, 0.03);
    }

    .card-header {
      display: flex;
      gap: 1.2rem;
      align-items: center;
      margin-bottom: 1.2rem;
    }

    .avatar-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--primary);
    }

    .broker-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .broker-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .broker-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .broker-company {
      font-size: 0.78rem;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .broker-email-small {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    /* Body */
    .card-body {
      flex-grow: 1;
      margin-bottom: 1.5rem;
    }

    .broker-bio {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0 0 1.2rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .broker-badge-row {
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
    }

    .badge {
      font-size: 0.72rem;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 600;
    }

    .badge-listing-count {
      background: rgba(255, 255, 255, 0.04);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .badge-phone {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .card-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin-bottom: 1.2rem;
    }

    /* Actions */
    .card-actions {
      display: flex;
      gap: 0.8rem;
    }

    .btn-profile {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: #000;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      flex-grow: 1;
      text-align: center;
      transition: all 0.3s ease;
    }

    .btn-profile:hover {
      background: #fff;
      border-color: #fff;
    }

    .btn-whatsapp {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s ease;
    }

    .btn-whatsapp:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #fff;
    }

    /* Common layout */
    .loading-state {
      text-align: center;
      padding: 5rem 0;
      color: var(--text-muted);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-muted);
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BrokerDirectoryComponent implements OnInit {
  brokers: BrokerProfile[] = [];
  filteredBrokers: BrokerProfile[] = [];
  properties: Property[] = [];
  searchText = '';
  isLoading = true;
  showModal = false;

  private brokerService = inject(BrokerService);
  private propertyService = inject(PropertyService);

  async ngOnInit() {
    await this.loadData();
  }

  openModal() {
    this.showModal = true;
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Fetch all brokers and properties
      this.brokers = await this.brokerService.getAllProfiles();
      this.properties = await this.propertyService.getAllProperties();

      // Check for brokers defined in properties but not in profiles
      const profileEmails = new Set(this.brokers.map(b => b.email.toLowerCase()));
      const uniqueBrokerEmails = new Set(this.properties.map(p => p.brokerEmail.toLowerCase()).filter(Boolean));

      // Append dummy profiles for brokers who have properties but no profile doc
      uniqueBrokerEmails.forEach(email => {
        if (!profileEmails.has(email)) {
          this.brokers.push({
            email: email,
            name: email.split('@')[0],
            bio: 'Corredor asociado a la red inmobiliaria LATAM Trust Network.',
            phone: '',
            photoUrl: ''
          });
        }
      });

      this.filteredBrokers = [...this.brokers];
    } catch (e) {
      console.error('Error loading broker directory', e);
    } finally {
      this.isLoading = false;
    }
  }

  getPropertyCount(email: string): number {
    if (!email) return 0;
    return this.properties.filter(p => p.brokerEmail.toLowerCase() === email.toLowerCase()).length;
  }

  filterBrokers() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredBrokers = [...this.brokers];
      return;
    }

    this.filteredBrokers = this.brokers.filter(b => {
      const nameMatch = (b.name || '').toLowerCase().includes(search);
      const emailMatch = (b.email || '').toLowerCase().includes(search);
      const compMatch = (b.company || '').toLowerCase().includes(search);
      return nameMatch || emailMatch || compMatch;
    });
  }
}
