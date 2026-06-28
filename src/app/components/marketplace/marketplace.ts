import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PropertyService, Property } from '../../services/property.service';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { ContactModalComponent } from '../contact-modal/contact-modal';
import { loadGoogleMaps } from '../../utils/google-maps-loader';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent, ContactModalComponent],
  template: `
    <div class="marketplace-wrapper">
      <!-- Header -->
      <app-header (contactClick)="openModal()"></app-header>

      <div class="marketplace-container container">
        <!-- Section Header -->
        <div class="marketplace-header animate-fade-in">
          <span class="mono text-accent">Marketplace de Propiedades</span>
          <h1 class="marketplace-title">Nuestras Propiedades</h1>
          <p class="marketplace-subtitle">Catálogo integrado de inmuebles gestionados por nuestra red de corredores autorizados.</p>
        </div>

        <!-- Mobile Filter Button Trigger -->
        <div class="mobile-filter-trigger-container">
          <button class="mobile-filter-btn mono" (click)="toggleMobileFilters()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Filtros</span>
            <span class="filter-count-badge" *ngIf="getActiveFiltersCount() > 0">{{ getActiveFiltersCount() }}</span>
          </button>
        </div>

        <!-- Filters Bar (Collapsible Drawer on Mobile) -->
        <form [formGroup]="filterForm" class="filter-bar animate-fade-in" [class.mobile-open]="showMobileFilters">
          <div class="drawer-header">
            <span class="mono">Filtros de Búsqueda</span>
            <button type="button" class="close-drawer-btn" (click)="toggleMobileFilters()">&times;</button>
          </div>

          <div class="filter-group text-search">
            <label class="mono label-small">Búsqueda</label>
            <input type="text" formControlName="searchText" placeholder="Comuna, dirección o título..." class="filter-input" (input)="applyFilters()" />
          </div>
          
          <div class="filter-group">
            <label class="mono label-small">Corredor</label>
            <select formControlName="brokerEmail" class="filter-select" (change)="applyFilters()">
              <option value="">Todos los Corredores</option>
              <option *ngFor="let b of brokers" [value]="b">{{ b }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="mono label-small">Operación</label>
            <select formControlName="operationType" class="filter-select" (change)="applyFilters()">
              <option value="">Todas</option>
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="mono label-small">Tipo</label>
            <select formControlName="propertyType" class="filter-select" (change)="applyFilters()">
              <option value="">Todos los tipos</option>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Local Comercial</option>
            </select>
          </div>

          <div class="filter-group pricing-range">
            <label class="mono label-small">Rango de Precios (UF)</label>
            <div class="dual-inputs">
              <input type="number" formControlName="minPrice" placeholder="Mín (UF)" class="filter-input" (input)="applyFilters()" />
              <input type="number" formControlName="maxPrice" placeholder="Máx (UF)" class="filter-input" (input)="applyFilters()" />
            </div>
          </div>

          <div class="drawer-footer">
            <button type="button" class="btn btn-outline close-drawer-action" (click)="toggleMobileFilters()">Ver Resultados</button>
          </div>
        </form>

        <!-- Status Info -->
        <div *ngIf="isLoading" class="loading-spinner">
          <div class="spinner"></div>
          <p class="mono">Cargando Base de Datos de Propiedades...</p>
        </div>

        <div *ngIf="!isLoading && filteredProperties.length === 0" class="no-results animate-fade-in">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p class="mono">No se encontraron propiedades</p>
          <span>Intenta flexibilizar los filtros o el texto de búsqueda.</span>
        </div>

        <!-- Properties Grid -->
        <div class="properties-grid" *ngIf="!isLoading && filteredProperties.length > 0">
          <div *ngFor="let p of filteredProperties; let cardIndex = index" class="property-card">
            <!-- Image Carousel -->
            <div class="card-image-wrapper" (click)="openPropertyDetails(p)">
              <img [src]="getCurrentPhoto(p, cardIndex)" alt="{{ p.title }}" class="card-img" />
              <span class="badge operation" [ngClass]="p.operationType">{{ p.operationType | titlecase }}</span>
              <span class="badge status" [ngClass]="p.status">{{ p.status | titlecase }}</span>

              <!-- Carousel controls if multiple photos -->
              <ng-container *ngIf="p.photos.length > 1">
                <button class="carousel-btn prev" (click)="prevPhoto($event, cardIndex, p.photos.length)">&#8249;</button>
                <button class="carousel-btn next" (click)="nextPhoto($event, cardIndex, p.photos.length)">&#8250;</button>
              </ng-container>

              <!-- Carousel Indicators (Dots) -->
              <div class="carousel-dots" *ngIf="p.photos.length > 1">
                <span *ngFor="let dot of p.photos; let i = index" class="dot" [class.active]="getPhotoIndex(cardIndex) === i"></span>
              </div>
            </div>

            <!-- Card Info -->
            <div class="card-info">
              <div class="card-header-row">
                <span class="mono card-commune">{{ p.commune }}</span>
                <span class="mono card-property-type">{{ p.propertyType | titlecase }}</span>
              </div>
              <h3 class="card-title" (click)="openPropertyDetails(p)" style="cursor: pointer;">{{ p.title }}</h3>
              <div class="price-container">
                <p class="card-price" style="margin-bottom: 2px;">{{ p.value | number:'1.0-2' }} UF</p>
                <p class="clp-equivalent" style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 1.2rem;">~ {{ p.value * 37600 | number:'1.0-0' }} CLP</p>
              </div>
              
              <div class="card-specs">
                <span *ngIf="p.bedrooms" class="spec-item">🛏 {{ p.bedrooms }} <span class="spec-label">Dorm</span></span>
                <span *ngIf="p.bathrooms" class="spec-item">🚿 {{ p.bathrooms }} <span class="spec-label">Baño</span></span>
                <span *ngIf="p.totalSqm" class="spec-item">📐 {{ p.totalSqm }} <span class="spec-label">m²</span></span>
              </div>
              
              <div class="card-divider"></div>
              
              <!-- Broker info and contact button -->
              <div class="broker-info">
                <div class="broker-details">
                  <span class="mono broker-title">Corredor</span>
                  <a [routerLink]="['/corredores', p.brokerEmail]" class="broker-email" [title]="p.brokerEmail" style="color: var(--primary); text-decoration: none; font-weight: 600;">{{ p.brokerEmail }}</a>
                </div>
                <button (click)="openPropertyDetails(p)" class="btn-contact mono">
                  Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>

    <!-- Property Details Modal (Popup) -->
    <div class="modal-overlay" *ngIf="selectedProperty" (click)="closePropertyDetails()">
      <div class="modal-content detail-modal animate-pop" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="mono text-accent">Detalles de la Propiedad: {{ selectedProperty.id }}</span>
          <button class="close-btn-x" (click)="closePropertyDetails()">&times;</button>
        </div>
        <div class="modal-body detail-modal-body">
          <div class="detail-grid">
            <!-- Col Left: Images & Map -->
            <div class="detail-col-left">
              <div class="detail-images">
                <img [src]="selectedProperty.photos[detailPhotoIndex]" alt="Foto" class="detail-main-img">
                <div class="detail-thumbnails" *ngIf="selectedProperty.photos.length > 1">
                  <img *ngFor="let photo of selectedProperty.photos; let i = index" 
                       [src]="photo" 
                       (click)="detailPhotoIndex = i" 
                       [class.active]="detailPhotoIndex === i"
                       class="detail-thumb">
                </div>
              </div>
              
              <!-- Map Container -->
              <div class="detail-map-section">
                <h4 class="mono section-title">Ubicación Geográfica</h4>
                <div id="detail-map" style="height: 220px; width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px;"></div>
                <span class="mono detail-address" *ngIf="selectedProperty.address">Dirección: {{ selectedProperty.address }}</span>
              </div>
            </div>
            
            <!-- Col Right: Specs & Description -->
            <div class="detail-col-right">
              <span class="mono text-accent">{{ selectedProperty.propertyType | uppercase }} | {{ selectedProperty.commune | uppercase }}</span>
              <h2 class="detail-title">{{ selectedProperty.title }}</h2>
              <div class="detail-price-row" style="margin-bottom: 1rem;">
                <div>
                  <span class="detail-price" style="font-size: 2rem; font-weight: 800; color: #fff; font-family: monospace;">{{ selectedProperty.value | number:'1.0-2' }} UF</span>
                  <span class="clp-equivalent" style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-top: 2px;">~ {{ selectedProperty.value * 37600 | number:'1.0-0' }} CLP</span>
                </div>
                <span class="badge operation-inline" [ngClass]="selectedProperty.operationType">{{ selectedProperty.operationType | titlecase }}</span>
              </div>
              
              <div class="detail-specs-grid">
                <div class="detail-spec"><span class="spec-label">Comuna</span><span class="spec-val">{{ selectedProperty.commune }}</span></div>
                <div class="detail-spec"><span class="spec-label">Tipo</span><span class="spec-val">{{ selectedProperty.propertyType | titlecase }}</span></div>
                <div class="detail-spec"><span class="spec-label">Dormitorios</span><span class="spec-val">{{ selectedProperty.bedrooms }}</span></div>
                <div class="detail-spec"><span class="spec-label">Baños</span><span class="spec-val">{{ selectedProperty.bathrooms }}</span></div>
                <div class="detail-spec"><span class="spec-label">Sup. Total</span><span class="spec-val">{{ selectedProperty.totalSqm }} m²</span></div>
                <div class="detail-spec"><span class="spec-label">Sup. Útil</span><span class="spec-val">{{ selectedProperty.usefulSqm }} m²</span></div>
                <div class="detail-spec" *ngIf="selectedProperty.parking"><span class="spec-label">Estac.</span><span class="spec-val">{{ selectedProperty.parking }}</span></div>
                <div class="detail-spec" *ngIf="selectedProperty.storage"><span class="spec-label">Bodegas</span><span class="spec-val">{{ selectedProperty.storage }}</span></div>
                <div class="detail-spec" *ngIf="selectedProperty.commonExpenses"><span class="spec-label">Gastos Comunes</span><span class="spec-val">{{ selectedProperty.commonExpenses | number:'1.0-2' }} UF</span></div>
              </div>
              
              <div class="detail-section">
                <h4 class="mono section-title">Descripción</h4>
                <p class="detail-description">{{ selectedProperty.description }}</p>
              </div>
              
              <div class="detail-section" *ngIf="selectedProperty.amenities">
                <h4 class="mono section-title">Comodidades</h4>
                <p class="detail-amenities">{{ selectedProperty.amenities }}</p>
              </div>
              
              <div class="detail-divider"></div>
              
              <div class="detail-contact-section">
                <div class="detail-broker">
                  <span class="mono label-small">Corredor Responsable</span>
                  <a [routerLink]="['/corredores', selectedProperty.brokerEmail]" class="broker-email" style="color: var(--primary); text-decoration: none; font-weight: 600;" (click)="closePropertyDetails()">{{ selectedProperty.brokerEmail }}</a>
                </div>
                <a href="mailto:{{ selectedProperty.brokerEmail }}?subject=Consulta por propiedad: {{ selectedProperty.title }}" class="btn-primary-tech mono text-center">
                  Iniciar Contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-wrapper {
      background-color: var(--bg-color);
      min-height: 100vh;
      transition: background-color 0.5s ease;
    }
    
    .marketplace-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 120px 2rem 50px 2rem;
    }
    
    .marketplace-header {
      margin-bottom: 3rem;
      text-align: left;
      border-left: 2px solid var(--primary);
      padding-left: 1.5rem;
      transition: border-color 0.5s ease;
    }
    
    .text-accent {
      color: var(--primary);
      font-size: 0.8rem;
      letter-spacing: 2px;
      opacity: 0.7;
    }

    .marketplace-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.8rem;
      font-weight: 800;
      color: #fff;
      margin: 0.5rem 0;
      letter-spacing: -1px;
    }

    .marketplace-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      line-height: 1.6;
      margin: 0;
    }

    /* Mobile trigger header hidden on desktop */
    .mobile-filter-trigger-container {
      display: none;
    }

    /* Drawer Header & Footer hidden on desktop */
    .drawer-header, .drawer-footer {
      display: none;
    }

    /* Elegant Glassmorphic Filter Bar */
    .filter-bar {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 2fr;
      gap: 1.2rem;
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 3rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label-small {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 1.5px;
    }

    .filter-input, .filter-select {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      color: #fff;
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .filter-select option {
      background-color: #121212;
      color: #ffffff;
    }

    .filter-input:focus, .filter-select:focus {
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }

    .dual-inputs {
      display: flex;
      gap: 0.5rem;
    }

    /* Grid configuration */
    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }

    /* Premium Technical Property Card */
    .property-card {
      background: rgba(15, 15, 15, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(15px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .property-card:hover {
      transform: translateY(-8px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 40px rgba(255, 255, 255, 0.05);
    }

    /* Carousel image wrapper */
    .card-image-wrapper {
      position: relative;
      height: 240px;
      background: #000;
      overflow: hidden;
      cursor: pointer;
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .property-card:hover .card-img {
      transform: scale(1.05);
    }

    .badge {
      position: absolute;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: monospace;
      z-index: 3;
    }

    .badge.operation-inline {
      position: static;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.2);
    }

    .badge.operation {
      top: 15px;
      left: 15px;
      background: #000;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: border-color 0.5s ease;
    }
    
    .badge.operation.venta {
      border-color: var(--primary);
    }

    .badge.status {
      top: 15px;
      right: 15px;
      color: #fff;
    }

    .badge.status.disponible { background: #10b981; }
    .badge.status.vendida { background: #ef4444; }
    .badge.status.arrendada { background: #3b82f6; }

    /* Carousel Arrows - Hide by default, show on hover */
    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
      z-index: 4;
    }

    .carousel-btn:hover {
      background: var(--primary);
      color: var(--bg-color);
    }

    .carousel-btn.prev { left: 12px; }
    .carousel-btn.next { right: 12px; }

    .property-card:hover .carousel-btn {
      opacity: 1;
      pointer-events: auto;
    }

    /* Carousel Indicators (Dots) */
    .carousel-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 5;
    }

    .carousel-dots .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }

    .carousel-dots .dot.active {
      width: 18px;
      border-radius: 3px;
      background: #fff;
    }

    /* Card Details */
    .card-info {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }

    .card-commune {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .card-property-type {
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 600;
      transition: color 0.5s ease;
    }

    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin: 0.2rem 0 0.8rem 0;
      line-height: 1.4;
      transition: color 0.3s;
    }

    .property-card:hover .card-title {
      color: var(--primary);
    }

    .card-price {
      font-family: monospace;
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
    }

    .card-specs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .spec-item {
      font-size: 0.8rem;
      color: #fff;
    }

    .spec-label {
      color: var(--text-muted);
    }

    .card-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.07);
      margin-bottom: 1.2rem;
      margin-top: auto;
    }

    /* Broker / CTA Area */
    .broker-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .broker-details {
      display: flex;
      flex-direction: column;
      max-width: 60%;
    }

    .broker-title {
      font-size: 0.6rem;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .broker-email {
      font-size: 0.8rem;
      color: #e5e7eb;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    .btn-contact {
      background: transparent;
      border: 1px solid var(--text-muted);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-contact:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--bg-color);
    }

    /* Loader & No Results States */
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 5rem 0;
      color: var(--text-muted);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .no-results {
      text-align: center;
      padding: 5rem 2rem;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.01);
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .no-results p {
      margin: 1rem 0 0.5rem 0;
      color: #fff;
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .no-results span {
      font-size: 0.85rem;
    }

    /* Animations */
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pop {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    /* Responsive & Mobile Drawer Layout */
    @media (max-width: 991px) {
      .mobile-filter-trigger-container {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 2rem;
      }

      .mobile-filter-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
      }

      .mobile-filter-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--primary);
      }

      .filter-count-badge {
        background: var(--primary);
        color: var(--bg-color);
        font-weight: 700;
        font-size: 0.7rem;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .filter-bar {
        position: fixed;
        top: 0;
        right: -100%;
        width: 100%;
        max-width: 380px;
        height: 100vh;
        background: rgba(10, 10, 10, 0.98);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        z-index: 10000;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        box-shadow: -10px 0 35px rgba(0, 0, 0, 0.6);
        transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        margin-bottom: 0;
        overflow-y: auto;
        border-radius: 0;
        border: none;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
      }

      .filter-bar.mobile-open {
        right: 0;
      }

      .drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 1rem;
        margin-bottom: 0.5rem;
      }

      .drawer-header span {
        color: var(--primary);
        font-weight: 700;
        letter-spacing: 1px;
      }

      .close-drawer-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 2rem;
        cursor: pointer;
        transition: color 0.3s;
        line-height: 1;
      }

      .close-drawer-btn:hover {
        color: #fff;
      }

      .drawer-footer {
        display: flex;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .close-drawer-action {
        width: 100%;
        text-align: center;
        padding: 0.8rem;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 576px) {
      .properties-grid {
        grid-template-columns: 1fr;
      }
      .marketplace-title {
        font-size: 2.2rem;
      }
      .filter-bar {
        max-width: 100%;
      }
    }
  `]
})
export class MarketplaceComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private fb = inject(FormBuilder);

  filterForm: FormGroup;
  brokers: string[] = [];
  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  isLoading = true;
  showModal = false;
  showMobileFilters = false;

  // Selected Property Popup
  selectedProperty: Property | null = null;
  detailPhotoIndex = 0;

  // Carousel photo indexes for cards
  private photoIndexes: Map<number, number> = new Map();

  constructor() {
    this.filterForm = this.fb.group({
      searchText: [''],
      brokerEmail: [''],
      operationType: [''],
      propertyType: [''],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  async ngOnInit() {
    await this.loadData();
    this.applyFilters();
  }

  openModal() {
    this.showModal = true;
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    const { searchText, brokerEmail, operationType, propertyType, minPrice, maxPrice } = this.filterForm.value;
    if (searchText && searchText.trim()) count++;
    if (brokerEmail) count++;
    if (operationType) count++;
    if (propertyType) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }

  private async loadData() {
    this.isLoading = true;
    try {
      const rawProps = await this.propertyService.getAllProperties();
      // Map the properties exactly to match schema expectations and fallbacks
      this.allProperties = rawProps.map(p => {
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
          latitude: raw.latitude || -33.4489,
          longitude: raw.longitude || -70.6693,
          propertyType: raw.propertyType || 'Departamento',
          bedrooms: raw.bedrooms || 0,
          bathrooms: raw.bathrooms || 0,
          totalSqm: raw.totalSqm || 0,
          usefulSqm: raw.usefulSqm || 0,
          parking: raw.parking || 0,
          storage: raw.storage || 0,
          commonExpenses: raw.commonExpenses || 0,
          amenities: raw.amenities || '',
          description: raw.description || '',
          photos: photos,
          status: statusStr as any
        };
      });

      // Extract distinct brokers from mapped list
      const set = new Set<string>();
      this.allProperties.forEach(p => {
        if (p.brokerEmail) {
          set.add(p.brokerEmail);
        }
      });
      this.brokers = Array.from(set);

    } catch (e) {
      console.error('Marketplace load error', e);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    const { searchText, brokerEmail, operationType, propertyType, minPrice, maxPrice } = this.filterForm.value;
    const searchLower = (searchText || '').toLowerCase().trim();

    this.filteredProperties = this.allProperties.filter(p => {
      // 1. Text Search (title, commune, address, or broker email)
      if (searchLower) {
        const titleMatch = p.title.toLowerCase().includes(searchLower);
        const communeMatch = p.commune.toLowerCase().includes(searchLower);
        const addressMatch = (p.address || '').toLowerCase().includes(searchLower);
        const brokerMatch = p.brokerEmail.toLowerCase().includes(searchLower);
        if (!titleMatch && !communeMatch && !addressMatch && !brokerMatch) {
          return false;
        }
      }

      // 2. Exact Filters
      if (brokerEmail && p.brokerEmail !== brokerEmail) return false;
      if (operationType && p.operationType !== operationType) return false;
      if (propertyType && p.propertyType !== propertyType) return false;
      if (minPrice && p.value < +minPrice) return false;
      if (maxPrice && p.value > +maxPrice) return false;

      return true;
    });
  }

  // Photo Carousel Management
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

  // Popup Management for Property Details & Maps
  openPropertyDetails(p: Property) {
    this.selectedProperty = p;
    this.detailPhotoIndex = 0;
    setTimeout(() => {
      this.initDetailMap();
    }, 100);
  }

  closePropertyDetails() {
    this.selectedProperty = null;
  }

  async initDetailMap() {
    if (!this.selectedProperty) return;
    try {
      const google = await loadGoogleMaps();
      const mapEl = document.getElementById('detail-map');
      if (!mapEl) return;

      const lat = this.selectedProperty.latitude || -33.4489;
      const lng = this.selectedProperty.longitude || -70.6693;
      const myLatLng = { lat: +lat, lng: +lng };

      const map = new google.maps.Map(mapEl, {
        zoom: 15,
        center: myLatLng,
        mapTypeControl: false,
        streetViewControl: false
      });

      new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: this.selectedProperty.title
      });
    } catch (e) {
      console.error('Error al inicializar mapa en el popup:', e);
    }
  }
}
