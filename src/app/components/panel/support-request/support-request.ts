import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { PropertyService, Property } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';

interface SupportRequest {
  id?: string;
  brokerEmail: string;
  propertyId: string;
  propertyTitle: string;
  serviceType: string;
  details: string;
  status: 'Pendiente' | 'En Revisión' | 'Resuelto';
  createdAt: string;
}

@Component({
  selector: 'app-support-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="support-container animate-fade-in">
      <div class="header-section">
        <h2>Asesoría y Soporte Profesional</h2>
        <p>Solicita estudios de títulos a nuestros abogados, tasaciones a arquitectos o apoyo con créditos hipotecarios.</p>
      </div>

      <div class="support-grid">
        <!-- Request Form -->
        <div class="form-box">
          <h3>Nueva Solicitud de Consulta</h3>
          <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="support-form">
            
            <div class="form-group">
              <label>Selecciona una Propiedad *</label>
              <select formControlName="propertyId" class="form-control">
                <option value="">-- Elige una propiedad en portafolio --</option>
                <option *ngFor="let p of myProperties" [value]="p.id">
                  {{ p.title }} ({{ p.commune }})
                </option>
              </select>
              <span class="error-text" *ngIf="requestForm.get('propertyId')?.touched && requestForm.get('propertyId')?.invalid">Debes seleccionar una propiedad.</span>
            </div>

            <div class="form-group">
              <label>Área de Servicio Requerido *</label>
              <select formControlName="serviceType" class="form-control">
                <option value="legal">Estudio de Títulos / Legal (Abogados)</option>
                <option value="tasacion">Arquitectura / Tasación (Arquitectos)</option>
                <option value="hipotecario">Asesoría Financiera / Hipotecario (Ejecutivos)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Detalles de la Consulta / Requerimientos *</label>
              <textarea formControlName="details" rows="5" placeholder="Describe brevemente el caso y qué necesitas resolver. Los profesionales revisarán los documentos cargados en esta propiedad." class="form-control"></textarea>
              <span class="error-text" *ngIf="requestForm.get('details')?.touched && requestForm.get('details')?.invalid">Debes ingresar los detalles.</span>
            </div>

            <div class="document-notice">
              ℹ️ **Nota de Documentación**: Los abogados y arquitectos asociados tendrán acceso directo a la carpeta de documentos de la propiedad seleccionada para emitir informes rápidos.
            </div>

            <button type="submit" [disabled]="requestForm.invalid || isSaving" class="btn-submit">
              {{ isSaving ? 'ENVIANDO...' : 'ENVIAR SOLICITUD A PROFESIONALES' }}
            </button>
          </form>
        </div>

        <!-- Request List / History -->
        <div class="history-box">
          <h3>Historial de Solicitudes</h3>
          
          <div *ngIf="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando historial de consultas...</p>
          </div>

          <div *ngIf="!isLoading && requests.length === 0" class="empty-state">
            <p>Aún no has ingresado solicitudes de asesoría técnica o legal.</p>
          </div>

          <div class="requests-list" *ngIf="!isLoading && requests.length > 0">
            <div class="request-item-card" *ngFor="let r of requests">
              <div class="card-top">
                <span class="badge-service" [ngClass]="r.serviceType">{{ getServiceLabel(r.serviceType) }}</span>
                <span class="badge-status" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
              </div>
              <h4 class="property-link">Propiedad: {{ r.propertyTitle }}</h4>
              <p class="details-text">{{ r.details }}</p>
              <span class="date-text">Solicitado: {{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .support-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 2.5rem;
    }

    .header-section h2 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.8rem;
    }

    .header-section p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .support-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    @media (max-width: 991px) {
      .support-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-box, .history-box {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.15rem;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 0.8rem;
    }

    .support-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #4b5563;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.88rem;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .document-notice {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e3a8a;
      border-radius: 6px;
      padding: 10px;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .btn-submit {
      background: #1f2937;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.88rem;
      letter-spacing: 0.5px;
      transition: background-color 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #374151;
    }

    .btn-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* History & Lists */
    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .request-item-card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1.2rem;
      background: #fafafa;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }

    .badge-service {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .badge-service.legal { background: #fee2e2; color: #991b1b; }
    .badge-service.tasacion { background: #fef3c7; color: #92400e; }
    .badge-service.hipotecario { background: #dcfce7; color: #166534; }

    .badge-status {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
    }

    .badge-status.pendiente { background: #e5e7eb; color: #4b5563; }
    .badge-status.en-revisión { background: #dbeafe; color: #1e40af; }
    .badge-status.resuelto { background: #d1fae5; color: #065f46; }

    .property-link {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1f2937;
    }

    .details-text {
      font-size: 0.82rem;
      color: #4b5563;
      margin: 0 0 0.8rem 0;
      line-height: 1.4;
    }

    .date-text {
      font-size: 0.72rem;
      color: #9ca3af;
    }

    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 0;
      color: #6b7280;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.8rem auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      color: #6b7280;
      font-size: 0.88rem;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SupportRequestComponent implements OnInit {
  requestForm: FormGroup;
  myProperties: Property[] = [];
  requests: SupportRequest[] = [];
  isLoading = true;
  isSaving = false;

  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);

  constructor() {
    this.requestForm = this.fb.group({
      propertyId: ['', Validators.required],
      serviceType: ['legal', Validators.required],
      details: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadProperties();
    await this.loadRequests();
  }

  async loadProperties() {
    const email = this.authService.currentUser()?.email;
    const role = this.authService.userRole();
    if (email) {
      this.myProperties = await this.propertyService.getPropertiesByBroker(email, role);
    }
  }

  async loadRequests() {
    this.isLoading = true;
    const email = this.authService.currentUser()?.email;
    if (!email) return;

    try {
      const db = getFirestore(getApp());
      const colRef = collection(db, 'support_requests');
      const q = query(
        colRef,
        where('brokerEmail', '==', email),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      this.requests = [];
      snap.forEach(doc => {
        this.requests.push({
          id: doc.id,
          ...doc.data()
        } as SupportRequest);
      });
    } catch (e) {
      console.error('Error loading support requests', e);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.requestForm.invalid) return;

    const email = this.authService.currentUser()?.email;
    if (!email) return;

    const { propertyId, serviceType, details } = this.requestForm.value;
    const selectedProp = this.myProperties.find(p => p.id === propertyId);
    if (!selectedProp) return;

    this.isSaving = true;
    try {
      const db = getFirestore(getApp());
      const colRef = collection(db, 'support_requests');
      
      const newRequest: Omit<SupportRequest, 'id'> = {
        brokerEmail: email,
        propertyId: propertyId,
        propertyTitle: selectedProp.title,
        serviceType: serviceType,
        details: details,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      };

      await addDoc(colRef, newRequest);
      
      // Reset form
      this.requestForm.reset({
        propertyId: '',
        serviceType: 'legal',
        details: ''
      });

      // Reload
      await this.loadRequests();
    } catch (e) {
      console.error('Error saving support request', e);
      alert('Hubo un error al enviar la solicitud.');
    } finally {
      this.isSaving = false;
    }
  }

  getServiceLabel(type: string): string {
    switch (type) {
      case 'legal': return 'Legal / Estudio Títulos';
      case 'tasacion': return 'Arquitectura / Tasación';
      case 'hipotecario': return 'Financiera / Hipotecario';
      default: return type;
    }
  }
}
