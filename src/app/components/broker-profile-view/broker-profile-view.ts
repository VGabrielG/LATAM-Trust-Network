import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BrokerService, BrokerProfile } from '../../services/broker.service';
import { PropertyService, Property } from '../../services/property.service';
import { HeaderComponent } from '../header/header';
import { ContactModalComponent } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-broker-profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, ContactModalComponent],
  template: `
    <div class="profile-view-wrapper">
      <app-header (contactClick)="openModal()"></app-header>

      <main class="main-content container">
        <!-- Back Button -->
        <div class="nav-back animate-fade-in">
          <a routerLink="/corredores" class="btn-back">← Volver al Directorio</a>
        </div>

        <div class="profile-grid">
          <!-- Col Left: Profile Card Details -->
          <div class="profile-sidebar card-glass animate-fade-in" *ngIf="profile">
            <div class="avatar-wrapper">
              <img [src]="profile.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'" alt="{{ profile.name }}" class="sidebar-avatar">
            </div>

            <h2 class="profile-name">{{ profile.name || profile.email }}</h2>
            <span class="profile-company" *ngIf="profile.company">{{ profile.company }}</span>
            <span class="profile-email-label">{{ profile.email }}</span>
            
            <p class="profile-bio">{{ profile.bio || 'Corredor certificado de la red inmobiliaria LATAM Trust Network.' }}</p>

            <div class="divider"></div>

            <div class="contact-details">
              <div class="contact-item" *ngIf="profile.phone">
                <span class="label">TELEFÓNO</span>
                <span class="val">{{ profile.phone }}</span>
              </div>
              <div class="contact-item" *ngIf="profile.rut">
                <span class="label">REGISTRO / RUT</span>
                <span class="val">{{ profile.rut }}</span>
              </div>
            </div>

            <div class="sidebar-actions">
              <a href="mailto:{{ profile.email }}?subject=Consulta por propiedades de la red" class="btn-primary-tech text-center w-full">
                Enviar Correo
              </a>
              <a *ngIf="profile.whatsapp" [href]="'https://wa.me/' + profile.whatsapp" target="_blank" class="btn-whatsapp text-center w-full">
                Contactar WhatsApp
              </a>
            </div>
          </div>

          <!-- Col Right: Property Feed -->
          <div class="properties-feed">
            <div class="feed-header animate-fade-in">
              <h2>Propiedades en Portafolio</h2>
              <p>Catálogo actual gestionado por este corredor.</p>
            </div>

            <!-- Loader -->
            <div *ngIf="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando portafolio...</p>
            </div>

            <!-- Empty Feed -->
            <div *ngIf="!isLoading && properties.length === 0" class="empty-feed animate-fade-in">
              <p>Este corredor no tiene propiedades activas publicadas actualmente.</p>
            </div>

            <!-- Grid of Properties -->
            <div class="properties-grid" *ngIf="!isLoading && properties.length > 0">
              <div *ngFor="let p of properties; let cardIndex = index" class="property-card animate-fade-in">
                <!-- Image Wrapper -->
                <div class="card-image-wrapper">
                  <img [src]="getCurrentPhoto(p, cardIndex)" alt="{{ p.title }}" class="card-img" />
                  <span class="badge operation" [ngClass]="p.operationType">{{ p.operationType | titlecase }}</span>
                  <span class="badge status" [ngClass]="p.status">{{ p.status | titlecase }}</span>

                  <ng-container *ngIf="p.photos.length > 1">
                    <button class="carousel-btn prev" (click)="prevPhoto($event, cardIndex, p.photos.length)">&#8249;</button>
                    <button class="carousel-btn next" (click)="nextPhoto($event, cardIndex, p.photos.length)">&#8250;</button>
                  </ng-container>
                </div>

                <!-- Info -->
                <div class="card-info">
                  <div class="card-header-row">
                    <span class="mono card-commune">{{ p.commune }}</span>
                    <span class="mono card-property-type">{{ p.propertyType | titlecase }}</span>
                  </div>
                  <h3 class="card-title">{{ p.title }}</h3>
                  <div class="price-container">
                    <p class="card-price">{{ p.value | number:'1.0-2' }} UF</p>
                    <p class="clp-equivalent">~ {{ getClpEquivalent(p.value) | number:'1.0-0' }} CLP</p>
                  </div>
                  
                  <div class="card-specs">
                    <span *ngIf="p.bedrooms" class="spec-item">🛏 {{ p.bedrooms }} <span class="spec-label">Dorm</span></span>
                    <span *ngIf="p.bathrooms" class="spec-item">🚿 {{ p.bathrooms }} <span class="spec-label">Baño</span></span>
                    <span *ngIf="p.totalSqm" class="spec-item">📐 {{ p.totalSqm }} <span class="spec-label">m²</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Global Contact Modal -->
      <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
    </div>
  `,
  styles: [`
    .profile-view-wrapper {
      background-color: var(--bg-color);
      min-height: 100vh;
      color: #fff;
    }

    .main-content {
      padding-top: 120px;
      padding-bottom: 80px;
    }

    .nav-back {
      margin-bottom: 2rem;
    }

    .btn-back {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
    }

    .btn-back:hover {
      color: #fff;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 2.2fr;
      gap: 3rem;
      align-items: start;
    }

    @media (max-width: 991px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar Details Card */
    .profile-sidebar {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .card-glass {
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .avatar-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--primary);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
    }

    .sidebar-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0;
    }

    .profile-company {
      font-size: 0.85rem;
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 5px;
    }

    .profile-email-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .profile-bio {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 1.5rem 0 0 0;
    }

    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      width: 100%;
      margin: 1.5rem 0;
    }

    .contact-details {
      width: 100%;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .contact-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .contact-item .label {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 1px;
      font-weight: 600;
    }

    .contact-item .val {
      font-size: 0.9rem;
      color: #fff;
    }

    .sidebar-actions {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      width: 100%;
    }

    .btn-primary-tech {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: #000;
      padding: 0.8rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary-tech:hover {
      background: #fff;
      border-color: #fff;
    }

    .btn-whatsapp {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 0.8rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-whatsapp:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #fff;
    }

    /* Col Right: Feed header */
    .properties-feed {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .feed-header h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
    }

    .feed-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0.25rem 0 0 0;
    }

    /* Property Grid */
    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .property-card {
      background: rgba(15, 15, 15, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(15px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .card-image-wrapper {
      position: relative;
      height: 180px;
      background: #000;
      overflow: hidden;
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-family: monospace;
    }

    .badge.operation {
      top: 12px;
      left: 12px;
      background: #000;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .badge.operation.venta {
      border-color: var(--primary);
    }

    .badge.status {
      top: 12px;
      right: 12px;
      color: #fff;
    }

    .badge.status.disponible { background: #10b981; }
    .badge.status.vendida { background: #ef4444; }
    .badge.status.arrendada { background: #3b82f6; }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .carousel-btn.prev { left: 8px; }
    .carousel-btn.next { right: 8px; }

    /* Card Details */
    .card-info {
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .card-commune {
      color: var(--text-muted);
      font-size: 0.7rem;
      letter-spacing: 1px;
    }

    .card-property-type {
      color: var(--primary);
      font-size: 0.7rem;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price-container {
      margin-bottom: 1rem;
    }

    .card-price {
      font-family: monospace;
      font-size: 1.25rem;
      color: #fff;
      font-weight: 700;
      margin: 0;
    }

    .clp-equivalent {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin: 2px 0 0 0;
    }

    .card-specs {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .spec-item {
      font-size: 0.8rem;
      color: #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .spec-label {
      color: var(--text-muted);
      font-size: 0.7rem;
    }

    /* Common states */
    .loading-state {
      text-align: center;
      padding: 4rem 0;
      color: var(--text-muted);
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-feed {
      text-align: center;
      padding: 3rem 1.5rem;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-muted);
    }

    .w-full {
      width: 100%;
    }

    .text-center {
      text-align: center;
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
export class BrokerProfileViewComponent implements OnInit {
  profile: BrokerProfile | null = null;
  properties: Property[] = [];
  isLoading = true;
  showModal = false;

  private route = inject(ActivatedRoute);
  private brokerService = inject(BrokerService);
  private propertyService = inject(PropertyService);

  // Carousel photo index per card
  private photoIndexes: Map<number, number> = new Map();

  async ngOnInit() {
    const email = this.route.snapshot.paramMap.get('email');
    if (email) {
      await this.loadBrokerData(email);
    }
  }

  openModal() {
    this.showModal = true;
  }

  async loadBrokerData(email: string) {
    this.isLoading = true;
    try {
      // Load broker profile
      this.profile = await this.brokerService.getProfile(email);
      if (!this.profile) {
        // Fallback profile if none exists in firestore 'brokers' collection
        this.profile = {
          email: email,
          name: email.split('@')[0],
          bio: 'Corredor certificado de la red inmobiliaria LATAM Trust Network.',
          phone: '',
          photoUrl: ''
        };
      }

      // Load properties by this broker
      const rawProps = await this.propertyService.getAllProperties();
      this.properties = rawProps.filter(p => p.brokerEmail.toLowerCase() === email.toLowerCase()).map(p => {
        const raw = p as any;
        let photos: string[] = [];
        if (Array.isArray(raw.photos) && raw.photos.length > 0) {
          photos = raw.photos;
        } else if (raw.photo) {
          photos = [raw.photo];
        } else {
          photos = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'];
        }

        let statusStr = (raw.status || 'disponible').toLowerCase();
        if (statusStr === 'vendido') statusStr = 'vendida';
        if (statusStr === 'arrendado') statusStr = 'arrendada';

        return {
          id: raw.id,
          brokerEmail: raw.brokerEmail || raw.brokerId || '',
          title: raw.title || 'Propiedad sin título',
          operationType: (raw.operationType || 'venta').toLowerCase() as any,
          value: raw.value || raw.price || 0,
          commune: raw.commune || 'Santiago',
          address: raw.address || '',
          propertyType: raw.propertyType || 'Departamento',
          bedrooms: raw.bedrooms || 0,
          bathrooms: raw.bathrooms || 0,
          totalSqm: raw.totalSqm || 0,
          usefulSqm: raw.usefulSqm || 0,
          description: raw.description || '',
          photos: photos,
          status: statusStr as any
        };
      });

    } catch (e) {
      console.error('Error loading broker profile view', e);
    } finally {
      this.isLoading = false;
    }
  }

  // 1 UF = $37.600 CLP approx.
  getClpEquivalent(ufValue: number): number {
    return ufValue * 37600;
  }

  getPhotoIndex(cardIndex: number): number {
    return this.photoIndexes.get(cardIndex) ?? 0;
  }

  getCurrentPhoto(prop: Property, cardIndex: number): string {
    const idx = this.getPhotoIndex(cardIndex);
    return prop.photos[idx] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
  }

  nextPhoto(event: Event, cardIndex: number, total: number) {
    event.stopPropagation();
    event.preventDefault();
    const current = this.getPhotoIndex(cardIndex);
    this.photoIndexes.set(cardIndex, (current + 1) % total);
  }

  prevPhoto(event: Event, cardIndex: number, total: number) {
    event.stopPropagation();
    event.preventDefault();
    const current = this.getPhotoIndex(cardIndex);
    this.photoIndexes.set(cardIndex, (current - 1 + total) % total);
  }
}
