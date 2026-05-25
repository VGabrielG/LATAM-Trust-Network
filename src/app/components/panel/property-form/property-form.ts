import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';
import { loadGoogleMaps } from '../../../utils/google-maps-loader';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ isEditMode ? 'Editar Propiedad' : 'Publicar Inmueble' }}</h2>
      
      <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="property-form">
        
        <div class="form-row">
          <div class="form-group flex-2">
            <label>Título de la Propiedad *</label>
            <input type="text" formControlName="title" class="form-control" placeholder="Ej: Hermoso departamento en providencia">
          </div>
          <div class="form-group flex-1">
            <label>Tipo de Operación *</label>
            <select formControlName="operationType" class="form-control">
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Valor (UF) *</label>
            <input type="number" formControlName="value" class="form-control">
          </div>
          <div class="form-group">
            <label>Comuna *</label>
            <input type="text" formControlName="commune" class="form-control">
          </div>
          <div class="form-group">
            <label>Tipo de Inmueble *</label>
            <select formControlName="propertyType" class="form-control">
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Local Comercial</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Dormitorios *</label>
            <input type="number" formControlName="bedrooms" class="form-control">
          </div>
          <div class="form-group">
            <label>Baños *</label>
            <input type="number" formControlName="bathrooms" class="form-control">
          </div>
          <div class="form-group">
            <label>M2 Totales *</label>
            <input type="number" formControlName="totalSqm" class="form-control">
          </div>
          <div class="form-group">
            <label>M2 Útiles *</label>
            <input type="number" formControlName="usefulSqm" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-2">
            <label>Dirección de la Propiedad (Opcional) - Autocompletado Google Maps</label>
            <input type="text" formControlName="address" class="form-control" placeholder="Ej: Av. Apoquindo 1234">
          </div>
        </div>

        <!-- Google Map Section -->
        <div class="form-row">
          <div class="form-group">
            <label>Ubicación en el Mapa (Arrastra el marcador o haz clic en el mapa para ajustar el punto)</label>
            <div id="map" style="height: 300px; width: 100%; border-radius: 8px; border: 1px solid #d1d5db; margin-bottom: 10px;"></div>
            <div class="mono" style="font-size: 0.75rem; color: #666;">
              Coordenadas: {{ propertyForm.get('latitude')?.value }}, {{ propertyForm.get('longitude')?.value }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Estacionamientos</label>
            <input type="number" formControlName="parking" class="form-control">
          </div>
          <div class="form-group">
            <label>Bodegas</label>
            <input type="number" formControlName="storage" class="form-control">
          </div>
          <div class="form-group">
            <label>Gastos Comunes (UF)</label>
            <input type="number" formControlName="commonExpenses" class="form-control">
          </div>
          <div class="form-group">
            <label>Comodidades (Ej: Piscina, Gimnasio)</label>
            <input type="text" formControlName="amenities" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>Descripción Comercial *</label>
          <textarea formControlName="description" rows="5" class="form-control"></textarea>
        </div>

        <div class="form-group">
          <label>Fotografías * <span *ngIf="isEditMode">(Subir nuevas fotos reemplazará las existentes)</span></label>
          <input type="file" (change)="onFilesSelected($event)" accept="image/*" multiple class="form-control">
          <div class="photo-preview">
            <div *ngIf="isEditMode && selectedFiles.length === 0 && existingPhotos.length > 0">
              Manteniendo {{ existingPhotos.length }} foto(s) actual(es).
            </div>
            <div *ngFor="let file of selectedFiles; let i = index" class="preview-item">
              {{ file.name }}
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="propertyForm.invalid || isSaving" class="btn-save">
          {{ isSaving ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Publicar Inmueble') }}
        </button>

        <div *ngIf="errorMessage" class="alert error">{{ errorMessage }}</div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
    h2 { margin-top: 0; margin-bottom: 20px; color: #1f2937; }
    .property-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: flex; gap: 20px; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 150px; }
    .flex-2 { flex: 2; min-width: 300px; }
    .flex-1 { flex: 1; }
    label { font-weight: 500; color: #374151; font-size: 0.9rem; }
    .form-control { padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-family: inherit; }
    .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
    .btn-save { background: #10b981; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem; margin-top: 10px;}
    .btn-save:hover { background: #059669; }
    .btn-save:disabled { background: #9ca3af; cursor: not-allowed; }
    .photo-preview { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; font-size: 0.85rem; color: #4b5563; }
    .alert { padding: 10px; border-radius: 4px; margin-top: 10px; }
    .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  `]
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  propertyForm: FormGroup;
  isSaving = false;
  selectedFiles: File[] = [];
  existingPhotos: string[] = [];
  errorMessage = '';
  isEditMode = false;
  editPropertyId: string | null = null;

  map: any;
  marker: any;

  constructor() {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      operationType: ['venta', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      commune: ['', Validators.required],
      address: [''],
      latitude: [-33.4489],
      longitude: [-70.6693],
      propertyType: ['departamento', Validators.required],
      bedrooms: ['', [Validators.required, Validators.min(0)]],
      bathrooms: ['', [Validators.required, Validators.min(0)]],
      totalSqm: ['', [Validators.required, Validators.min(0)]],
      usefulSqm: ['', [Validators.required, Validators.min(0)]],
      parking: [0, Validators.min(0)],
      storage: [0, Validators.min(0)],
      commonExpenses: [0, Validators.min(0)],
      amenities: [''],
      description: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.editPropertyId = this.route.snapshot.paramMap.get('id');
    if (this.editPropertyId) {
      this.isEditMode = true;
      const prop = await this.propertyService.getProperty(this.editPropertyId);
      if (prop) {
        this.propertyForm.patchValue(prop);
        this.existingPhotos = prop.photos || [];
      }
    }

    try {
      const google = await loadGoogleMaps();
      this.initMap(google);
    } catch (e) {
      console.error('Error al inicializar mapa en el formulario:', e);
    }
  }

  initMap(google: any) {
    const lat = this.propertyForm.get('latitude')?.value || -33.4489;
    const lng = this.propertyForm.get('longitude')?.value || -70.6693;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const myLatLng = { lat: +lat, lng: +lng };

    this.map = new google.maps.Map(mapEl, {
      zoom: 15,
      center: myLatLng,
      mapTypeControl: false,
    });

    this.marker = new google.maps.Marker({
      position: myLatLng,
      map: this.map,
      draggable: true,
      title: 'Ubicación de la propiedad'
    });

    // Evento click en mapa
    this.map.addListener('click', (event: any) => {
      this.updateLocation(event.latLng.lat(), event.latLng.lng());
    });

    // Evento drag en marcador
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      this.updateLocation(pos.lat(), pos.lng());
    });

    // Configurar Autocompletado de Direcciones en Input
    const addressInput = document.querySelector('input[placeholder*="Apoquindo"]') as HTMLInputElement;
    if (addressInput) {
      const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        types: ['address'],
        componentRestrictions: { country: 'cl' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const placeLat = place.geometry.location.lat();
        const placeLng = place.geometry.location.lng();
        
        this.updateLocation(placeLat, placeLng);
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);

        // Actualizar dirección
        this.propertyForm.patchValue({
          address: place.formatted_address || place.name
        });

        // Extraer comuna
        if (place.address_components) {
          for (const component of place.address_components) {
            const types = component.types;
            if (types.includes('administrative_area_level_3') || types.includes('locality')) {
              this.propertyForm.patchValue({
                commune: component.long_name
              });
              break;
            }
          }
        }
      });
    }
  }

  updateLocation(lat: number, lng: number) {
    this.marker.setPosition({ lat, lng });
    this.propertyForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 5) {
      alert('Solo puedes seleccionar un máximo de 5 fotografías. Se guardarán las primeras 5.');
      this.selectedFiles = files.slice(0, 5);
    } else {
      this.selectedFiles = files;
    }
  }

  async onSubmit() {
    if (this.propertyForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    if (!this.isEditMode && this.selectedFiles.length === 0) {
      this.errorMessage = 'Es obligatorio subir al menos una fotografía.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const email = this.authService.currentUser()?.email;
      if (!email) throw new Error('Usuario no autenticado');

      let photoUrls = this.existingPhotos;
      if (this.selectedFiles.length > 0) {
        photoUrls = await this.propertyService.uploadPropertyPhotos(email, this.selectedFiles);
      }

      const propertyData = {
        ...this.propertyForm.value,
        photos: photoUrls,
        updatedAt: new Date().toISOString()
      };

      if (this.isEditMode && this.editPropertyId) {
        await this.propertyService.updateProperty(this.editPropertyId, propertyData);
      } else {
        await this.propertyService.addProperty({
          ...propertyData,
          brokerEmail: email,
          status: 'disponible',
          createdAt: new Date().toISOString()
        });
      }

      this.router.navigate(['/panel/propiedades']);
    } catch (error) {
      console.error('Error al guardar:', error);
      this.errorMessage = 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.';
    } finally {
      this.isSaving = false;
    }
  }
}
