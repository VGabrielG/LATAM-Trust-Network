import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrokerService, BrokerProfile } from '../../../services/broker.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h2>Mi Perfil de Corredor</h2>

      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div> Cargando perfil...
      </div>

      <ng-container *ngIf="!isLoading">
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">

          <!-- Foto de perfil -->
          <div class="photo-section">
            <div class="photo-wrapper">
              <img [src]="photoUrl || 'https://ui-avatars.com/api/?name=' + (profileForm.get('name')?.value || 'Corredor') + '&background=1f2937&color=fff&size=120'" alt="Foto de perfil" class="profile-photo">
              <label for="photo" class="photo-overlay" title="Cambiar foto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
              <input type="file" id="photo" (change)="onFileSelected($event)" accept="image/*" hidden>
            </div>
            <div class="photo-info">
              <p class="photo-name">{{ profileForm.get('name')?.value || 'Tu nombre aquí' }}</p>
              <p class="photo-email">{{ userEmail }}</p>
              <label for="photo" class="btn-change-photo">Cambiar foto</label>
            </div>
          </div>

          <div class="form-divider">Información Personal</div>

          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre Completo</label>
              <input type="text" id="name" formControlName="name" class="form-control" placeholder="Ej: Juan Pérez González">
            </div>
            <div class="form-group">
              <label for="rut">RUT</label>
              <input type="text" id="rut" formControlName="rut" class="form-control" placeholder="Ej: 12.345.678-9">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="company">Empresa / Inmobiliaria</label>
              <input type="text" id="company" formControlName="company" class="form-control" placeholder="Ej: Inmobiliaria del Sur">
            </div>
            <div class="form-group">
              <label for="phone">Teléfono de Contacto</label>
              <input type="tel" id="phone" formControlName="phone" class="form-control" placeholder="+56 9 8765 4321">
            </div>
          </div>

          <div class="form-group">
            <label for="whatsapp">WhatsApp (para contacto desde la web)</label>
            <div class="input-with-prefix">
              <span class="prefix">+56</span>
              <input type="tel" id="whatsapp" formControlName="whatsapp" class="form-control" placeholder="9 8765 4321">
            </div>
          </div>

          <div class="form-divider">Acerca de Ti</div>

          <div class="form-group">
            <label for="bio">Biografía Profesional</label>
            <textarea id="bio" formControlName="bio" rows="5" class="form-control" placeholder="Cuéntales a tus clientes quién eres, tu experiencia y especialidad..."></textarea>
            <span class="hint">Esta información aparecerá públicamente en tu perfil de corredor.</span>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn-save">
              <svg *ngIf="!isSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span class="spinner-sm" *ngIf="isSaving"></span>
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>

          <div *ngIf="successMessage" class="alert success">✅ {{ successMessage }}</div>
          <div *ngIf="errorMessage" class="alert error">❌ {{ errorMessage }}</div>
        </form>
      </ng-container>
    </div>
  `,
  styles: [`
    .profile-container {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      max-width: 700px;
      margin: 0 auto;
    }
    h2 { margin-top: 0; margin-bottom: 28px; color: #1f2937; font-size: 1.4rem; }

    .loading { display: flex; align-items: center; gap: 12px; color: #6b7280; padding: 40px 0; }
    .spinner { width: 22px; height: 22px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Foto de perfil */
    .photo-section { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; }
    .photo-wrapper { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
    .profile-photo { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #e5e7eb; }
    .photo-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
    .photo-wrapper:hover .photo-overlay { opacity: 1; }
    .photo-info { display: flex; flex-direction: column; gap: 4px; }
    .photo-name { font-size: 1.1rem; font-weight: 700; color: #1f2937; margin: 0; }
    .photo-email { font-size: 0.85rem; color: #9ca3af; margin: 0; }
    .btn-change-photo { display: inline-block; margin-top: 8px; font-size: 0.85rem; color: #1d4ed8; cursor: pointer; font-weight: 500; }
    .btn-change-photo:hover { text-decoration: underline; }

    /* Formulario */
    .profile-form { display: flex; flex-direction: column; gap: 20px; }
    .form-divider { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
    .form-row { display: flex; gap: 20px; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 200px; }
    label { font-weight: 600; color: #374151; font-size: 0.88rem; }
    .form-control { padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-family: inherit; font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s; }
    .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .hint { font-size: 0.78rem; color: #9ca3af; margin-top: 2px; }

    .input-with-prefix { display: flex; }
    .prefix { padding: 10px 12px; background: #f3f4f6; border: 1.5px solid #e5e7eb; border-right: none; border-radius: 8px 0 0 8px; font-size: 0.9rem; color: #6b7280; }
    .input-with-prefix .form-control { border-radius: 0 8px 8px 0; }

    .form-actions { display: flex; justify-content: flex-end; }
    .btn-save { display: flex; align-items: center; gap: 8px; background: #1f2937; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.95rem; transition: background 0.2s; }
    .btn-save:hover { background: #374151; }
    .btn-save:disabled { background: #9ca3af; cursor: not-allowed; }

    .alert { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; }
    .success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brokerService = inject(BrokerService);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  photoUrl: string | null = null;
  selectedFile: File | null = null;
  successMessage = '';
  errorMessage = '';
  userEmail = '';

  constructor() {
    this.profileForm = this.fb.group({
      name: [''],
      rut: [''],
      company: [''],
      phone: [''],
      whatsapp: [''],
      bio: ['']
    });

    // Reactively watch for auth state changes
    effect(() => {
      const email = this.authService.currentUser()?.email;
      if (email && email !== this.userEmail) {
        console.log('ProfileComponent Auth Effect: loading profile for:', email);
        this.userEmail = email;
        this.loadProfile();
      }
    });
  }

  async ngOnInit() {
    console.log('ngOnInit: ProfileComponent initialized');
    const email = this.authService.currentUser()?.email;
    if (email) {
      this.userEmail = email;
      await this.loadProfile();
    }
  }

  async loadProfile() {
    this.isLoading = true;
    console.log('loadProfile: Loading data...');
    try {
      const email = this.authService.currentUser()?.email;
      if (email) {
        const profile = await this.brokerService.getProfile(email);
        console.log('loadProfile: Profile data received', profile);
        if (profile) {
          this.profileForm.patchValue({
            name: profile.name,
            phone: profile.phone,
            bio: profile.bio,
            rut: profile.rut || '',
            company: profile.company || '',
            whatsapp: profile.whatsapp || ''
          });
          this.photoUrl = profile.photoUrl;
        }
      }
    } catch (error) {
      console.error('Error cargando perfil', error);
      this.errorMessage = 'No se pudo cargar el perfil.';
    } finally {
      console.log('loadProfile: Finished');
      this.isLoading = false;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const email = this.authService.currentUser()?.email;
      if (!email) throw new Error('No hay usuario autenticado');

      let newPhotoUrl = this.photoUrl;
      if (this.selectedFile) {
        newPhotoUrl = await this.brokerService.uploadPhoto(email, this.selectedFile);
      }

      const profileData: Partial<BrokerProfile> = {
        ...this.profileForm.value,
        photoUrl: newPhotoUrl || ''
      };

      await this.brokerService.saveProfile(email, profileData);
      console.log('DEBUG: SaveProfile completed');
      // Verify by fetching the saved profile
      const savedProfile = await this.brokerService.getProfile(email);
      console.log('DEBUG: Verified saved profile ->', JSON.stringify(savedProfile));
      // Reload UI with fresh data
      await this.loadProfile();
      this.successMessage = 'Perfil guardado exitosamente.';
      this.selectedFile = null;
    } catch (error) {
      console.error('Error guardando perfil', error);
      this.errorMessage = 'Hubo un error al guardar el perfil.';
    } finally {
      this.isSaving = false;
    }
  }
}
