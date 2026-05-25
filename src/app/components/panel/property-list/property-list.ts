import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService, Property } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="list-container">
      <div class="header">
        <h2>Mis Propiedades</h2>
        <a routerLink="/panel/publicar" class="btn-add">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar Propiedad
        </a>
      </div>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        Cargando propiedades...
      </div>

      <div *ngIf="!isLoading && properties.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <p>Aún no tienes propiedades publicadas.</p>
        <a routerLink="/panel/publicar" class="btn-add">Publicar tu primera propiedad</a>
      </div>

      <div class="property-grid" *ngIf="!isLoading && properties.length > 0">
        <div class="property-card" *ngFor="let prop of properties; let cardIndex = index">

          <!-- Carrusel de imágenes -->
          <div class="carousel">
            <img
              [src]="getCurrentPhoto(prop, cardIndex)"
              alt="{{ prop.title }}"
              class="carousel-img"
            >
            <span class="status-badge" [ngClass]="prop.status">{{ prop.status | titlecase }}</span>

            <ng-container *ngIf="prop.photos.length > 1">
              <button class="carousel-btn prev" (click)="prevPhoto(cardIndex, prop.photos.length)">&#8249;</button>
              <button class="carousel-btn next" (click)="nextPhoto(cardIndex, prop.photos.length)">&#8250;</button>
              <div class="carousel-dots">
                <span
                  *ngFor="let p of prop.photos; let i = index"
                  class="dot"
                  [class.active]="getPhotoIndex(cardIndex) === i"
                  (click)="setPhoto(cardIndex, i)"
                ></span>
              </div>
            </ng-container>
          </div>

          <div class="card-content">
            <h3>{{ prop.title }}</h3>
            <p class="price">{{ prop.value | number:'1.0-2' }} UF &mdash; <span class="op-type">{{ prop.operationType | titlecase }}</span></p>
            <p class="details">
              <span>{{ prop.propertyType | titlecase }}</span> &bull;
              <span>{{ prop.commune }}</span>
            </p>
            <p class="details">
              <span *ngIf="prop.bedrooms">🛏 {{ prop.bedrooms }}</span>
              <span *ngIf="prop.bathrooms"> &bull; 🚿 {{ prop.bathrooms }}</span>
              <span *ngIf="prop.totalSqm"> &bull; 📐 {{ prop.totalSqm }}m²</span>
              <span *ngIf="prop.parking"> &bull; 🚗 {{ prop.parking }}</span>
            </p>
            <p class="amenities" *ngIf="prop.amenities">✨ {{ prop.amenities }}</p>
          </div>

          <div class="card-actions">
            <select [value]="prop.status" (change)="changeStatus(prop, $event)" class="status-select">
              <option value="disponible">Disponible</option>
              <option value="vendida">Vendida</option>
              <option value="arrendada">Arrendada</option>
            </select>
            <a [routerLink]="['/panel/editar', prop.id]" class="btn-edit">Editar</a>
            <a [routerLink]="['/panel/propiedades', prop.id, 'documentos']" class="btn-docs">Docs</a>
            <button (click)="openPhotosModal(prop)" class="btn-docs">Fotos</button>
            <button class="btn-delete" (click)="deleteProperty(prop)">Baja</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Gestión de Fotos (Popup Rápido) -->
    <div class="modal-overlay" *ngIf="selectedPhotoProperty" (click)="closePhotosModal()">
      <div class="modal-content animate-pop" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Fotos de: {{ selectedPhotoProperty.title }}</h3>
          <button class="close-btn" (click)="closePhotosModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <p class="desc" style="color: #4b5563; font-size: 0.85rem; margin-bottom: 1.2rem;">Administra las imágenes de esta propiedad (Máximo 5 fotos).</p>
          
          <!-- Miniaturas de fotos actuales -->
          <div class="photos-manager-grid">
            <div class="photo-manager-item" *ngFor="let photo of selectedPhotoProperty.photos; let idx = index">
              <img [src]="photo" alt="Miniatura" class="thumb-img">
              <button (click)="deletePhoto(idx)" [disabled]="isPhotoActionSaving" class="btn-delete-photo">Eliminar</button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Form para subir nueva foto -->
          <div class="upload-photo-section" *ngIf="selectedPhotoProperty.photos.length < 5">
            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: #374151;">Subir Nueva Foto</h4>
            <div class="form-group" style="margin-bottom: 10px;">
              <input type="file" (change)="onPhotoFileSelected($event)" accept="image/*" class="form-control" [disabled]="isPhotoActionSaving">
            </div>
            <button (click)="uploadNewPhoto()" [disabled]="!newPhotoSelected || isPhotoActionSaving" class="btn-add w-full" style="width: 100%; border: none; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: 700;">
              {{ isPhotoActionSaving ? 'Subiendo...' : 'Agregar Imagen' }}
            </button>
          </div>

          <div class="notice-max" *ngIf="selectedPhotoProperty.photos.length >= 5">
            ⚠️ Has alcanzado el límite máximo de 5 fotografías para esta propiedad. Elimina alguna para subir una nueva.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-container { max-width: 1100px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h2 { margin: 0; color: #1f2937; font-size: 1.5rem; }

    .btn-add {
      display: flex; align-items: center; gap: 8px;
      background: #1f2937; color: white;
      padding: 10px 18px; border-radius: 8px;
      text-decoration: none; font-weight: 600; font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn-add:hover { background: #374151; }

    .loading { display: flex; align-items: center; gap: 12px; color: #6b7280; padding: 40px 0; }
    .spinner { width: 22px; height: 22px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; color: #6b7280; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-state p { margin: 0; font-size: 1.1rem; }

    .property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }

    .property-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .property-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }

    /* Carrusel */
    .carousel { position: relative; height: 220px; overflow: hidden; background: #f3f4f6; }
    .carousel-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.3s; }
    .status-badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.disponible { background: #10b981; }
    .status-badge.vendida { background: #ef4444; }
    .status-badge.arrendada { background: #3b82f6; }

    .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.45); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s; z-index: 2; }
    .carousel-btn:hover { background: rgba(0,0,0,0.7); }
    .carousel-btn.prev { left: 8px; }
    .carousel-btn.next { right: 8px; }

    .carousel-dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; transition: background 0.2s; }
    .dot.active { background: white; }

    /* Contenido */
    .card-content { padding: 16px; flex: 1; }
    .card-content h3 { margin: 0 0 8px 0; font-size: 1rem; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price { font-weight: 700; color: #1d4ed8; font-size: 1.05rem; margin: 0 0 8px 0; }
    .op-type { font-weight: 400; font-size: 0.9rem; color: #6b7280; }
    .details { color: #6b7280; font-size: 0.85rem; margin: 0 0 4px 0; }
    .amenities { color: #6b7280; font-size: 0.82rem; margin: 6px 0 0 0; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Acciones */
    .card-actions { padding: 12px 16px; border-top: 1px solid #f3f4f6; display: flex; gap: 8px; align-items: center; }
    .status-select { padding: 7px 8px; border-radius: 6px; border: 1px solid #d1d5db; background: #f9fafb; flex: 1; font-size: 0.85rem; }
    .btn-edit { background: #eff6ff; color: #1d4ed8; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-edit:hover { background: #dbeafe; }
    .btn-docs { background: #f3f4f6; color: #1f2937; border: 1px solid #cbd5e1; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn-docs:hover { background: #e2e8f0; }
    .btn-delete { background: #fee2e2; color: #dc2626; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: background 0.2s; }
    .btn-delete:hover { background: #fca5a5; }

    /* Modal de Fotos y miniaturas */
    .photos-manager-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 15px;
    }
    .photo-manager-item {
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      background: #fafafa;
    }
    .thumb-img {
      width: 100%;
      height: 80px;
      object-fit: cover;
    }
    .btn-delete-photo {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      padding: 6px 0;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      transition: background 0.2s;
    }
    .btn-delete-photo:hover {
      background: #fca5a5;
    }
    .upload-photo-section {
      margin-top: 20px;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 20px 0;
    }
    .notice-max {
      margin-top: 20px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #d97706;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.8rem;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #1f2937;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #9ca3af;
    }
    .close-btn:hover {
      color: #1f2937;
    }
    .modal-body {
      padding: 20px;
      text-align: left;
    }
    .animate-pop {
      animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes pop {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);

  properties: Property[] = [];
  isLoading = true;

  // Mapa de índices actuales del carrusel por índice de tarjeta
  private photoIndexes: Map<number, number> = new Map();
  private loadedEmail = '';

  constructor() {
    // Reactively watch for auth state changes
    effect(() => {
      const email = this.authService.currentUser()?.email;
      if (email && email !== this.loadedEmail) {
        console.log('PropertyListComponent Auth Effect: loading properties for:', email);
        this.loadedEmail = email;
        this.loadProperties();
      }
    });
  }

  async ngOnInit() {
    console.log('ngOnInit: PropertyListComponent initialized');
    const email = this.authService.currentUser()?.email;
    if (email) {
      this.loadedEmail = email;
      await this.loadProperties();
    }
  }

  async loadProperties() {
    this.isLoading = true;
    try {
      const email = this.authService.currentUser()?.email;
      const role = this.authService.userRole();
      if (email) {
        const rawProps = await this.propertyService.getPropertiesByBroker(email, role);
        this.properties = rawProps.map(p => {
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
            parking: raw.parking || 0,
            storage: raw.storage || 0,
            commonExpenses: raw.commonExpenses || 0,
            amenities: raw.amenities || '',
            description: raw.description || '',
            photos: photos,
            status: statusStr as any
          };
        });
      }
    } catch (error) {
      console.error('Error cargando propiedades', error);
    } finally {
      this.isLoading = false;
    }
  }

  getPhotoIndex(cardIndex: number): number {
    return this.photoIndexes.get(cardIndex) ?? 0;
  }

  getCurrentPhoto(prop: Property, cardIndex: number): string {
    const idx = this.getPhotoIndex(cardIndex);
    return prop.photos[idx] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
  }

  nextPhoto(cardIndex: number, total: number) {
    const current = this.getPhotoIndex(cardIndex);
    this.photoIndexes.set(cardIndex, (current + 1) % total);
  }

  prevPhoto(cardIndex: number, total: number) {
    const current = this.getPhotoIndex(cardIndex);
    this.photoIndexes.set(cardIndex, (current - 1 + total) % total);
  }

  setPhoto(cardIndex: number, photoIndex: number) {
    this.photoIndexes.set(cardIndex, photoIndex);
  }

  async changeStatus(property: Property, event: any) {
    const newStatus = event.target.value;
    if (property.id) {
      try {
        await this.propertyService.updateProperty(property.id, { status: newStatus });
        property.status = newStatus;
      } catch (error) {
        console.error('Error actualizando estado', error);
        event.target.value = property.status;
      }
    }
  }

  async deleteProperty(property: Property) {
    if (confirm(`¿Estás seguro de que quieres dar de baja la propiedad "${property.title}"?`)) {
      if (property.id) {
        try {
          await this.propertyService.deleteProperty(property.id);
          this.properties = this.properties.filter(p => p.id !== property.id);
        } catch (error) {
          console.error('Error eliminando propiedad', error);
          alert('Hubo un error al eliminar la propiedad.');
        }
      }
    }
  }

  // Métodos del Gestor de Fotos Rápido
  selectedPhotoProperty: Property | null = null;
  newPhotoSelected: File | null = null;
  isPhotoActionSaving = false;

  openPhotosModal(property: Property) {
    this.selectedPhotoProperty = property;
    this.newPhotoSelected = null;
  }

  closePhotosModal() {
    this.selectedPhotoProperty = null;
    this.newPhotoSelected = null;
  }

  onPhotoFileSelected(event: any) {
    this.newPhotoSelected = event.target.files[0];
  }

  async uploadNewPhoto() {
    if (!this.selectedPhotoProperty || !this.selectedPhotoProperty.id || !this.newPhotoSelected) return;

    this.isPhotoActionSaving = true;
    try {
      const email = this.authService.currentUser()?.email || 'corredor';
      const fileUrl = await this.propertyService.uploadPropertyDocument(email, this.selectedPhotoProperty.id, this.newPhotoSelected);
      
      const currentPhotos = this.selectedPhotoProperty.photos || [];
      const updatedPhotos = [...currentPhotos, fileUrl];

      await this.propertyService.updateProperty(this.selectedPhotoProperty.id, {
        photos: updatedPhotos
      });

      this.selectedPhotoProperty.photos = updatedPhotos;
      this.newPhotoSelected = null;

      // Clear input
      const fileInput = document.querySelector('.upload-photo-section input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (e) {
      console.error('Error al subir nueva foto de propiedad:', e);
      alert('Hubo un error al subir la imagen.');
    } finally {
      this.isPhotoActionSaving = false;
    }
  }

  async deletePhoto(index: number) {
    if (!this.selectedPhotoProperty || !this.selectedPhotoProperty.id || !this.selectedPhotoProperty.photos) return;
    if (this.selectedPhotoProperty.photos.length <= 1) {
      alert('Debes mantener al menos una fotografía para la propiedad.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta fotografía?')) return;

    this.isPhotoActionSaving = true;
    try {
      const updatedPhotos = [...this.selectedPhotoProperty.photos];
      updatedPhotos.splice(index, 1);

      await this.propertyService.updateProperty(this.selectedPhotoProperty.id, {
        photos: updatedPhotos
      });

      this.selectedPhotoProperty.photos = updatedPhotos;
    } catch (e) {
      console.error('Error al eliminar foto de propiedad:', e);
      alert('Hubo un error al eliminar la imagen.');
    } finally {
      this.isPhotoActionSaving = false;
    }
  }
}
