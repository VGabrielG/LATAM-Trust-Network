import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService, Property } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

interface DocType {
  key: string;
  name: string;
  institution: string;
  description: string;
}

@Component({
  selector: 'app-property-documents',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="docs-page-container">
      <div class="docs-header">
        <a routerLink="/panel/propiedades" class="btn-back">← Volver a Mis Propiedades</a>
        <div class="property-meta" *ngIf="property">
          <span class="mono text-accent">Gestor de Documentos | ID de Propiedad: {{ property.id }}</span>
          <h2>Documentos de: {{ property.title }}</h2>
          <p class="mono-text subtitle">{{ property.address }} &bull; {{ property.commune }}</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="mono">Cargando Registro de Documentos...</p>
      </div>

      <div *ngIf="!isLoading && property" class="docs-content animate-fade-in">
        
        <!-- SECTION 1: Standard Legal Documents (Estudio de Títulos) -->
        <div class="docs-section">
          <div class="section-header">
            <h3 class="mono">Estudio de Títulos: Documentos Requeridos</h3>
            <p>Documentos obligatorios para la revisión legal y comercial del inmueble.</p>
          </div>

          <div class="docs-grid">
            <div class="doc-card" *ngFor="let docType of standardDocTypes" [class.has-file]="hasDocument(docType.key)">
              <div class="doc-card-body">
                <div class="doc-info">
                  <span class="mono doc-institution">{{ docType.institution }}</span>
                  <h4 class="doc-name">{{ docType.name }}</h4>
                  <p class="doc-desc">{{ docType.description }}</p>
                </div>

                <!-- State: File Uploaded -->
                <div class="doc-state-uploaded" *ngIf="getDocument(docType.key) as docFile">
                  <div class="file-meta">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                      <a [href]="docFile.url" target="_blank" class="file-link mono">Ver Documento</a>
                      <span class="upload-date">Subido: {{ docFile.uploadedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                  <button (click)="deleteStandardDocument(docType.key)" [disabled]="isActionSaving" class="btn-delete-doc mono">
                    Eliminar
                  </button>
                </div>

                <!-- State: File Not Uploaded -->
                <div class="doc-state-empty" *ngIf="!getDocument(docType.key)">
                  <span class="status-badge-empty mono">Carga Pendiente</span>
                  <div class="file-input-wrapper">
                    <input type="file" (change)="onStandardFileSelected($event, docType.key)" class="file-input-hidden" [id]="docType.key" [disabled]="isActionSaving">
                    <label [for]="docType.key" class="btn-upload-label mono">
                      {{ uploadingKeys.has(docType.key) ? 'Subiendo...' : 'Subir Archivo' }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Extra / Additional Documents -->
        <div class="docs-section extra-section">
          <div class="section-header">
            <h3 class="mono">Documentos Adicionales: Registro Personalizado</h3>
            <p>Documentos adicionales de la propiedad (estudios de suelo, planos, contratos de arriendo, promesas, etc.)</p>
          </div>

          <div class="extra-docs-container">
            <!-- Form to add extra document -->
            <div class="upload-extra-card">
              <h4 class="mono">Agregar Nuevo Documento</h4>
              <div class="form-group">
                <label class="mono">Nombre del Documento</label>
                <input type="text" [(ngModel)]="extraDocName" placeholder="Ej: Contrato de Promesa de Compraventa" class="form-control">
              </div>
              <div class="form-group">
                <label class="mono">Seleccionar Archivo</label>
                <input type="file" (change)="onExtraFileSelected($event)" class="form-control file-input-field">
              </div>
              <button (click)="uploadExtraDocument()" [disabled]="!extraDocName || !extraFileSelected || isActionSaving" class="btn-primary-tech w-full mono">
                {{ isExtraUploading ? 'Subiendo...' : 'Registrar Documento' }}
              </button>
            </div>

            <!-- List of extra documents -->
            <div class="extra-docs-list">
              <h4 class="mono">Documentos Adicionales Registrados</h4>
              
              <div class="empty-extra-state" *ngIf="!property.extraDocuments || property.extraDocuments.length === 0">
                <p class="mono-text">No se encontraron documentos adicionales</p>
                <span>Sube contratos, tasaciones u otros archivos de utilidad comercial.</span>
              </div>

              <div class="extra-list-grid" *ngIf="property.extraDocuments && property.extraDocuments.length > 0">
                <div class="extra-doc-item" *ngFor="let docFile of property.extraDocuments; let idx = index">
                  <div class="extra-info">
                    <span class="file-icon">📄</span>
                    <div class="extra-details">
                      <span class="extra-name">{{ docFile.name }}</span>
                      <span class="upload-date">Subido: {{ docFile.uploadedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                  <div class="extra-actions">
                    <a [href]="docFile.url" target="_blank" class="btn-view-doc-small mono">Ver</a>
                    <button (click)="deleteExtraDocument(idx)" [disabled]="isActionSaving" class="btn-delete-doc-small mono">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .docs-page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 10px 0 50px 0;
    }

    .docs-header {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1.5rem;
    }

    .btn-back {
      align-self: flex-start;
      color: #4b5563;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .btn-back:hover {
      color: #111827;
    }

    .property-meta h2 {
      margin: 0.5rem 0 0.2rem 0;
      color: #1f2937;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .subtitle {
      color: #6b7280;
      font-size: 0.9rem;
      margin: 0;
    }

    .docs-section {
      margin-bottom: 3.5rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
      border-left: 3px solid #1f2937;
      padding-left: 1rem;
    }
    .section-header h3 {
      margin: 0 0 0.2rem 0;
      font-size: 1.05rem;
      color: #111827;
      letter-spacing: 1px;
    }
    .section-header p {
      margin: 0;
      font-size: 0.88rem;
      color: #6b7280;
    }

    /* Required Documents Grid */
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .doc-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .doc-card.has-file {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .doc-info {
      margin-bottom: 1.2rem;
    }

    .doc-institution {
      font-size: 0.65rem;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .doc-name {
      margin: 0.25rem 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #1f2937;
    }

    .doc-desc {
      margin: 0;
      font-size: 0.8rem;
      color: #6b7280;
      line-height: 1.4;
    }

    /* State Actions */
    .doc-state-uploaded {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid #e5e7eb;
      padding-top: 0.8rem;
      gap: 1rem;
    }
    .doc-card.has-file .doc-state-uploaded {
      border-top-color: #a7f3d0;
    }

    .file-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .file-icon {
      font-size: 1.5rem;
    }
    .file-details {
      display: flex;
      flex-direction: column;
    }
    .file-link {
      font-size: 0.75rem;
      font-weight: 700;
      color: #10b981;
      text-decoration: none;
    }
    .file-link:hover {
      text-decoration: underline;
    }
    .upload-date {
      font-size: 0.65rem;
      color: #9ca3af;
      margin-top: 2px;
    }

    .btn-delete-doc {
      background: transparent;
      border: 1px solid #fca5a5;
      color: #ef4444;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-delete-doc:hover:not(:disabled) {
      background: #fee2e2;
      border-color: #ef4444;
    }
    .btn-delete-doc:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .doc-state-empty {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid #e5e7eb;
      padding-top: 0.8rem;
    }

    .status-badge-empty {
      font-size: 0.7rem;
      font-weight: 700;
      color: #ef4444;
    }

    .file-input-wrapper {
      position: relative;
      overflow: hidden;
      display: inline-block;
    }

    .file-input-hidden {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }

    .btn-upload-label {
      background: #1f2937;
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-block;
      transition: background-color 0.2s;
    }
    .btn-upload-label:hover {
      background: #374151;
    }

    /* SECTION 2: Extra Documents layout */
    .extra-docs-container {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .extra-docs-container {
        grid-template-columns: 1fr;
      }
    }

    .upload-extra-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .upload-extra-card h4 {
      margin: 0 0 1.2rem 0;
      font-size: 0.85rem;
      color: #111827;
      letter-spacing: 1px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.2rem;
    }
    .form-group label {
      font-size: 0.65rem;
      color: #4b5563;
      letter-spacing: 1px;
    }
    .form-control {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.85rem;
      font-family: inherit;
    }
    .form-control:focus {
      outline: none;
      border-color: #1f2937;
    }
    .file-input-field {
      padding: 5px;
    }

    .btn-primary-tech {
      background: #1f2937;
      color: white;
      border: none;
      padding: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .btn-primary-tech:hover:not(:disabled) {
      background: #374151;
    }
    .btn-primary-tech:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .w-full {
      width: 100%;
    }

    .extra-docs-list {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .extra-docs-list h4 {
      margin: 0 0 1.2rem 0;
      font-size: 0.85rem;
      color: #111827;
      letter-spacing: 1px;
    }

    .empty-extra-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #9ca3af;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
    }
    .empty-extra-state p {
      margin: 0 0 5px 0;
      font-size: 0.8rem;
      color: #4b5563;
    }
    .empty-extra-state span {
      font-size: 0.75rem;
    }

    .extra-list-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .extra-doc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      transition: border-color 0.2s;
    }
    .extra-doc-item:hover {
      border-color: #cbd5e1;
    }

    .extra-info {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      max-width: 70%;
    }
    .extra-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .extra-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .extra-actions {
      display: flex;
      gap: 8px;
    }
    .btn-view-doc-small {
      color: #1f2937;
      border: 1px solid #cbd5e1;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-view-doc-small:hover {
      background: #f1f5f9;
    }
    .btn-delete-doc-small {
      color: #dc2626;
      border: 1px solid #fecaca;
      background: transparent;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-delete-doc-small:hover:not(:disabled) {
      background: #fee2e2;
    }

    /* Common states */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 5rem 0;
      color: #6b7280;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 2px solid #e5e7eb;
      border-top-color: #1f2937;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
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
export class PropertyDocumentsComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  property: Property | null = null;
  isLoading = true;
  isActionSaving = false;
  
  // File uploading states
  uploadingKeys: Set<string> = new Set();

  // Additional document form state
  extraDocName = '';
  extraFileSelected: File | null = null;
  isExtraUploading = false;

  standardDocTypes: DocType[] = [
    {
      key: 'dominioVigente',
      name: 'Dominio Vigente con copia de inscripción',
      institution: 'Conservador de Bienes Raíces (CBR)',
      description: 'Acredita quién es el actual dueño legítimo de la propiedad.'
    },
    {
      key: 'hipotecasGravamenes',
      name: 'Certificado de Hipotecas y Gravámenes (GP)',
      institution: 'Conservador de Bienes Raíces (CBR)',
      description: 'Valida si el inmueble posee deudas, hipotecas vigentes, prohibiciones o litigios.'
    },
    {
      key: 'recepcionFinal',
      name: 'Certificado de Recepción Final',
      institution: 'Dirección de Obras Municipales (DOM)',
      description: 'Certifica que la construcción está completamente regularizada e inspeccionada.'
    },
    {
      key: 'noExpropiacionDom',
      name: 'Certificado de No Expropiación Municipal',
      institution: 'Dirección de Obras Municipales (DOM)',
      description: 'Valida que el terreno no esté afecto a expropiaciones municipales.'
    },
    {
      key: 'noExpropiacionServiu',
      name: 'Certificado de No Expropiación SERVIU',
      institution: 'SERVIU',
      description: 'Indica si la propiedad está afecta a expropiación por el Estado.'
    },
    {
      key: 'deudasContribuciones',
      name: 'Certificado de Deudas de Contribuciones / Aseo',
      institution: 'Tesorería General de la República (TGR)',
      description: 'Acredita que los impuestos territoriales y municipales de la propiedad están al día.'
    },
    {
      key: 'avalueFiscal',
      name: 'Certificado de Avalúo Fiscal',
      institution: 'Servicio de Impuestos Internos (SII)',
      description: 'Muestra el avalúo oficial e indica si el inmueble está exento de contribuciones.'
    },
    {
      key: 'informesPrevios',
      name: 'Certificado de Informes Previos (CIP)',
      institution: 'Dirección de Obras Municipales (DOM)',
      description: 'Obligatorio para terrenos y propiedades comerciales. Detalla normas urbanísticas.'
    },
    {
      key: 'estadoCivil',
      name: 'Certificado de Estado Civil',
      institution: 'Registro Civil',
      description: 'Verifica el estado civil del propietario (fundamental para la firma del cónyuge).'
    }
  ];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadProperty(id);
    }
  }

  async loadProperty(id: string) {
    this.isLoading = true;
    try {
      this.property = await this.propertyService.getProperty(id);
      if (this.property) {
        // Enforce structures if missing
        if (!this.property.documents) this.property.documents = {};
        if (!this.property.extraDocuments) this.property.extraDocuments = [];
      }
    } catch (error) {
      console.error('Error cargando propiedad para documentos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  hasDocument(key: string): boolean {
    return !!(this.property?.documents && this.property.documents[key]);
  }

  getDocument(key: string) {
    return this.property?.documents ? this.property.documents[key] : null;
  }

  async onStandardFileSelected(event: any, key: string) {
    const file = event.target.files[0];
    if (!file || !this.property || !this.property.id) return;

    this.uploadingKeys.add(key);
    this.isActionSaving = true;

    try {
      const email = this.authService.currentUser()?.email || 'corredor';
      const fileUrl = await this.propertyService.uploadPropertyDocument(email, this.property.id, file);
      
      const updatedDocs = {
        ...this.property.documents,
        [key]: {
          name: file.name,
          url: fileUrl,
          uploadedAt: new Date().toISOString()
        }
      };

      await this.propertyService.updateProperty(this.property.id, {
        documents: updatedDocs
      });

      this.property.documents = updatedDocs;
    } catch (error) {
      console.error(`Error al subir documento standard ${key}:`, error);
      alert('Hubo un error al subir el documento.');
    } finally {
      this.uploadingKeys.delete(key);
      this.isActionSaving = false;
      // Reset input element
      event.target.value = '';
    }
  }

  async deleteStandardDocument(key: string) {
    if (!this.property || !this.property.id || !this.property.documents) return;
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    this.isActionSaving = true;
    try {
      const updatedDocs = { ...this.property.documents };
      delete updatedDocs[key];

      await this.propertyService.updateProperty(this.property.id, {
        documents: updatedDocs
      });

      this.property.documents = updatedDocs;
    } catch (error) {
      console.error(`Error al eliminar documento ${key}:`, error);
      alert('Hubo un error al eliminar el documento.');
    } finally {
      this.isActionSaving = false;
    }
  }

  onExtraFileSelected(event: any) {
    this.extraFileSelected = event.target.files[0];
  }

  async uploadExtraDocument() {
    if (!this.property || !this.property.id || !this.extraFileSelected || !this.extraDocName) return;

    this.isExtraUploading = true;
    this.isActionSaving = true;

    try {
      const email = this.authService.currentUser()?.email || 'corredor';
      const fileUrl = await this.propertyService.uploadPropertyDocument(email, this.property.id, this.extraFileSelected);
      
      const currentExtras = this.property.extraDocuments || [];
      const updatedExtras = [
        ...currentExtras,
        {
          name: this.extraDocName,
          url: fileUrl,
          uploadedAt: new Date().toISOString()
        }
      ];

      await this.propertyService.updateProperty(this.property.id, {
        extraDocuments: updatedExtras
      });

      this.property.extraDocuments = updatedExtras;
      
      // Reset form fields
      this.extraDocName = '';
      this.extraFileSelected = null;
      // Clear file input
      const fileField = document.querySelector('.file-input-field') as HTMLInputElement;
      if (fileField) fileField.value = '';

    } catch (error) {
      console.error('Error al subir documento extra:', error);
      alert('Hubo un error al subir el documento adicional.');
    } finally {
      this.isExtraUploading = false;
      this.isActionSaving = false;
    }
  }

  async deleteExtraDocument(index: number) {
    if (!this.property || !this.property.id || !this.property.extraDocuments) return;
    if (!confirm('¿Estás seguro de eliminar este documento adicional?')) return;

    this.isActionSaving = true;
    try {
      const updatedExtras = [...this.property.extraDocuments];
      updatedExtras.splice(index, 1);

      await this.propertyService.updateProperty(this.property.id, {
        extraDocuments: updatedExtras
      });

      this.property.extraDocuments = updatedExtras;
    } catch (error) {
      console.error('Error al eliminar documento adicional:', error);
      alert('Hubo un error al eliminar el documento.');
    } finally {
      this.isActionSaving = false;
    }
  }
}
